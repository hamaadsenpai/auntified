import "server-only";
import { io } from "next/cache";
import { FieldValue, Timestamp, type DocumentData, type Transaction } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/constants";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/lib/firebase/admin";
import { buildTransferFacts, scoreRules } from "@/server/check/transfer";
import type { CheckResult } from "@/types/check";
import type { CreateTransfer, Transfer, TransferAppeal, TransferStatus, UpdateTransfer } from "@/types/transfer";
import { MAIN_ACCOUNT_ID } from "@/utils/accounts";
import { readAccount } from "./accounts.repository";

const STATUSES: TransferStatus[] = ["pending", "warned", "passed", "overridden", "blocked", "cancelled", "expired"];

/** How long a transfer can sit pending (since its last edit) before it can no longer be checked or sent. */
const PENDING_TTL_MS = 30 * 60_000;

const userRef = (uid: string) => db.collection(COLLECTIONS.USERS).doc(uid);
const transfersOf = (uid: string) => userRef(uid).collection(COLLECTIONS.TRANSFERS);

/** A path segment from the URL; anything with a slash would address another document. */
function transferRef(uid: string, id: string) {
  if (!id || id.length > 128 || id.includes("/") || id === "." || id === "..") {
    throw ApiError.notFound("Transfer not found.");
  }
  return transfersOf(uid).doc(id);
}

const conflict = (message: string) => new ApiError(409, "CONFLICT", message);
const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate() : new Date(0)).toISOString();
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
const numberOrNull = (v: unknown) => (typeof v === "number" ? v : null);

/**
 * Expiry is worked out on read rather than written back, so it needs no scheduled job. Every read
 * goes through here, but a Firestore query on status "pending" would still match expired transfers.
 */
function statusOf(data: DocumentData): TransferStatus {
  const status: TransferStatus = STATUSES.includes(data.status) ? data.status : "pending";
  const updated = data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 0;
  return status === "pending" && Date.now() - updated > PENDING_TTL_MS ? "expired" : status;
}

function appealOf(v: unknown): TransferAppeal | null {
  const appeal = v as { reason?: unknown; at?: unknown } | null | undefined;
  return typeof appeal?.reason === "string" ? { reason: appeal.reason, at: iso(appeal.at) } : null;
}

/** 409 for a transfer that is no longer pending, saying why. */
export function notPending(t: Transfer, message: string) {
  return conflict(t.status === "expired" ? "This transfer expired before Auntie checked it. Start it again." : message);
}

function toTransfer(id: string, data: DocumentData): Transfer {
  return {
    id,
    payeeId: typeof data.payeeId === "string" ? data.payeeId : "",
    payeeName: typeof data.payeeName === "string" ? data.payeeName : "",
    amountSgd: typeof data.amountSgd === "number" ? data.amountSgd : 0,
    reference: typeof data.reference === "string" ? data.reference : "",
    fromAccountId: typeof data.fromAccountId === "string" ? data.fromAccountId : MAIN_ACCOUNT_ID,
    status: statusOf(data),
    flags: strings(data.flags),
    rulesScore: typeof data.rulesScore === "number" ? data.rulesScore : 0,
    modelScore: numberOrNull(data.modelScore),
    score: numberOrNull(data.score),
    reasons: strings(data.reasons),
    appeal: appealOf(data.appeal),
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
  };
}

type PayingAccount = Awaited<ReturnType<typeof readAccount>>;

/**
 * Sending debits the paying account and counts the transfer on its payee, in the caller's transaction.
 * `from` and `payeeExists` must come from reads in that same transaction (reads go before writes).
 */
function applySend(tx: Transaction, uid: string, t: Transfer, from: PayingAccount, payeeExists: boolean) {
  from.move(-t.amountSgd);
  if (payeeExists) {
    tx.update(userRef(uid).collection(COLLECTIONS.PAYEES).doc(t.payeeId), {
      transferCount: FieldValue.increment(1),
      totalSentSgd: FieldValue.increment(t.amountSgd),
    });
  }
}

/** The paying account; 409 if its balance can't cover the amount. Read in the sending transaction, before its writes. */
async function ensureFunds(tx: Transaction, uid: string, t: Transfer) {
  const from = await readAccount(tx, uid, t.fromAccountId);
  if (t.amountSgd > from.balanceSgd) throw conflict(`Not enough balance in ${from.name} for this transfer.`);
  return from;
}

const payeeExists = async (tx: Transaction, uid: string, payeeId: string) =>
  payeeId !== "" && (await tx.get(userRef(uid).collection(COLLECTIONS.PAYEES).doc(payeeId))).exists;

/** Newest first. `io()` before each read: see `getUserProfile` in users.repository. */
export async function listTransfers(uid: string): Promise<Transfer[]> {
  await io();
  const snap = await transfersOf(uid).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toTransfer(d.id, d.data()));
}

export async function getTransfer(uid: string, id: string): Promise<Transfer | null> {
  await io();
  const snap = await transferRef(uid, id).get();
  return snap.exists ? toTransfer(snap.id, snap.data()!) : null;
}

/** A pending transfer with its rule flags worked out. 404 if the payee doesn't exist. */
export async function createTransfer(uid: string, body: CreateTransfer): Promise<Transfer> {
  const facts = await buildTransferFacts(uid, body);
  const rules = scoreRules(facts);
  const now = Timestamp.now();
  const ref = transfersOf(uid).doc();
  const data = {
    payeeId: body.payeeId,
    payeeName: facts.payeeName,
    amountSgd: body.amountSgd,
    reference: body.reference,
    fromAccountId: body.fromAccountId,
    status: "pending",
    flags: rules.flags,
    rulesScore: rules.score,
    modelScore: null,
    score: null,
    reasons: [],
    appeal: null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(data);
  return toTransfer(ref.id, data);
}

/**
 * Details change only while pending (flags are rescored). "cancelled" from pending or warned;
 * "overridden" (pay anyway) from warned only, and it sends the money. An appeal is recorded
 * once on a blocked transfer and leaves it blocked.
 */
export async function updateTransfer(uid: string, id: string, body: UpdateTransfer): Promise<Transfer> {
  await io();
  const ref = transferRef(uid, id);
  const { status, appealReason, ...details } = body;
  const editing = Object.keys(details).length > 0;

  // Facts need queries, so they're worked out first; the transaction re-checks the status.
  let rescored: DocumentData | null = null;
  if (editing) {
    const current = await getTransfer(uid, id);
    if (!current) throw ApiError.notFound("Transfer not found.");
    if (current.status !== "pending") throw notPending(current, "Only a pending transfer can be edited.");
    const next = { payeeId: current.payeeId, amountSgd: current.amountSgd, reference: current.reference, fromAccountId: current.fromAccountId, ...details };
    const facts = await buildTransferFacts(uid, next);
    const rules = scoreRules(facts);
    rescored = { ...next, payeeName: facts.payeeName, flags: rules.flags, rulesScore: rules.score };
  }

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw ApiError.notFound("Transfer not found.");
    const current = toTransfer(id, snap.data()!);
    if (editing && current.status !== "pending") throw notPending(current, "Only a pending transfer can be edited.");
    if (status === "cancelled" && current.status !== "pending" && current.status !== "warned") {
      throw notPending(current, "This transfer can no longer be cancelled.");
    }
    if (status === "overridden" && current.status !== "warned") {
      throw conflict("Only a held transfer can be sent anyway.");
    }
    if (appealReason !== undefined && current.status !== "blocked") throw conflict("Only a blocked transfer can be appealed.");
    if (appealReason !== undefined && current.appeal) throw conflict("This block has already been appealed.");

    const from = status === "overridden" ? await ensureFunds(tx, uid, current) : null;
    const payeeFound = status === "overridden" && (await payeeExists(tx, uid, current.payeeId));
    const now = Timestamp.now();
    const changes = {
      ...rescored,
      ...(status && { status }),
      ...(appealReason !== undefined && { appeal: { reason: appealReason, at: now } }),
      updatedAt: now,
    };
    const updated = toTransfer(id, { ...snap.data(), ...changes });
    tx.update(ref, changes);
    if (from) applySend(tx, uid, updated, from, payeeFound);
    return updated;
  });
}

/** Removes the record only; a sent transfer's debit stays. */
export async function deleteTransfer(uid: string, id: string): Promise<{ id: string }> {
  await io();
  const ref = transferRef(uid, id);
  const snap = await ref.get();
  if (!snap.exists) throw ApiError.notFound("Transfer not found.");
  await ref.delete();
  return { id };
}

const OUTCOME: Record<CheckResult["verdict"], TransferStatus> = { pass: "passed", warn: "warned", block: "blocked" };

/** Writes Auntie's verdict onto a pending transfer. A pass sends the money. */
export async function saveCheckOutcome(uid: string, id: string, result: CheckResult): Promise<Transfer> {
  await io();
  const ref = transferRef(uid, id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw ApiError.notFound("Transfer not found.");
    const current = toTransfer(id, snap.data()!);
    if (current.status !== "pending") throw notPending(current, "This transfer has already been checked.");

    const status = OUTCOME[result.verdict];
    const from = status === "passed" ? await ensureFunds(tx, uid, current) : null;
    const payeeFound = status === "passed" && (await payeeExists(tx, uid, current.payeeId));
    const changes = {
      status,
      flags: result.flags,
      rulesScore: result.rulesScore,
      modelScore: result.modelScore,
      score: result.score,
      reasons: result.reasons,
      updatedAt: Timestamp.now(),
    };
    const updated = toTransfer(id, { ...snap.data(), ...changes });
    tx.update(ref, changes);
    if (from) applySend(tx, uid, updated, from, payeeFound);
    return updated;
  });
}

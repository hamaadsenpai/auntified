"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomNav, Screen } from "@/components/layout";
import { Avatar, Button, Input, Tag } from "@/components/ui";
import { LIMITS, ROUTES, withTransfer } from "@/constants";
import { PayeeForm } from "@/features/payees/PayeeForm";
import { usePayees, usePayeesStore, useTransfersStore } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import type { ApiFailure } from "@/types/api";
import type { CreatePayee, Payee } from "@/types/payee";
import type { CreateTransfer, Transfer } from "@/types/transfer";
import { AmountPad } from "./AmountPad";

const DAY_MS = 24 * 60 * 60 * 1000;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

/** Added in the last day and never paid. */
export const isNewPayee = (p: Payee) => p.transferCount === 0 && Date.now() - Date.parse(p.createdAt) < DAY_MS;

export const transfersLabel = (n: number) => `${n} transfer${n === 1 ? "" : "s"}`;

/** Adds a payee from the inline form and picks it for this transfer. Throws ApiFailure["error"] for the form. */
export async function addPayeeToDraft(body: CreatePayee) {
  const payee = await usePayeesStore.getState().create(body);
  usePayDraftStore.getState().setPayee(payee.id);
}

/**
 * Edits the draft's pending transfer when it has one, so going back from review and continuing
 * again doesn't leave a second pending transfer behind. Creates a new one once that transfer has
 * been checked, cancelled, expired or removed.
 */
async function saveDraftTransfer(transferId: string | null, body: CreateTransfer): Promise<Transfer> {
  const transfers = useTransfersStore.getState();
  const known = transferId ? transfers.items.find((t) => t.id === transferId) : undefined;
  if (transferId && (!known || known.status === "pending")) {
    try {
      return await transfers.update(transferId, body);
    } catch (err) {
      const { code } = err as ApiFailure["error"];
      if (code !== "CONFLICT" && code !== "NOT_FOUND") throw err;
      // The store's copy is out of date; refresh it so history shows what happened to it.
      void transfers.fetchOne(transferId).catch(() => {});
    }
  }
  return transfers.create(body);
}

/** Validates the draft, saves the pending transfer and opens `route` for it. Shared by both layouts. */
export function useSubmitDraft() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(route: string) {
    const { transferId, payeeId, amountSgd, reference } = usePayDraftStore.getState();
    if (!payeeId) return setError("Choose who you are paying first.");
    if (!(amountSgd > 0)) return setError("Enter an amount more than zero.");
    setPending(true);
    setError(null);
    try {
      const transfer = await saveDraftTransfer(transferId, { payeeId, amountSgd, reference: reference.trim() });
      usePayDraftStore.getState().setTransferId(transfer.id);
      router.push(withTransfer(route, transfer.id));
    } catch (err) {
      setError((err as ApiFailure["error"]).message);
      setPending(false);
    }
  }

  function cancel() {
    usePayDraftStore.getState().reset();
    router.push(ROUTES.HOME);
  }

  return { submit, cancel, pending, error };
}

export function PayScreen() {
  const { items, status, error, load } = usePayees();
  const payeeId = usePayDraftStore((s) => s.payeeId);
  const reference = usePayDraftStore((s) => s.reference);
  const [adding, setAdding] = useState(false);
  const draft = useSubmitDraft();
  const selected = items.find((p) => p.id === payeeId);

  return (
    <Screen className="lg:hidden">
      <header className="flex h-[64px] flex-none items-center px-[20px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Send money</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto px-[20px] pb-[12px] *:shrink-0">
        <AmountPad>
        <div className="flex min-h-[64px] items-center gap-[12px] rounded-[20px] border-[2.5px] border-ink bg-white px-[12px] py-[10px] shadow-hard-sm">
          <Avatar
            initials={selected ? initials(selected.name) : "?"}
            size={40}
            className="flex-none bg-track text-[14px] text-teal"
          />
          <span className="flex flex-1 flex-col gap-[2px]">
            <span className="text-[12px] font-medium text-muted">To</span>
            <span className="text-[16px] font-semibold">{selected ? selected.name : "Choose a payee"}</span>
          </span>
          {selected && isNewPayee(selected) && (
            <Tag variant="outline" className="px-[8px]">
              New
            </Tag>
          )}
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-[13px] font-semibold text-muted">Recent payees</span>
          {status === "error" ? (
            <div role="alert" className="flex flex-col items-start gap-[8px]">
              <p className="m-0 text-[14px] font-semibold">{error}</p>
              <Button variant="secondary" className="h-[44px] px-[18px]" onClick={() => void load(true)}>
                Try again
              </Button>
            </div>
          ) : items.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-4 gap-[8px] p-0">
              {items.map((p) => {
                const isSelected = p.id === payeeId;
                const isNew = isNewPayee(p);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => usePayDraftStore.getState().setPayee(p.id)}
                      className="flex min-h-[72px] w-full cursor-pointer flex-col items-center gap-[6px] border-none bg-none px-[6px] py-[1px]"
                    >
                      <Avatar
                        initials={initials(p.name)}
                        size={44}
                        className={
                          isSelected
                            ? "bg-track text-[14px] text-teal shadow-[0_0_0_2px_white,0_0_0_4px_var(--color-teal)]"
                            : "bg-mint text-[14px]"
                        }
                      />
                      <span className="max-w-full truncate text-[13px] font-semibold">
                        {p.name}
                        {isNew && (
                          <>
                            {" "}
                            <span className="text-[10px] font-bold tracking-[.06em] uppercase">New</span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : status === "ready" ? (
            <p className="m-0 text-[14px] font-medium text-muted">No payees yet. Add a payee below to send your first transfer.</p>
          ) : (
            <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
          )}
          {adding ? (
            <PayeeForm
              submitLabel="Add payee"
              onSubmit={async (body) => {
                await addPayeeToDraft(body);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex min-h-[44px] cursor-pointer items-center self-start border-none bg-none p-0 text-[14px] font-semibold text-teal"
            >
              Add a payee
            </button>
          )}
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="ref" className="text-[13px] font-semibold text-muted">
            Reference
          </label>
          <Input
            id="ref"
            maxLength={LIMITS.REFERENCE}
            placeholder="What it's for"
            value={reference}
            onChange={(e) => usePayDraftStore.getState().setReference(e.target.value)}
          />
        </div>
        </AmountPad>
        {draft.error && (
          <p role="alert" className="m-0 text-[14px] font-semibold text-brick">
            {draft.error}
          </p>
        )}
        <Button onClick={() => void draft.submit(ROUTES.PAY_REVIEW)} disabled={draft.pending} className="disabled:opacity-50">
          {draft.pending ? "Creating transfer…" : "Review transfer"}
        </Button>
      </main>
      <BottomNav active="pay" />
    </Screen>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Screen } from "@/components/layout";
import { ROUTES } from "@/constants";
import { useTransfers, useTransfersStore } from "@/store";
import { VerdictDesktop } from "./VerdictDesktop";

const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** "11 Oct 23:52". Pass a separator for "11 Oct, 23:52". */
export function formatWhen(iso: string, separator = " "): string {
  const date = new Date(iso);
  return `${DAY.format(date)}${separator}${TIME.format(date)}`;
}

/**
 * The transfer named by `?id`, from the transfers store. Fetches it when the store has no copy,
 * or only the pending one from before Auntie's verdict.
 */
export function useTransferParam() {
  const id = useSearchParams().get("id");
  const { items } = useTransfers();
  const transfer = id ? items.find((t) => t.id === id) : undefined;
  const [failedId, setFailedId] = useState<string | null>(null);
  const stale = !transfer || transfer.status === "pending";

  useEffect(() => {
    if (!id || !stale) return;
    useTransfersStore
      .getState()
      .fetchOne(id)
      .catch(() => setFailedId(id));
  }, [id, stale]);

  return { id, transfer, missing: !id || (!transfer && failedId === id) };
}

/** Shown while the transfer loads, or when the link has no transfer behind it. */
export function TransferFallback({ missing }: { missing: boolean }) {
  const body = missing ? (
    <>
      <p className="m-0 font-display text-[18px] font-bold">We could not find this payment.</p>
      <Link href={ROUTES.HOME} className="text-[15px] font-semibold text-teal">
        Back to home
      </Link>
    </>
  ) : (
    <p className="m-0 text-[14px] font-medium text-muted">Loading…</p>
  );
  return (
    <>
      <VerdictDesktop>
        <div className="flex flex-1 flex-col items-center justify-center gap-[12px] text-center">{body}</div>
      </VerdictDesktop>
      <Screen className="lg:hidden">
        <main className="flex flex-1 flex-col items-center justify-center gap-[12px] px-[20px] text-center">{body}</main>
      </Screen>
    </>
  );
}

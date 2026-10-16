"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import { MessageVerdict } from "@/features/verdicts";
import { smsService } from "@/services/sms.service";
import type { CheckVerdict } from "@/types/check";
import type { SmsScan } from "@/types/sms";
import { cn, errorMessage } from "@/utils";

const DOT: Record<CheckVerdict, string> = { block: "bg-brick", warn: "bg-sun", pass: "bg-mint" };
const LABEL: Record<CheckVerdict, string> = { block: "Scam", warn: "Suspicious", pass: "Looks fine" };

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** Texts the iPhone Shortcut forwarded, loaded once for the page (mobile and desktop both render). */
export function useSmsHistory() {
  const [scans, setScans] = useState<SmsScan[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    smsService.scans().then(setScans, () => setFailed(true));
  }, []);

  async function remove(id: string) {
    if (!window.confirm("Delete this checked text?")) return;
    try {
      await smsService.removeScan(id);
      setScans((all) => all?.filter((s) => s.id !== id) ?? null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return { scans, failed, remove };
}

type History = ReturnType<typeof useSmsHistory>;

function Row({ scan, onRemove }: { scan: SmsScan; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex flex-col gap-[10px] border-b border-line py-[10px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer flex-col gap-[4px] border-none bg-transparent p-0 text-left text-night"
      >
        <span className="flex w-full items-center gap-[8px]">
          <span aria-hidden className={cn("size-[10px] flex-none rounded-full border-[1.5px] border-ink", DOT[scan.verdict])} />
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{scan.sender ?? "Unknown sender"}</span>
          <span className="flex-none text-[13px] font-semibold">
            {LABEL[scan.verdict]} · {scan.score}
          </span>
        </span>
        <span className="line-clamp-2 text-[13px] leading-[1.4] font-medium text-muted">{scan.preview}</span>
        <span className="text-[12px] font-medium text-muted">{formatWhen(scan.receivedAt)}</span>
      </button>
      {open && (
        <>
          <MessageVerdict result={scan} />
          <button
            type="button"
            onClick={onRemove}
            className="min-h-[44px] cursor-pointer self-start border-none bg-transparent p-0 text-[14px] font-semibold text-brick"
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}

/** "Texts Auntie checked": what the iPhone Shortcut forwarded, newest first. Tap one for the full verdict. */
export function SmsHistory({ history }: { history: History }) {
  const { scans, failed, remove } = history;
  return (
    <section aria-labelledby="sms-history-h" className="flex flex-col gap-[4px]">
      <h2 id="sms-history-h" className="m-0 font-display text-[17px] font-bold">
        Texts Auntie checked
      </h2>
      {failed ? (
        <p className="m-0 text-[14px] font-semibold text-brick">Couldn&apos;t load your checked texts.</p>
      ) : !scans ? (
        <p className="m-0 text-[14px] font-medium text-muted">…</p>
      ) : scans.length === 0 ? (
        <p className="m-0 text-[14px] leading-[1.45] font-medium text-muted">
          Nothing yet. Turn on <Link href={ROUTES.SETTINGS}>iPhone SMS scam check</Link> in Settings and Auntie will check your
          texts as they arrive.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {scans.map((scan) => (
            <Row key={scan.id} scan={scan} onRemove={() => void remove(scan.id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

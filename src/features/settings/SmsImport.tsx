"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ENDPOINTS } from "@/constants";
import { smsService } from "@/services/sms.service";
import type { CreatedSmsKey, SmsKeyStatus } from "@/types/sms";
import { cn, errorMessage } from "@/utils";

type Variant = "mobile" | "desktop";

const ACTION = "min-h-[44px] flex-none cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold disabled:opacity-60";

/** Built and signed by scripts/build-shortcut.mjs. */
const SHORTCUT_FILE = "/auntie-scam-check.shortcut";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="flex flex-col gap-[4px]">
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <div className="flex items-center gap-[8px] rounded-[12px] border-[1.5px] border-line-strong bg-code px-[12px] py-[6px]">
        <code className="min-w-0 flex-1 font-mono text-[12px] break-all">{value}</code>
        <button type="button" onClick={() => void copy()} className={cn(ACTION, "text-teal")}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/**
 * The personal key the iPhone Shortcut sends with each text it forwards for a scam check (POST /api/sms).
 * The key is shown once, right after it's created; after that only its status is.
 */
export function SmsImport({ variant }: { variant: Variant }) {
  const [status, setStatus] = useState<SmsKeyStatus | null>(null);
  const [created, setCreated] = useState<CreatedSmsKey | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    smsService.status().then(setStatus, (err: unknown) => toast.error(errorMessage(err)));
  }, []);

  async function run(action: () => Promise<SmsKeyStatus | CreatedSmsKey>, question?: string) {
    if (question && !window.confirm(question)) return;
    setPending(true);
    try {
      const next = await action();
      setStatus(next);
      setCreated("key" in next ? next : null);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  const create = () =>
    void run(smsService.createKey, status?.active ? "Make a new key? The Shortcut using the old one will stop working." : undefined);
  const revoke = () => void run(smsService.revokeKey, "Turn off SMS scam checks? The Shortcut will stop working.");

  const mobile = variant === "mobile";
  const summary = !status
    ? "…"
    : !status.active
      ? "Off"
      : status.lastUsedAt
        ? `On · last text ${formatWhen(status.lastUsedAt)}`
        : "On · no texts received yet";

  return (
    <div className={cn("flex flex-col gap-[10px]", mobile && "border-b border-line py-[10px]")}>
      <div className="flex items-center justify-between gap-[12px]">
        <span className="flex min-w-0 flex-col gap-[2px]">
          {mobile && <span className="text-[13px] font-medium text-muted">iPhone SMS scam check</span>}
          <span className={cn("font-semibold", mobile ? "text-[16px]" : "text-[15px]")}>{summary}</span>
        </span>
        {status && (
          <span className="flex flex-none items-center gap-[16px]">
            <button type="button" onClick={create} disabled={pending} className={cn(ACTION, "text-teal")}>
              {status.active ? "New key" : "Turn on"}
            </button>
            {status.active && (
              <button type="button" onClick={revoke} disabled={pending} className={cn(ACTION, "text-brick")}>
                Turn off
              </button>
            )}
          </span>
        )}
      </div>
      {created ? (
        <div className="flex flex-col gap-[10px] rounded-[14px] border-[1.5px] border-lemon-edge bg-lemon px-[14px] py-[12px]">
          <span className="text-[13px] leading-[1.45] font-semibold">
            Copy these into your iPhone Shortcut now. The key won&apos;t be shown again.
          </span>
          <CopyField label="URL" value={`${location.origin}${ENDPOINTS.SMS_IMPORT}`} />
          <CopyField label="Authorization header" value={`Bearer ${created.key}`} />
          <span className="text-[13px] leading-[1.45] font-medium">
            On your iPhone, copy both, then{" "}
            <a href={SHORTCUT_FILE} download>
              get the Shortcut
            </a>
            . It asks you to paste them while it installs.
          </span>
        </div>
      ) : (
        <span className="text-[13px] leading-[1.45] font-medium text-muted">
          An iPhone Shortcut forwards your texts and Auntie warns you about scams. Results show on the Scam scanner page.
        </span>
      )}
    </div>
  );
}
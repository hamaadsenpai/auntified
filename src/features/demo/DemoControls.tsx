"use client";

import type { ReactNode } from "react";
import { Button, Select } from "@/components/ui";
import { DEMO_JUMPS } from "@/constants/demo";
import type { DemoAction } from "@/types/demo";
import { cn } from "@/utils";
import { useDemo } from "./DemoProvider";

const BUSY_LABEL: Record<DemoAction["action"], string> = {
  seed: "Seeding…",
  fire: "Firing…",
  jump: "Jumping…",
  reset: "Resetting…",
};

const ACTION_BUTTON = "h-[44px] min-w-[84px] text-[14px] disabled:cursor-default disabled:opacity-60";
const OUTLINE_BUTTON =
  "h-[44px] min-w-[84px] cursor-pointer rounded-[12px] border-[1.5px] border-night bg-white px-[12px] text-[14px] font-semibold text-night disabled:cursor-default disabled:opacity-60";

export function DemoBanner({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-none items-center justify-between gap-[12px] bg-night px-[20px] py-[12px] font-mono text-[12px] font-bold tracking-[.08em] text-white uppercase",
        className,
      )}
    >
      <span>Demo only</span>
      <span className="font-medium tracking-[0] normal-case">Never shown to customers</span>
    </div>
  );
}

export function DemoStats({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const { stats } = useDemo();
  return (
    <dl className={cn("m-0", className)}>
      {stats.map((s) => (
        <div key={s.label} className={cn("flex flex-col gap-[2px]", itemClassName)}>
          <dt className="text-[12px] font-medium text-muted">{s.label}</dt>
          <dd className="m-0 font-mono text-[14px] font-semibold">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Seed, Fire or Jump, with the busy label while any action runs. */
export function ActionButton({ action, children }: { action: "seed" | "fire" | "jump"; children: ReactNode }) {
  const { busy, run } = useDemo();
  return (
    <Button className={ACTION_BUTTON} disabled={busy !== null} aria-busy={busy === action} onClick={() => run(action)}>
      {busy === action ? BUSY_LABEL[action] : children}
    </Button>
  );
}

export function JumpSelect({ id, className }: { id: string; className?: string }) {
  const { busy, jumpHours, setJumpHours } = useDemo();
  return (
    <Select
      id={id}
      value={jumpHours}
      disabled={busy !== null}
      onChange={(e) => setJumpHours(Number(e.target.value))}
      wrapperClassName="flex-1"
      className={cn("h-[44px] text-[15px]", className)}
    >
      {DEMO_JUMPS.map((j) => (
        <option key={j.hours} value={j.hours}>
          {j.label}
        </option>
      ))}
    </Select>
  );
}

export const resetHint = (confirming: boolean) =>
  confirming ? "Clear everything? This can't be undone." : "Clears ledger, log and settings";

/** Reset asks inline before it wipes anything. */
export function ResetControl() {
  const { busy, confirmingReset, setConfirmingReset, run } = useDemo();
  if (!confirmingReset) {
    return (
      <button type="button" disabled={busy !== null} aria-busy={busy === "reset"} onClick={() => setConfirmingReset(true)} className={OUTLINE_BUTTON}>
        {busy === "reset" ? BUSY_LABEL.reset : "Reset"}
      </button>
    );
  }
  return (
    <span role="group" aria-label="Confirm reset" className="flex flex-none gap-[8px]">
      {/* Focus lands on the safe choice. */}
      <button type="button" autoFocus onClick={() => setConfirmingReset(false)} className={OUTLINE_BUTTON}>
        Keep
      </button>
      <button
        type="button"
        onClick={() => run("reset")}
        className="h-[44px] min-w-[84px] cursor-pointer rounded-[12px] border-[1.5px] border-brick bg-brick px-[12px] text-[14px] font-semibold text-white"
      >
        Reset all
      </button>
    </span>
  );
}

/** The last action's outcome. Always rendered, so screen readers hear each new message. */
export function DemoMessage({ className }: { className?: string }) {
  const { message } = useDemo();
  return (
    <p role="status" aria-live="polite" className={cn("m-0 text-[14px] font-semibold", message?.ok === false ? "text-brick" : "text-teal", className)}>
      {message?.text}
    </p>
  );
}

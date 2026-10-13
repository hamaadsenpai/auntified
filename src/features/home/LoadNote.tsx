import type { ReactNode } from "react";
import { cn } from "@/utils";
import type { Load } from "./home-data";

type LoadNoteProps = { load: Load; className?: string; children: ReactNode };

/** Renders children once the data is in; until then a muted "Loading…", or the error with a retry. */
export function LoadNote({ load, className, children }: LoadNoteProps) {
  if (load.status === "ready") return children;
  if (load.status !== "error") return <span className={cn("text-[13px] font-medium text-muted", className)}>Loading…</span>;
  return (
    <span role="alert" className={cn("flex flex-wrap items-center gap-x-[8px] text-[13px] font-semibold text-brick", className)}>
      {load.error ?? "Couldn't load this."}
      <button type="button" onClick={load.retry} className="min-h-[44px] cursor-pointer text-teal underline underline-offset-4">
        Try again
      </button>
    </span>
  );
}

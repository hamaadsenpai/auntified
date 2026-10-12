import type { ReactNode } from "react";
import { cn } from "@/utils";

type AuntieBubbleProps = {
  className?: string;
  children: ReactNode;
};

export function AuntieBubble({ className, children }: AuntieBubbleProps) {
  return (
    <p
      className={cn(
        "m-0 rounded-[6px_22px_22px_22px] border-[2.5px] border-ink bg-mint px-[14px] py-[12px] font-display text-[16px] leading-[1.4] font-medium",
        className,
      )}
    >
      {children}
    </p>
  );
}

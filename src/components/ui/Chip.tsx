import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Chip({ className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "min-h-[44px] cursor-pointer rounded-[22px] border-2 border-teal bg-white px-[14px] text-[14px] font-semibold text-teal",
        className,
      )}
    >
      {children}
    </button>
  );
}

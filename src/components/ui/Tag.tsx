import type { ReactNode } from "react";
import { cn } from "@/utils";

export type TagVariant = "blocked" | "outline" | "passed" | "roast";

type TagProps = {
  variant: TagVariant;
  className?: string;
  children: ReactNode;
};

const VARIANTS: Record<TagVariant, string> = {
  blocked: "bg-brick text-white",
  outline: "border-[1.5px] border-night",
  passed: "border-[1.5px] border-teal text-teal",
  roast: "bg-mint",
};

export function Tag({ variant, className, children }: TagProps) {
  return (
    <span className={cn("rounded-full px-[9px] py-[3px] text-[12px] font-bold", VARIANTS[variant], className)}>
      {children}
    </span>
  );
}

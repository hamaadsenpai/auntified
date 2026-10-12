import type { HTMLAttributes } from "react";
import { cn } from "@/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div {...props} className={cn("rounded-[18px] border-[2.5px] border-ink shadow-hard-sm", className)}>
      {children}
    </div>
  );
}

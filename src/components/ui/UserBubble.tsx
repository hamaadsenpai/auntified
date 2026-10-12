import type { ReactNode } from "react";
import { cn } from "@/utils";

type UserBubbleProps = {
  className?: string;
  children: ReactNode;
};

export function UserBubble({ className, children }: UserBubbleProps) {
  return (
    <p
      className={cn(
        "m-0 max-w-[260px] self-end rounded-[18px_18px_4px_18px] bg-teal px-[14px] py-[11px] text-[15px] leading-[1.4] font-medium text-white",
        className,
      )}
    >
      {children}
    </p>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/utils";

type NudgeCardProps = {
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function NudgeCard({ className, bodyClassName, children, action }: NudgeCardProps) {
  return (
    <div className={cn("flex flex-col gap-[2px] rounded-[12px] border-[2.5px] border-ink bg-sun px-[14px] py-[12px]", className)}>
      <span className="text-[12px] font-bold tracking-[.06em] uppercase">One nudge</span>
      <span className={cn("font-display text-[15px] leading-[1.4] font-medium", bodyClassName)}>{children}</span>
      {action && <div className="mt-[8px]">{action}</div>}
    </div>
  );
}

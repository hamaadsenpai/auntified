import type { ReactNode } from "react";
import { cn } from "@/utils";

type ScreenProps = {
  className?: string;
  children: ReactNode;
};

export function Screen({ className, children }: ScreenProps) {
  return (
    <div
      className={cn(
        "flex h-dvh flex-col overflow-hidden bg-white lg:mx-auto lg:my-12 lg:h-[844px] lg:w-[390px] lg:rounded-[28px] lg:border-[3px] lg:border-ink lg:shadow-hard-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/icons";
import { cn } from "@/utils";

type BackHeaderProps = {
  backHref: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function BackHeader({ backHref, title, subtitle, className, children }: BackHeaderProps) {
  const heading = <h1 className="m-0 font-display text-[19px] font-bold leading-[1.1]">{title}</h1>;
  return (
    <header className={cn("flex h-[64px] flex-none items-center gap-[6px] pr-[20px] pl-[8px]", className)}>
      <Link href={backHref} aria-label="Back" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px]">
        <BackIcon />
      </Link>
      {subtitle === undefined ? (
        heading
      ) : (
        <div className="flex flex-col gap-[1px]">
          {heading}
          <span className="text-[13px] font-medium text-muted">{subtitle}</span>
        </div>
      )}
      {children}
    </header>
  );
}

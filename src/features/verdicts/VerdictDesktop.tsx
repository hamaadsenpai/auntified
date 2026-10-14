import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon } from "@/components/icons";

export const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";

type VerdictDesktopProps = {
  back?: { href: string; label: string };
  kicker?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
};

/** The desktop page around a verdict: back link, kicker and title, then the page's panels. */
export function VerdictDesktop({ back, kicker, title, children }: VerdictDesktopProps) {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      {back && (
        <Link href={back.href} className="-my-[12px] flex min-h-[44px] items-center gap-[6px] self-start text-[14px] font-semibold text-teal no-underline">
          <BackIcon size={18} />
          {back.label}
        </Link>
      )}
      {title !== undefined && (
        <header className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">{kicker}</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">{title}</h1>
        </header>
      )}
      {children}
    </main>
  );
}

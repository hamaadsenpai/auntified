"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AuntieBao } from "@/components/mascot/AuntieBao";
import { cn } from "@/utils";
import { NAV_ITEMS, type NavKey } from "./navItems";

function activeKey(pathname: string): NavKey | null {
  if (pathname.startsWith("/home") || pathname.startsWith("/roast") || pathname.startsWith("/ask")) return "home";
  // Before "/pay": "/payees" starts with it too.
  if (pathname.startsWith("/payees")) return "payees";
  if (pathname.startsWith("/pay")) return "pay";
  if (pathname.startsWith("/ledger")) return "ledger";
  if (pathname.startsWith("/scan")) return "scan";
  if (["/settings", "/patterns", "/demo", "/analyst"].some((p) => pathname.startsWith(p))) return "settings";
  return null;
}

function SidebarView({ active, footer }: { active: NavKey | null; footer?: ReactNode }) {
  return (
    <aside className="hidden h-dvh w-[240px] flex-none flex-col gap-[32px] border-r border-line bg-white px-[16px] pt-[28px] pb-[24px] lg:flex">
      <span className="flex items-center gap-[10px] px-[8px]">
        <AuntieBao mood="sleep" width={40} height={37} />
        <span className="font-display text-[22px] leading-none font-bold">
          Aunt<span className="text-teal">ified</span>
        </span>
      </span>
      <nav aria-label="Main" className="flex flex-col gap-[4px]">
        {NAV_ITEMS.map(({ key, label, href, Icon }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] items-center gap-[12px] rounded-[12px] px-[12px] text-[15px] no-underline",
                isActive ? "bg-wash font-bold text-teal" : "font-medium text-night",
              )}
            >
              <Icon size={20} className={cn("flex-none", isActive ? "text-teal" : "text-muted")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-[12px]">
        {footer}
        <p className="m-0 px-[12px] text-[12px] leading-[1.45] font-medium text-muted">
          An assistant, not a financial adviser. Demo data, no bank connected.
        </p>
      </div>
    </aside>
  );
}

function SidebarWithPath({ footer }: { footer?: ReactNode }) {
  const pathname = usePathname();
  return <SidebarView active={activeKey(pathname)} footer={footer} />;
}

/** `footer` sits above the disclaimer; the app layout passes the logout button (components can't import features). */
export function Sidebar({ footer }: { footer?: ReactNode }) {
  return (
    <Suspense fallback={<SidebarView active={null} footer={footer} />}>
      <SidebarWithPath footer={footer} />
    </Suspense>
  );
}

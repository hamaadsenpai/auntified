import Link from "next/link";
import { cn } from "@/utils";
import { NAV_ITEMS, type NavKey } from "./navItems";

export type { NavKey };

type BottomNavProps = {
  active: NavKey;
};

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav aria-label="Main" className="grid h-[72px] flex-none grid-cols-5 border-t border-line px-[8px] pb-[8px] lg:hidden">
      {NAV_ITEMS.map(({ key, label, href, Icon }) => {
        const isActive = key === active;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-[4px] text-[12px] no-underline",
              isActive ? "font-bold text-teal" : "font-medium text-muted",
            )}
          >
            <Icon size={22} className={isActive ? "text-teal" : "text-muted"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

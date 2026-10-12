import Link from "next/link";
import { AuntieBao } from "@/components/mascot/AuntieBao";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";

export function PublicHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between gap-[16px] px-[16px] lg:px-[40px]">
        <Link href={ROUTES.LANDING} className="flex items-center gap-[10px] text-night no-underline">
          <AuntieBao mood="sleep" width={40} height={37} />
          <span className="font-display text-[22px] leading-none font-bold">
            Aunt<span className="text-teal">ified</span>
          </span>
        </Link>
        <nav aria-label="Site" className="flex items-center gap-[8px] sm:gap-[20px]">
          <Link href={ROUTES.FEATURES} className="hidden text-[15px] font-semibold no-underline sm:inline">
            Features
          </Link>
          <Link href={ROUTES.LOGIN} className="text-[15px] font-semibold no-underline">
            Log in
          </Link>
          <Button href={ROUTES.SIGNUP} className="h-[44px] px-[18px] text-[15px]">
            Sign up
          </Button>
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/constants";
import { guessCurrency } from "@/features/onboarding/guess-currency";
import { CurrencySync } from "@/store/CurrencySync";

/**
 * For a profile with no saved currency: shows amounts in the browser's best guess and asks the user to set one.
 * `data-currency-banner` sets --banner-h (globals.css) so full-height screens shrink to fit under it.
 */
export function CurrencyBanner() {
  // Lazy, so the browser guess runs once. It only feeds an effect, so a server/client difference is harmless.
  const [guess] = useState(guessCurrency);
  return (
    <div data-currency-banner className="flex h-[44px] items-center justify-center gap-[8px] border-b border-line bg-wash px-[16px] text-[14px] font-medium">
      <CurrencySync code={guess} />
      <span className="truncate">Your currency isn&apos;t set yet.</span>
      <Link href={ROUTES.SETTINGS} className="flex-none font-semibold text-teal">
        Set currency
      </Link>
    </div>
  );
}

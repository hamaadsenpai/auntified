import Link from "next/link";
import { Suspense } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { ROUTES } from "@/constants";
import { publicEnv } from "@/lib/env.client";
import { AccountDetails, AccountFallback } from "./Account";
import { CurrencyPicker } from "./CurrencyPicker";
import { LogoutButton } from "./LogoutButton";
import { LanguageSelect, SettingsLoadError, ToneOptions, VoiceSwitch } from "./SettingsControls";
import { AccountRows, SavingsGoalRow, TrustedContactRow } from "./SettingsRows";

const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink px-[24px] py-[20px] shadow-hard-md";

export function SettingsDesktop() {
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex flex-col gap-[2px]">
        <span className="text-[13px] font-medium text-muted">How Auntie talks to you, and who she calls</span>
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Settings</h1>
      </header>
      <SettingsLoadError />
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-[24px]">
        <section aria-labelledby="dauntie-h" className={`${PANEL} gap-[20px]`}>
          <h2 id="dauntie-h" className="m-0 font-display text-[17px] font-bold">
            Auntie
          </h2>
          <ToneOptions variant="desktop" />
          <div className="grid grid-cols-2 gap-[16px]">
            <LanguageSelect variant="desktop" />
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="dcurrency" className="text-[14px] font-semibold">
                Currency
              </label>
              <CurrencyPicker id="dcurrency" variant="soft" />
            </div>
          </div>
          <VoiceSwitch variant="desktop" />
        </section>
        <div className="flex flex-col gap-[24px]">
          <section aria-labelledby="daccount-h" className={`${PANEL} gap-[10px]`}>
            <h2 id="daccount-h" className="m-0 font-display text-[17px] font-bold">
              Account
            </h2>
            <AccountRows variant="desktop" />
            <div className="flex items-center justify-between gap-[12px]">
              <Suspense fallback={<AccountFallback />}>
                <AccountDetails />
              </Suspense>
              <LogoutButton />
            </div>
          </section>
          <section aria-labelledby="dsafety-h" className={`${PANEL} gap-[4px]`}>
            <h2 id="dsafety-h" className="m-0 pb-[6px] font-display text-[17px] font-bold">
              Safety net
            </h2>
            <TrustedContactRow variant="desktop" />
          </section>
          <section aria-labelledby="dgoal-h" className={`${PANEL} gap-[10px]`}>
            <SavingsGoalRow variant="desktop" />
            <Link
              href={ROUTES.PATTERNS}
              className="mt-[6px] flex min-h-[48px] items-center justify-between gap-[12px] border-t border-line text-[15px] font-semibold text-night no-underline"
            >
              Your patterns
              <ChevronRightIcon />
            </Link>
            {publicEnv.DEMO_MODE && (
              <Link
                href={ROUTES.DEMO}
                className="flex min-h-[48px] items-center justify-between gap-[12px] border-t border-line text-[15px] font-semibold text-night no-underline"
              >
                Demo controls
                <ChevronRightIcon />
              </Link>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

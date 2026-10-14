import Link from "next/link";
import { Suspense } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { BottomNav, Screen } from "@/components/layout";
import { ROUTES } from "@/constants";
import { publicEnv } from "@/lib/env.client";
import { AccountDetails, AccountFallback } from "./Account";
import { CurrencyPicker } from "./CurrencyPicker";
import { LogoutButton } from "./LogoutButton";
import { LanguageSelect, SettingsLoadError, ToneOptions, VoiceSwitch } from "./SettingsControls";
import { AccountRows, MoneyLockRow, SavingsGoalRow, TrustedContactRow } from "./SettingsRows";

export function SettingsScreen() {
  return (
    <Screen className="lg:hidden">
      <header className="flex h-[64px] flex-none items-center justify-between px-[20px]">
        <h1 className="m-0 font-display text-[22px] leading-[1.1] font-bold">Settings</h1>
        <LogoutButton />
      </header>
      <main className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[20px] pb-[16px] *:shrink-0">
        <SettingsLoadError />
        <ToneOptions variant="mobile" />
        <LanguageSelect variant="mobile" />
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="currency" className="font-display text-[16px] font-bold">
            Currency
          </label>
          <CurrencyPicker id="currency" />
          <span className="text-[12px] font-medium text-muted">Demo amounts convert at fixed rates.</span>
        </div>
        <div className="flex flex-col border-t border-line">
          <VoiceSwitch variant="mobile" />
          <TrustedContactRow variant="mobile" />
          <MoneyLockRow variant="mobile" />
          <SavingsGoalRow variant="mobile" />
          <Link
            href={ROUTES.PATTERNS}
            className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
          >
            <span className="text-[16px] font-semibold">Your patterns</span>
            <ChevronRightIcon />
          </Link>
          {publicEnv.DEMO_MODE && (
            <Link
              href={ROUTES.DEMO}
              className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
            >
              <span className="text-[16px] font-semibold">Demo controls</span>
              <ChevronRightIcon />
            </Link>
          )}
          {publicEnv.DEMO_MODE && (
            <Link
              href={ROUTES.ANALYST}
              className="flex min-h-[60px] items-center justify-between gap-[12px] border-b border-line text-night no-underline"
            >
              <span className="text-[16px] font-semibold">Bank analyst queue</span>
              <ChevronRightIcon />
            </Link>
          )}
          <AccountRows variant="mobile" />
          <div className="flex min-h-[72px] items-center border-b border-line py-[8px]">
            <Suspense fallback={<AccountFallback />}>
              <AccountDetails />
            </Suspense>
          </div>
        </div>
        <p className="m-0 text-[12px] leading-[1.45] font-medium text-muted">
          Auntified is an assistant, not financial advice. It runs on the numbers you enter, with no bank connection.
        </p>
      </main>
      <BottomNav active="settings" />
    </Screen>
  );
}

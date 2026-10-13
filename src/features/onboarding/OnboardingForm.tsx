"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";
import { CurrencyPicker } from "@/features/settings/CurrencyPicker";
import { userService } from "@/services/user.service";
import { useCurrencyStore } from "@/store";
import { CurrencySync } from "@/store/CurrencySync";
import type { ApiFailure } from "@/types/api";
import { guessCurrency } from "./guess-currency";

/** Preselects the saved or guessed currency; Continue saves it and marks onboarding done. */
export function OnboardingForm({ initialCurrency }: { initialCurrency: string | null }) {
  // Lazy, so the browser guess runs once. It only feeds an effect, so a server/client difference is harmless.
  const [preselect] = useState(() => initialCurrency ?? guessCurrency());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setPending(true);
    setError(null);
    try {
      await userService.updatePreferences({ currency: useCurrencyStore.getState().code, completeOnboarding: true });
      // Full load, so the server re-reads the profile and the guard lets us in.
      location.assign(ROUTES.HOME);
    } catch (err) {
      setError((err as ApiFailure["error"]).message);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <CurrencySync code={preselect} />
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="onboarding-currency" className="font-display text-[16px] font-bold">
          Currency
        </label>
        <CurrencyPicker id="onboarding-currency" />
      </div>
      {error && (
        <p role="alert" className="m-0 rounded-[14px] border-[1.5px] border-brick px-[14px] py-[10px] text-[14px] font-semibold text-brick">
          {error}
        </p>
      )}
      <Button className="mt-[4px] w-full disabled:opacity-60" disabled={pending} onClick={() => void handleContinue()}>
        {pending ? "One moment…" : "Continue"}
      </Button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "./currency.store";

/** Applies the profile currency once persisted prefs have hydrated, so localStorage can't overwrite it. */
export function CurrencySync({ code }: { code: string | null }) {
  useEffect(() => {
    if (!code) return;
    const apply = () => useCurrencyStore.getState().setCurrency(code);
    if (useCurrencyStore.persist.hasHydrated()) return apply();
    // Once only: later rehydrates (other tabs) must not re-apply the profile value.
    const unsub = useCurrencyStore.persist.onFinishHydration(() => {
      unsub();
      apply();
    });
    return unsub;
  }, [code]);
  return null;
}

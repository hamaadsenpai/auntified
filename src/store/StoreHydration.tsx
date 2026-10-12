"use client";

import { useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useCurrencyStore } from "./currency.store";

/** Loads persisted prefs after the first render, so server and client markup match. Also syncs other tabs. */
export function StoreHydration() {
  useEffect(() => {
    void useCurrencyStore.persist.rehydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CURRENCY) void useCurrencyStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

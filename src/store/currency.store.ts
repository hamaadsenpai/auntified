import { DEFAULT_CURRENCY, getCurrency, isCurrencyCode } from "@/constants/currencies";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { createPersistedStore } from "./create-store";

type CurrencyState = {
  code: string;
  setCurrency: (code: string) => void;
};

export const useCurrencyStore = createPersistedStore<CurrencyState>("currency", STORAGE_KEYS.CURRENCY, (set) => ({
  code: DEFAULT_CURRENCY,
  setCurrency: (code) => {
    if (isCurrencyCode(code)) set({ code });
  },
}));

export const useCurrency = () => getCurrency(useCurrencyStore((s) => s.code));

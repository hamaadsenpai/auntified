import { DEFAULT_CURRENCY, getCurrency, isCurrencyCode } from "@/constants/currencies";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { userService } from "@/services/user.service";
import { createPersistedStore } from "./create-store";

type CurrencyState = {
  code: string;
  setCurrency: (code: string) => void;
  saveCurrency: (code: string) => Promise<void>;
};

export const useCurrencyStore = createPersistedStore<CurrencyState>("currency", STORAGE_KEYS.CURRENCY, (set, get) => ({
  code: DEFAULT_CURRENCY,
  setCurrency: (code) => {
    if (isCurrencyCode(code)) set({ code });
  },
  /** Optimistic: switches now, saves to the profile, and reverts if the save fails. */
  saveCurrency: async (code) => {
    if (!isCurrencyCode(code)) return;
    const previous = get().code;
    set({ code });
    try {
      await userService.updatePreferences({ currency: code });
    } catch {
      if (get().code === code) set({ code: previous });
    }
  },
}));

export const useCurrency = () => getCurrency(useCurrencyStore((s) => s.code));

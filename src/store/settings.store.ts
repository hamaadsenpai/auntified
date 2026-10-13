import { DEFAULT_SETTINGS } from "@/constants";
import { settingsService } from "@/services/settings.service";
import type { ApiFailure } from "@/types/api";
import type { AccountSettings, UpdateSettings } from "@/types/settings";
import type { LoadStatus } from "./collection";
import { createStore } from "./create-store";

type SettingsState = {
  /** DEFAULT_SETTINGS until loaded. */
  settings: AccountSettings;
  status: LoadStatus;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
  /** Optimistic: applies now, reverts if the save fails, then rethrows. */
  save: (body: UpdateSettings) => Promise<void>;
};

export const useSettingsStore = createStore<SettingsState>("settings", (set, get) => ({
  settings: DEFAULT_SETTINGS,
  status: "idle",
  error: null,
  load: async (force = false) => {
    const { status } = get();
    if (status === "loading" || (status === "ready" && !force)) return;
    set({ status: "loading", error: null });
    try {
      set({ settings: await settingsService.get(), status: "ready" });
    } catch (err) {
      set({ status: "error", error: (err as ApiFailure["error"]).message });
    }
  },
  save: async (body) => {
    const previous = get().settings;
    set({ settings: { ...previous, ...body } });
    try {
      set({ settings: await settingsService.update(body) });
    } catch (err) {
      set({ settings: previous });
      throw err;
    }
  },
}));

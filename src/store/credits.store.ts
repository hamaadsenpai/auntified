import { creditService } from "@/services/credit.service";
import type { ApiFailure } from "@/types/api";
import type { CreateCredit, Credit } from "@/types/credit";
import type { LoadStatus } from "./collection";
import { createStore } from "./create-store";
import { useSettingsStore } from "./settings.store";

/** Credits are never edited or deleted, so this is `collection()` without update/remove. */
type CreditsState = {
  items: Credit[];
  status: LoadStatus;
  error: string | null;
  /** Fetches once; later calls are no-ops unless `force`. */
  load: (force?: boolean) => Promise<void>;
  /** Adds money, then reloads settings so the balance shown everywhere moves. Throws ApiFailure["error"]. */
  create: (body: CreateCredit) => Promise<Credit>;
};

export const useCreditsStore = createStore<CreditsState>("credits", (set, get) => ({
  items: [],
  status: "idle",
  error: null,
  load: async (force = false) => {
    const { status } = get();
    if (status === "loading" || (status === "ready" && !force)) return;
    set({ status: "loading", error: null });
    try {
      set({ items: await creditService.list(), status: "ready" });
    } catch (err) {
      set({ status: "error", error: (err as ApiFailure["error"])?.message ?? "Something went wrong. Try again." });
    }
  },
  create: async (body) => {
    const item = await creditService.create(body);
    set((s) => ({ items: [item, ...s.items] }));
    void useSettingsStore.getState().load(true);
    return item;
  },
}));

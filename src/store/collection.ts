import type { ApiFailure } from "@/types/api";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

/** The shared shape of the per-user data stores. Writes return the saved item and throw ApiFailure["error"]. */
export type CollectionState<T extends { id: string }, C, U> = {
  items: T[];
  status: LoadStatus;
  error: string | null;
  /** Fetches once; later calls are no-ops unless `force`. */
  load: (force?: boolean) => Promise<void>;
  create: (body: C) => Promise<T>;
  update: (id: string, body: U) => Promise<T>;
  remove: (id: string) => Promise<void>;
  /** Puts a fresh copy of one item into the list (or adds it). */
  upsert: (item: T) => void;
};

type Api<T, C, U> = {
  list: () => Promise<T[]>;
  create: (body: C) => Promise<T>;
  update: (id: string, body: U) => Promise<T>;
  remove: (id: string) => Promise<unknown>;
};

const message = (err: unknown) => (err as ApiFailure["error"])?.message ?? "Something went wrong. Try again.";

/** Builds the state creator for a collection store. New items go first: every list is newest first. */
export function collection<T extends { id: string }, C, U>(api: Api<T, C, U>) {
  return (
    set: (partial: Partial<CollectionState<T, C, U>> | ((s: CollectionState<T, C, U>) => Partial<CollectionState<T, C, U>>)) => void,
    get: () => CollectionState<T, C, U>,
  ): CollectionState<T, C, U> => {
    const upsert = (item: T) =>
      set((s) => ({
        items: s.items.some((i) => i.id === item.id) ? s.items.map((i) => (i.id === item.id ? item : i)) : [item, ...s.items],
      }));
    return {
      items: [],
      status: "idle",
      error: null,
      load: async (force = false) => {
        const { status } = get();
        if (status === "loading" || (status === "ready" && !force)) return;
        set({ status: "loading", error: null });
        try {
          set({ items: await api.list(), status: "ready" });
        } catch (err) {
          set({ status: "error", error: message(err) });
        }
      },
      create: async (body) => {
        const item = await api.create(body);
        upsert(item);
        return item;
      },
      update: async (id, body) => {
        const item = await api.update(id, body);
        upsert(item);
        return item;
      },
      remove: async (id) => {
        await api.remove(id);
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },
      upsert,
    };
  };
}

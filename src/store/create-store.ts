import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

/**
 * Global client-only store. Persisted stores skip automatic hydration so the first
 * client render matches the server; `<StoreHydration />` rehydrates them after mount.
 * Only persist UI prefs here, never user data.
 */
export function createStore<T>(name: string, init: StateCreator<T>) {
  return create<T>()(devtools(init, { name }));
}

export function createPersistedStore<T>(name: string, persistKey: string, init: StateCreator<T>) {
  return create<T>()(
    devtools(persist(init, { name: persistKey, storage: createJSONStorage(() => localStorage), skipHydration: true }), {
      name,
    }),
  );
}

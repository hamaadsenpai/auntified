import { transferService } from "@/services/transfer.service";
import type { CreateTransfer, Transfer, UpdateTransfer } from "@/types/transfer";
import { collection, type CollectionState } from "./collection";
import { createStore } from "./create-store";

type TransfersState = CollectionState<Transfer, CreateTransfer, UpdateTransfer> & {
  /** Fetches one transfer (e.g. after the check wrote its verdict) and upserts it. */
  fetchOne: (id: string) => Promise<Transfer>;
};

export const useTransfersStore = createStore<TransfersState>("transfers", (set, get) => ({
  ...collection(transferService)(set, get),
  fetchOne: async (id) => {
    const item = await transferService.get(id);
    get().upsert(item);
    return item;
  },
}));

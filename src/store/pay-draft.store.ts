import { MAIN_ACCOUNT_ID } from "@/utils/accounts";
import { createStore } from "./create-store";

/** The transfer being filled in on /pay. Not persisted: a reload starts over. */
type PayDraftState = {
  /** The pending transfer this draft already created, so continuing again edits it instead of adding another. */
  transferId: string | null;
  payeeId: string | null;
  amountSgd: number;
  reference: string;
  /** The account that pays. */
  fromAccountId: string;
  setPayee: (payeeId: string | null) => void;
  setAmountSgd: (amountSgd: number) => void;
  setReference: (reference: string) => void;
  setFromAccount: (fromAccountId: string) => void;
  setTransferId: (transferId: string | null) => void;
  reset: () => void;
};

const EMPTY = { transferId: null, payeeId: null, amountSgd: 0, reference: "", fromAccountId: MAIN_ACCOUNT_ID };

export const usePayDraftStore = createStore<PayDraftState>("pay-draft", (set) => ({
  ...EMPTY,
  setPayee: (payeeId) => set({ payeeId }),
  setAmountSgd: (amountSgd) => set({ amountSgd }),
  setReference: (reference) => set({ reference }),
  setFromAccount: (fromAccountId) => set({ fromAccountId }),
  setTransferId: (transferId) => set({ transferId }),
  reset: () => set(EMPTY),
}));

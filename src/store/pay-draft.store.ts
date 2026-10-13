import { createStore } from "./create-store";

/** The transfer being filled in on /pay. Not persisted: a reload starts over. */
type PayDraftState = {
  /** The pending transfer this draft already created, so continuing again edits it instead of adding another. */
  transferId: string | null;
  payeeId: string | null;
  amountSgd: number;
  reference: string;
  setPayee: (payeeId: string | null) => void;
  setAmountSgd: (amountSgd: number) => void;
  setReference: (reference: string) => void;
  setTransferId: (transferId: string | null) => void;
  reset: () => void;
};

const EMPTY = { transferId: null, payeeId: null, amountSgd: 0, reference: "" };

export const usePayDraftStore = createStore<PayDraftState>("pay-draft", (set) => ({
  ...EMPTY,
  setPayee: (payeeId) => set({ payeeId }),
  setAmountSgd: (amountSgd) => set({ amountSgd }),
  setReference: (reference) => set({ reference }),
  setTransferId: (transferId) => set({ transferId }),
  reset: () => set(EMPTY),
}));

import { useBillsStore } from "@/store";
import type { Party } from "@/types/bill";
import { settleUpCalls } from "./balances";

/** Records that `x` and `y` are square: marks every open share between them settled. Throws ApiFailure["error"]. */
export async function settleUp(x: Party, y: Party) {
  const store = useBillsStore.getState();
  await Promise.all(settleUpCalls(store.items, x, y).map((c) => store.update(c.id, { settle: c.settle })));
}

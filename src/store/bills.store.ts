import { billService } from "@/services/bill.service";
import type { Bill, CreateBill, UpdateBill } from "@/types/bill";
import { collection, type CollectionState } from "./collection";
import { createStore } from "./create-store";

export const useBillsStore = createStore<CollectionState<Bill, CreateBill, UpdateBill>>("bills", collection(billService));

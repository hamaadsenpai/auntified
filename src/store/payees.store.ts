import { payeeService } from "@/services/payee.service";
import type { CreatePayee, Payee, UpdatePayee } from "@/types/payee";
import { collection, type CollectionState } from "./collection";
import { createStore } from "./create-store";

export const usePayeesStore = createStore<CollectionState<Payee, CreatePayee, UpdatePayee>>("payees", collection(payeeService));

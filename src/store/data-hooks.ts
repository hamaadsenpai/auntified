"use client";

import { useEffect } from "react";
import { useExpensesStore } from "./expenses.store";
import { usePayeesStore } from "./payees.store";
import { useSettingsStore } from "./settings.store";
import { useTransfersStore } from "./transfers.store";

/** Each hook loads its collection on first use (once per page load) and returns the store state. */
export function usePayees() {
  const state = usePayeesStore();
  useEffect(() => void usePayeesStore.getState().load(), []);
  return state;
}

export function useTransfers() {
  const state = useTransfersStore();
  useEffect(() => void useTransfersStore.getState().load(), []);
  return state;
}

export function useExpenses() {
  const state = useExpensesStore();
  useEffect(() => void useExpensesStore.getState().load(), []);
  return state;
}

export function useSettings() {
  const state = useSettingsStore();
  useEffect(() => void useSettingsStore.getState().load(), []);
  return state;
}

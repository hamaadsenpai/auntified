"use client";

import { Select, type SelectVariant } from "@/components/ui";
import { useCurrency, useSettings } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import { accountOf, accountsOf, sendableSgd } from "@/utils/accounts";
import { formatMoney } from "@/utils/format";

/** The account paying for the draft, or the main one if the picked account was removed. Its balance is what it can send (less Money Lock). */
export function useFromAccount() {
  const { settings } = useSettings();
  const from = accountOf(settings, usePayDraftStore((s) => s.fromAccountId));
  return { ...from, balanceSgd: sendableSgd(settings, from) };
}

/** <option> only accepts plain text, so the balance is formatted here rather than with <Money>. */
export function FromAccountSelect({ id, variant = "soft" }: { id: string; variant?: SelectVariant }) {
  const currency = useCurrency();
  const { settings } = useSettings();
  const from = useFromAccount();
  return (
    <Select id={id} variant={variant} value={from.id} onChange={(e) => usePayDraftStore.getState().setFromAccount(e.target.value)}>
      {accountsOf(settings).map((a) => (
        <option key={a.id} value={a.id}>{`${a.name}, ${formatMoney(a.balanceSgd, currency)}`}</option>
      ))}
    </Select>
  );
}

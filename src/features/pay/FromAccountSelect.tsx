"use client";

import { Select } from "@/components/ui";
import { useCurrency, useSettings } from "@/store";
import { formatMoney } from "@/utils/format";

/** <option> only accepts plain text, so the balance is formatted here rather than with <Money>. */
export function FromAccountSelect({ id }: { id: string }) {
  const currency = useCurrency();
  const { settings } = useSettings();
  return (
    <Select id={id} variant="soft">
      <option>{`${settings.accountName}, ${formatMoney(settings.balanceSgd, currency)}`}</option>
    </Select>
  );
}

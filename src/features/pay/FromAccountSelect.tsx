"use client";

import { Select } from "@/components/ui";
import { useCurrency } from "@/store";
import { formatMoney } from "@/utils/format";
import { DEMO_BALANCE_SGD } from "./AmountPad";

/** <option> only accepts plain text, so the balance is formatted here rather than with <Money>. */
export function FromAccountSelect({ id }: { id: string }) {
  const currency = useCurrency();
  return (
    <Select id={id} variant="soft">
      <option>{`Everyday ••4417, ${formatMoney(DEMO_BALANCE_SGD, currency)}`}</option>
    </Select>
  );
}

"use client";

import { useCurrency } from "@/store";
import { formatMoney } from "@/utils/format";

type MoneyProps = {
  /** Demo amount in SGD. Shown converted to the user's currency at the fixed demo rate. */
  sgd: number;
  /** Round number with no decimals, e.g. goals and medians ("S$1,000", not "S$1,000.00"). */
  whole?: boolean;
};

export function Money({ sgd, whole = false }: MoneyProps) {
  const currency = useCurrency();
  return formatMoney(sgd, currency, { whole });
}

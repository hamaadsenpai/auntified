"use client";

import { useState, type ReactNode } from "react";
import type { Currency } from "@/constants/currencies";
import { useCurrency, useSettings } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import { cn } from "@/utils";
import { convertFromSgd, formatMoney, formatNumber, withSymbol } from "@/utils/format";

const MAX_WHOLE_DIGITS = 10;
const KEY = "h-[48px] cursor-pointer rounded-[14px] border-2 border-ink bg-cream px-[6px] py-[1px] active:translate-y-[1px] active:bg-lemon";

export type AmountKey = "digit" | "zeros" | "point" | "delete";

/** Applies one keypad press to the typed amount string ("1850", "12.5", "0"). */
export function pressKey(value: string, key: AmountKey, digit: string, decimals: number): string {
  const [whole, fraction] = value.split(".");
  switch (key) {
    case "delete":
      return value.length <= 1 ? "0" : value.slice(0, -1);
    case "point":
      return decimals === 0 || fraction !== undefined ? value : `${value}.`;
    case "zeros":
    case "digit": {
      const add = key === "zeros" ? "000" : digit;
      if (fraction !== undefined) return fraction.length >= decimals ? value : value + add.slice(0, decimals - fraction.length);
      if (whole === "0") return add.replace(/^0+/, "") || "0";
      return (whole + add).length > MAX_WHOLE_DIGITS ? value : value + add;
    }
  }
}

function display(value: string, currency: Currency) {
  const [whole, fraction] = value.split(".");
  const number = formatNumber(Number(whole), currency, 0) + (fraction === undefined ? "" : `.${fraction}`);
  return withSymbol(number, currency);
}

/** Mobile pay screen: the amount, whatever sits between (`children`), then the keypad. */
export function AmountPad({ children }: { children: ReactNode }) {
  const currency = useCurrency();
  // Remount when the currency changes so the amount restarts in the new currency.
  return (
    <AmountPadInner key={currency.code} currency={currency}>
      {children}
    </AmountPadInner>
  );
}

function AmountPadInner({ currency, children }: { currency: Currency; children: ReactNode }) {
  const { settings, status } = useSettings();
  const [value, setValue] = useState(() => String(convertFromSgd(usePayDraftStore.getState().amountSgd, currency)));
  // The balance is 0 until settings load, so only warn once it is real.
  const overBalance = status === "ready" && Number(value) > convertFromSgd(settings.balanceSgd, currency);
  const press = (key: AmountKey, digit = "") => {
    const next = pressKey(value, key, digit, currency.decimals);
    setValue(next);
    usePayDraftStore.getState().setAmountSgd(Number(next) / currency.rate);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-[4px] py-[4px]">
        <label htmlFor="amt" className="text-[13px] font-medium text-muted">
          Amount
        </label>
        <output id="amt" aria-live="polite" className="max-w-full truncate font-display text-[52px] leading-none font-bold">
          {display(value, currency)}
        </output>
        <span className={cn("text-[13px] font-medium", overBalance ? "font-semibold text-brick" : "text-muted")}>
          {overBalance ? "More than you have. " : "From "}
          {settings.accountName}, {formatMoney(settings.balanceSgd, currency)} available
        </span>
      </div>
      {children}
      <div role="group" aria-label="Keypad" className="grid grid-cols-3 gap-[6px]">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => press("digit", d)} className={cn(KEY, "font-display text-[22px] font-semibold")}>
            {d}
          </button>
        ))}
        {currency.decimals === 0 ? (
          <button type="button" onClick={() => press("zeros")} className={cn(KEY, "font-display text-[20px] font-semibold")}>
            000
          </button>
        ) : (
          <button type="button" aria-label="Decimal point" onClick={() => press("point")} className={cn(KEY, "font-display text-[22px] font-semibold")}>
            .
          </button>
        )}
        <button type="button" onClick={() => press("digit", "0")} className={cn(KEY, "font-display text-[22px] font-semibold")}>
          0
        </button>
        <button type="button" aria-label="Delete" onClick={() => press("delete")} className={cn(KEY, "text-[15px] font-semibold text-teal")}>
          Delete
        </button>
      </div>
    </>
  );
}

/** Desktop pay form amount field: free typing, tidied up on blur. */
export function AmountField({ id }: { id: string }) {
  const currency = useCurrency();
  return <AmountFieldInner key={currency.code} id={id} currency={currency} />;
}

function clean(raw: string, decimals: number) {
  let s = raw.replace(decimals === 0 ? /[^\d,]/g : /[^\d,.]/g, "");
  const point = s.indexOf(".");
  if (point !== -1) s = s.slice(0, point + 1) + s.slice(point + 1).replace(/[.,]/g, "").slice(0, decimals);
  return s;
}

function AmountFieldInner({ id, currency }: { id: string; currency: Currency }) {
  const [value, setValue] = useState(() => {
    const sgd = usePayDraftStore.getState().amountSgd;
    return sgd > 0 ? formatNumber(convertFromSgd(sgd, currency), currency) : "";
  });
  const symbol = <span className="font-display text-[40px] font-bold whitespace-nowrap text-muted">{currency.symbol.trim()}</span>;

  return (
    <div className="flex h-[84px] items-center gap-[8px] rounded-[16px] border-[1.5px] border-teal px-[20px] shadow-[0_0_0_4px_var(--color-track)]">
      {!currency.after && symbol}
      <input
        id={id}
        type="text"
        inputMode={currency.decimals === 0 ? "numeric" : "decimal"}
        autoComplete="off"
        value={value}
        onChange={(e) => {
          const next = clean(e.target.value, currency.decimals);
          const n = Number(next.replace(/,/g, ""));
          setValue(next);
          usePayDraftStore.getState().setAmountSgd(Number.isNaN(n) ? 0 : n / currency.rate);
        }}
        onBlur={() => {
          const n = Number(value.replace(/,/g, ""));
          setValue(value === "" || Number.isNaN(n) ? "" : formatNumber(n, currency));
        }}
        className="min-w-0 flex-1 border-none bg-transparent px-[2px] py-[1px] font-display text-[44px] font-bold outline-none"
      />
      {currency.after && symbol}
    </div>
  );
}

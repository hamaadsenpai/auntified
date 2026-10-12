import type { Currency } from "@/constants/currencies";

const formatters = new Map<string, Intl.NumberFormat>();

function numberFormat(lakh: boolean, decimals: number) {
  const key = `${lakh}-${decimals}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(lakh ? "en-IN" : "en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    formatters.set(key, f);
  }
  return f;
}

/**
 * Converts a demo amount (stored in SGD) into `currency` at its fixed demo rate.
 * `whole` amounts (goals, medians, "S$75 back") are rounded to 3 significant figures
 * after conversion so they stay round-looking, and so differences between them still add up.
 */
export function convertFromSgd(sgd: number, currency: Currency, whole = false): number {
  if (currency.rate === 1) return sgd;
  const value = sgd * currency.rate;
  if (whole) return Number(value.toPrecision(3));
  const unit = 10 ** currency.decimals;
  return Math.round(value * unit) / unit;
}

export function formatNumber(value: number, currency: Currency, decimals: number = currency.decimals): string {
  return numberFormat(currency.lakh ?? false, decimals).format(value);
}

export function withSymbol(number: string, currency: Currency): string {
  return currency.after ? `${number}${currency.symbol}` : `${currency.symbol}${number}`;
}

/** Formats a local amount, e.g. 1850 → "S$1,850.00", "¥212,750", "₹1,22,100.00". */
export function formatCurrency(value: number, currency: Currency, { whole = false } = {}): string {
  return withSymbol(formatNumber(value, currency, whole ? 0 : currency.decimals), currency);
}

/** Formats a demo amount stored in SGD in the user's currency. */
export function formatMoney(sgd: number, currency: Currency, { whole = false } = {}): string {
  return formatCurrency(convertFromSgd(sgd, currency, whole), currency, { whole });
}

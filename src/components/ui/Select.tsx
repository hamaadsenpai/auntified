import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/utils";

export type SelectVariant = "bold" | "soft";

type SelectProps = {
  variant?: SelectVariant;
  /** Classes for the wrapper, e.g. `flex-1` or a max width. */
  wrapperClassName?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

/** Shared look for selects and select-like triggers (see CurrencyPicker). */
export const FIELD_VARIANTS: Record<SelectVariant, string> = {
  bold: "rounded-[16px] border-2 border-ink shadow-hard-xs focus-visible:shadow-[0_3px_0_var(--color-ink),0_0_0_5px_var(--color-track)]",
  soft: "rounded-[14px] border-[1.5px] border-slate hover:border-teal focus-visible:border-teal focus-visible:shadow-[0_0_0_4px_var(--color-track)]",
};

export const FIELD_BASE =
  "h-[52px] w-full min-w-0 cursor-pointer bg-white text-[16px] font-medium outline-none transition-[border-color,box-shadow]";

/**
 * A real <select>, so phones keep their native picker. The browser arrow is swapped for our chevron,
 * and browsers that support `appearance: base-select` also get a styled dropdown (globals.css).
 */
export function Select({ variant = "bold", className, wrapperClassName, children, ...props }: SelectProps) {
  return (
    <span className={cn("relative flex", wrapperClassName)}>
      <select {...props} className={cn("ui-select flex appearance-none items-center pr-[44px] pl-[14px]", FIELD_BASE, FIELD_VARIANTS[variant], className)}>
        {children}
      </select>
      <ChevronDownIcon className="ui-select-chevron pointer-events-none absolute top-1/2 right-[14px] -translate-y-1/2 transition-transform" />
    </span>
  );
}

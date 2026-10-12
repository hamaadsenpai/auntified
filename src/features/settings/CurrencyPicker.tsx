"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "@/components/icons";
import { FIELD_BASE, FIELD_VARIANTS, type SelectVariant } from "@/components/ui";
import { CURRENCIES, CURRENCY_REGIONS, type Currency } from "@/constants/currencies";
import { useCurrency, useCurrencyStore } from "@/store";
import { cn } from "@/utils";

function matches(c: Currency, q: string) {
  return [c.code, c.name, c.country, c.symbol.trim()].some((field) => field.toLowerCase().includes(q));
}

function filterCurrencies(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return CURRENCIES;
  // Code hits first ("lk" → LKR), then everything else in list order.
  const hits = CURRENCIES.filter((c) => matches(c, q));
  return [...hits.filter((c) => c.code.toLowerCase().startsWith(q)), ...hits.filter((c) => !c.code.toLowerCase().startsWith(q))];
}

function SymbolBadge({ currency, className }: { currency: Currency; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-[30px] min-w-[38px] flex-none items-center justify-center rounded-[9px] bg-track px-[6px] font-display text-[14px] font-bold whitespace-nowrap text-teal",
        className,
      )}
    >
      {currency.symbol.trim()}
    </span>
  );
}

type CurrencyPickerProps = {
  id: string;
  variant?: SelectVariant;
  className?: string;
};

export function CurrencyPicker({ id, variant = "bold", className }: CurrencyPickerProps) {
  const currency = useCurrency();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const optionId = (code: string) => `${listId}-${code}`;

  const results = useMemo(() => filterCurrencies(query), [query]);
  const grouped = !query.trim();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const code = results[active]?.code;
    if (code) document.getElementById(`${listId}-${code}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, results, listId]);

  function openPicker() {
    setQuery("");
    setActive(Math.max(0, CURRENCIES.findIndex((c) => c.code === currency.code)));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(c: Currency) {
    setCurrency(c.code);
    close();
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const last = results.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i >= last ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? last : i - 1));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      setActive((i) => Math.min(last, i + 6));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 6));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = results[active];
      if (c) choose(c);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  function renderOption(c: Currency, index: number) {
    const selected = c.code === currency.code;
    const isActive = index === active;
    return (
      <div
        key={c.code}
        id={optionId(c.code)}
        role="option"
        aria-selected={selected}
        onPointerMove={() => setActive(index)}
        onClick={() => choose(c)}
        className={cn(
          "flex min-h-[48px] cursor-pointer items-center gap-[10px] rounded-[12px] px-[8px] py-[6px]",
          isActive && "bg-wash",
          selected && "bg-mint",
        )}
      >
        <SymbolBadge currency={c} className={cn(selected && "bg-white")} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold">{c.name}</span>
          <span className="truncate text-[12px] font-medium text-muted">{c.country}</span>
        </span>
        <span className="font-mono text-[12px] font-semibold text-muted">{c.code}</span>
        <span className="flex w-[18px] flex-none justify-center">{selected && <CheckIcon />}</span>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPicker())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(FIELD_BASE, FIELD_VARIANTS[variant], "flex items-center gap-[10px] pr-[14px] pl-[8px] text-left")}
      >
        <SymbolBadge currency={currency} />
        <span className="min-w-0 flex-1 truncate">{currency.name}</span>
        <span className="font-mono text-[12px] font-semibold text-muted">{currency.code}</span>
        <ChevronDownIcon className={cn("flex-none transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-[6px] flex flex-col gap-[6px] rounded-[18px] border-2 border-ink bg-white p-[6px] shadow-hard-md">
          <div className="relative flex">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-[12px] -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-label="Search currencies"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results[active] ? optionId(results[active].code) : undefined}
              placeholder="Search code, country or name"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              className="h-[44px] w-full min-w-0 rounded-[12px] border-[1.5px] border-line-strong bg-wash pr-[12px] pl-[38px] text-[15px] font-medium outline-none focus:border-teal"
            />
          </div>
          <div id={listId} role="listbox" aria-label="Currencies" className="max-h-[300px] overflow-y-auto overscroll-contain">
            {results.length === 0 && (
              <p className="m-0 px-[10px] py-[14px] text-[14px] font-medium text-muted">
                Auntie doesn&apos;t know that one. Try a code like LKR.
              </p>
            )}
            {grouped
              ? CURRENCY_REGIONS.map((region) => {
                  const inRegion = results.filter((c) => c.region === region);
                  const headerId = `${listId}-${region.replace(/\s/g, "")}`;
                  return (
                    <div key={region} role="group" aria-labelledby={headerId}>
                      <div
                        id={headerId}
                        role="presentation"
                        className="px-[8px] pt-[10px] pb-[4px] text-[11px] font-bold tracking-[.06em] text-slate uppercase"
                      >
                        {region}
                      </div>
                      {inRegion.map((c) => renderOption(c, results.indexOf(c)))}
                    </div>
                  );
                })
              : results.map(renderOption)}
          </div>
        </div>
      )}
    </div>
  );
}

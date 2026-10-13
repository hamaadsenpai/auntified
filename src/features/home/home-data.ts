"use client";

import { useMemo } from "react";
import { byCategory, DAY_MS, formatDayYear, spentBetween, sumSgd, useNow } from "@/features/ledger/history";
import { type LoadStatus, useExpenses, useSettings, useTransfers } from "@/store";

/** One store's load state, as LoadNote reads it. */
export type Load = { status: LoadStatus; error: string | null; retry: () => void };

/** "2026-12-31" (a calendar date) → "31 Dec 2026", read in local time. */
export function formatDeadline(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return formatDayYear(new Date(y, m - 1, d).getTime());
}

/** Everything Home shows, worked out from the user's settings, transfers and expenses. */
export function useHome() {
  const settings = useSettings();
  const transfers = useTransfers();
  const expenses = useExpenses();
  const now = useNow();

  const scams = useMemo(() => {
    const blocked = transfers.items.filter((t) => t.status === "blocked");
    return { count: blocked.length, keptSgd: sumSgd(blocked) };
  }, [transfers.items]);

  const verdicts = useMemo(
    () =>
      transfers.items
        .filter((t) => t.score !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [transfers.items],
  );

  // "This week" is the last 7 days; "normal" is the weekly average over the 4 weeks before it.
  const week = useMemo(() => {
    if (now === null) return null;
    const spends = spentBetween(expenses.items, now, 0, 7);
    const categories = byCategory(spends);
    const before = spentBetween(expenses.items, now, 7, 35);
    const normal = new Map(byCategory(before).map((c) => [c.category, c.totalSgd / 4]));
    return {
      count: spends.length,
      totalSgd: sumSgd(spends),
      top: categories[0] ?? null,
      hasNormal: expenses.items.some((e) => now - new Date(e.spentAt).getTime() >= 7 * DAY_MS),
      vsNormal: categories.slice(0, 3).map((c) => ({ ...c, normalSgd: normal.get(c.category) ?? 0 })),
    };
  }, [expenses.items, now]);

  const load = (s: { status: LoadStatus; error: string | null; load: (force?: boolean) => Promise<void> }): Load => ({
    status: s.status,
    error: s.error,
    retry: () => void s.load(true),
  });

  return {
    today: now,
    settings: settings.settings,
    settingsLoad: load(settings),
    transfersLoad: load(transfers),
    // The week needs the client clock too, so it counts as loading until both are in.
    expensesLoad: { ...load(expenses), status: expenses.status === "ready" && !week ? "loading" : expenses.status } as Load,
    scams,
    verdicts,
    week,
  };
}

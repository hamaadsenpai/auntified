"use client";

import { useMemo } from "react";
import { useExpenses, useSettings } from "@/store";
import { byCategory, goalProgress, inRange, sumSgd, useNow, weekLabel, weekWindow } from "./week";

/** This week's spending, per category, and the savings goal, shared by both roast layouts. */
export function useRoast() {
  const { items, status, error } = useExpenses();
  const { settings, status: settingsStatus } = useSettings();
  const now = useNow();

  return useMemo(() => {
    const expenses = [...items].sort((a, b) => Date.parse(b.spentAt) - Date.parse(a.spentAt));
    const range = now ? weekWindow(now) : null;
    const week = range ? expenses.filter((e) => inRange(e, range.start, range.end)) : [];
    const categories = byCategory(week);
    const goal = settings.savingsGoal;
    return {
      status,
      error,
      ready: status === "ready" && now !== null,
      label: now ? weekLabel(now) : "Last 7 days",
      expenses,
      week,
      totalSgd: sumSgd(week),
      categories,
      biggest: categories[0] ?? null,
      /** False while settings load, so the empty goal state doesn't flash. */
      goalLoaded: settingsStatus === "ready" || settingsStatus === "error",
      goal: goal && now ? { ...goal, ...goalProgress(goal, now) } : null,
    };
  }, [items, status, error, settings.savingsGoal, settingsStatus, now]);
}

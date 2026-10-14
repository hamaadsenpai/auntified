"use client";

import { useEffect, useState } from "react";
import { roastService } from "@/services/roast.service";
import type { RoastResult } from "@/types/roast";
import { useRoast } from "./useRoast";

// Both layouts mount at once, so they share one request per week, tone and language.
let cache: { key: string; promise: Promise<RoastResult> } | null = null;

/** Auntie's Gemini badge and roast of this week. "idle" until there is a week with spending to roast. */
export function useAuntieRoast() {
  const { ready, settingsReady, goalLoaded, range, week, tone, language } = useRoast();
  const from = range?.start.toISOString();
  const to = range?.end.toISOString();
  const key =
    ready && settingsReady && from && to && week.length > 0
      ? [from, to, tone, language, ...week.map((e) => `${e.id}:${e.amountSgd}:${e.category}:${e.name}`)].join("|")
      : null;
  const [result, setResult] = useState<{ key: string; roast: RoastResult | null } | null>(null);

  useEffect(() => {
    if (!key || !from || !to) return;
    let live = true;
    if (cache?.key !== key) {
      const promise = roastService.get({ from, to });
      cache = { key, promise };
      // Errors aren't cached, so a later remount can retry.
      promise.catch(() => {
        if (cache?.promise === promise) cache = null;
      });
    }
    cache.promise.then(
      (roast) => live && setResult({ key, roast }),
      () => live && setResult({ key, roast: null }),
    );
    return () => {
      live = false;
    };
  }, [key, from, to]);

  const current = key && result?.key === key ? result : null;
  return {
    // Settings still loading means a roast is coming, so don't flash the fallback first.
    status: !key ? (ready && week.length > 0 && !goalLoaded ? "loading" : "idle") : !current ? "loading" : current.roast ? "ready" : "error",
    badge: current?.roast?.badge ?? null,
    roast: current?.roast?.roast ?? null,
  } as const;
}

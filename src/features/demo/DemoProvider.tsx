"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Money } from "@/components/ui";
import { ROUTES, withTransfer } from "@/constants";
import { DEMO_JUMPS } from "@/constants/demo";
import { formatDay, formatTime, useNow } from "@/features/roast/week";
import { demoService } from "@/services/demo.service";
import { useCreditsStore, useExpenses, useExpensesStore, usePayeesStore, useSettings, useSettingsStore, useTransfers, useTransfersStore } from "@/store";
import { usePayDraftStore } from "@/store/pay-draft.store";
import type { DemoAction } from "@/types/demo";
import { errorMessage } from "@/utils";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

type Action = DemoAction["action"];

type Demo = {
  stats: { label: string; value: ReactNode }[];
  /** The action running now, if any; every button is disabled meanwhile. */
  busy: Action | null;
  jumpHours: number;
  setJumpHours: (hours: number) => void;
  /** Reset asks first: the first press sets this, the confirm button runs it. */
  confirmingReset: boolean;
  setConfirmingReset: (confirming: boolean) => void;
  run: (action: Action) => void;
};

const DemoContext = createContext<Demo | null>(null);

/** "+7d 1h" */
function formatOffset(ms: number) {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.round((ms % DAY_MS) / HOUR_MS);
  return `+${[days && `${days}d`, hours && `${hours}h`].filter(Boolean).join(" ")}`;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;

const DONE: Record<Exclude<Action, "jump">, string> = {
  seed: "Seeded 90 days of data.",
  fire: "Scam payment held. Opening Auntie's check…",
  reset: "Reset. Ledger, log and settings are cleared.",
};

/**
 * Holds the demo controls' state once for the page: mobile and desktop render side by side
 * (one hidden by CSS), like QuickCheckProvider.
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const now = useNow();
  const expenses = useExpenses();
  const transfers = useTransfers();
  const { settings, status: settingsStatus } = useSettings();
  const [clockOffsetMs, setClockOffsetMs] = useState<number | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [jumpHours, setJumpHours] = useState<number>(DEMO_JUMPS[1].hours);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    demoService
      .get()
      .then((s) => setClockOffsetMs(s.clockOffsetMs))
      .catch(() => setClockOffsetMs(0));
  }, []);

  async function run(action: Action) {
    if (busy) return;
    setBusy(action);
    setConfirmingReset(false);
    try {
      const res = await demoService.run(action === "jump" ? { action, hours: jumpHours } : { action });
      setClockOffsetMs(res.clockOffsetMs);
      // Every page reads these stores, so reload them all rather than patch each one.
      for (const store of [usePayeesStore, useExpensesStore, useTransfersStore, useSettingsStore, useCreditsStore]) void store.getState().load(true);
      if (action === "seed" || action === "reset") usePayDraftStore.getState().reset();
      const label = DEMO_JUMPS.find((j) => j.hours === jumpHours)?.label.toLowerCase();
      toast.success(action === "jump" ? `Clock moved forward, ${label}.` : DONE[action]);
      if (res.transferId) router.push(withTransfer(ROUTES.PAY_CHECK, res.transferId));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const ledgerReady = expenses.status === "ready" && transfers.status === "ready";
  const times = [...expenses.items.map((e) => Date.parse(e.spentAt)), ...transfers.items.map((t) => Date.parse(t.createdAt))];
  const days = now && times.length ? Math.max(1, Math.ceil((now.getTime() - Math.min(...times)) / DAY_MS)) : 0;
  const clock = now && clockOffsetMs !== null ? new Date(now.getTime() + clockOffsetMs) : null;

  const stats = [
    {
      label: "Clock",
      value: clock ? `${formatDay(clock)} ${formatTime(clock)}${clockOffsetMs ? ` (${formatOffset(clockOffsetMs)})` : ""}` : "…",
    },
    {
      label: "Ledger",
      value: !ledgerReady ? "…" : times.length ? `${plural(days, "day")}, ${plural(times.length, "txn")}` : "Empty",
    },
    { label: "Balance", value: settingsStatus === "ready" ? <Money sgd={settings.balanceSgd} /> : "…" },
    {
      label: "Scams stopped",
      value: transfers.status === "ready" ? String(transfers.items.filter((t) => t.status === "blocked" || t.status === "cancelled").length) : "…",
    },
  ];

  return (
    <DemoContext.Provider
      value={{ stats, busy, jumpHours, setJumpHours, confirmingReset, setConfirmingReset, run: (a) => void run(a) }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>.");
  return ctx;
}

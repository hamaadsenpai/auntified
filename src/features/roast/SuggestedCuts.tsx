"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Money, NudgeCard } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useSettingsStore } from "@/store";
import { createStore } from "@/store/create-store";
import { cn, errorMessage } from "@/utils";
import type { Cut } from "./cuts";
import { useRoast } from "./useRoast";
import { formatDay } from "./week";

// Both layouts mount at once, so their copies of a card share its saved state: no second tap after a resize.
// shortcut: saved state is per page load, a cancelled subscription shows again until its charges stop.
const useSavedCuts = createStore<{ saved: string[] }>("saved-cuts", () => ({ saved: [] }));

/** The savings forecast and one nudge per suggested cut, each with a tap to put the saving towards the goal. */
export function SuggestedCuts({ large }: { large?: boolean }) {
  const { cuts, forecastSgd, goal, goalLoaded } = useRoast();
  if (cuts.length === 0) return null;
  return (
    <>
      <div className={large ? "flex flex-col gap-[12px] rounded-[20px] bg-wash p-[24px]" : "flex flex-col gap-[8px] rounded-[18px] bg-wash px-[16px] py-[14px]"}>
        <span className={cn("font-semibold text-muted", large ? "text-[14px]" : "text-[13px]")}>Savings forecast this month</span>
        <span className={cn("font-display leading-none font-bold", large ? "text-[44px]" : "text-[30px]")}>
          <Money sgd={forecastSgd} whole />
        </span>
        <span className={cn("font-semibold", large ? "text-[14px]" : "text-[13px]")}>if you make the cuts below.</span>
      </div>
      {cuts.map((cut) => (
        <CutCard key={cut.key} cut={cut} large={large} goalState={!goalLoaded ? "loading" : goal ? "set" : "none"} />
      ))}
    </>
  );
}

function CutCard({ cut, large, goalState }: { cut: Cut; large?: boolean; goalState: "loading" | "set" | "none" }) {
  const saved = useSavedCuts((s) => s.saved.includes(cut.key));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const goal = useSettingsStore.getState().settings.savingsGoal;
    if (!goal || useSavedCuts.getState().saved.includes(cut.key)) return;
    setSaving(true);
    try {
      await useSettingsStore.getState().save({ savingsGoal: { ...goal, savedSgd: Math.round((goal.savedSgd + cut.keepSgd) * 100) / 100 } });
      useSavedCuts.setState((s) => ({ saved: [...s.saved, cut.key] }));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const buttonClass = cn("w-full disabled:opacity-60", !large && "h-[44px] text-[15px]");
  const action =
    goalState === "none" ? (
      <Button variant="secondary" href={ROUTES.SETTINGS} className={buttonClass}>
        Set a savings goal
      </Button>
    ) : goalState === "set" ? (
      <>
        <Button variant="secondary" className={buttonClass} disabled={saving || saved} onClick={handleSave}>
          {saving ? (
            "Saving…"
          ) : saved ? (
            "Added to your goal"
          ) : cut.kind === "category" ? (
            <>
              Put <Money sgd={cut.keepSgd} /> aside
            </>
          ) : (
            <>
              Cancelled it, save <Money sgd={cut.keepSgd} />
            </>
          )}
        </Button>
      </>
    ) : undefined;

  return (
    <NudgeCard className={large ? "gap-[4px] rounded-[20px] px-[20px] py-[16px]" : undefined} bodyClassName={large ? "text-[18px]" : undefined} action={action}>
      {cut.kind === "category" ? (
        <>
          {cut.category} is your biggest leak: <Money sgd={cut.weekSgd} /> over {cut.count} {cut.count === 1 ? "spend" : "spends"}. Halve it and
          keep <Money sgd={cut.keepSgd} /> back.
        </>
      ) : (
        <>
          {cut.leak.name} charged you {cut.leak.charges} times, last on {formatDay(new Date(cut.leak.lastAt))}. Still using it? Cancel and keep{" "}
          <Money sgd={cut.leak.monthlySgd} /> a month.
        </>
      )}
    </NudgeCard>
  );
}

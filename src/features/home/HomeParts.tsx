import Link from "next/link";
import { Money, NudgeCard, ProgressBar } from "@/components/ui";
import { ROUTES } from "@/constants";
import { cn } from "@/utils";
import type { Account, SavingsGoal, Tone } from "@/types/settings";
import { formatDeadline, type useHome } from "./home-data";

type Week = NonNullable<ReturnType<typeof useHome>["week"]>;

const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

/** The extra accounts, set apart from the main balance by a rule and a heading; nothing when there are none. */
export function OtherAccounts({ accounts, className = "mt-[10px] border-t border-line pt-[10px]" }: { accounts: Account[]; className?: string }) {
  if (accounts.length === 0) return null;
  return (
    <div className={cn("flex flex-col gap-[6px]", className)}>
      <span className="text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">Other accounts</span>
      {accounts.map((a) => (
        <div key={a.id} className="flex items-baseline justify-between gap-[12px] text-[15px]">
          <span className="font-semibold text-ink">{a.name}</span>
          <span className="font-display font-bold"><Money sgd={a.balanceSgd} /></span>
        </div>
      ))}
    </div>
  );
}

/** Auntie's line about the last 7 days of expenses. */
export function WeekSentence({ week, tone }: { week: Week; tone: Tone }) {
  if (!week.top) return <>No spending logged this week. Log some on your roast so Auntie can judge.</>;
  return (
    <>
      {plural(week.count, "spend")} this week, <Money sgd={week.totalSgd} />. Top: {week.top.category}, <Money sgd={week.top.totalSgd} />.{" "}
      {tone === "roast" ? "You think money grows on coconut trees, bung?" : "Not bad, but keep an eye on it."}
    </>
  );
}

/** Halve the biggest category this week. Nothing when there's no spending to nudge. */
export function WeekNudge({ week, className, bodyClassName }: { week: Week | null; className?: string; bodyClassName?: string }) {
  if (!week?.top) return null;
  return (
    <NudgeCard className={className} bodyClassName={bodyClassName}>
      Cut {week.top.category} in half: <Money sgd={week.top.totalSgd / 2} /> back.
    </NudgeCard>
  );
}

/** Saved of target by the deadline, or a pointer to Settings when there's no goal. */
export function GoalProgress({ goal, compact = false }: { goal: SavingsGoal | null; compact?: boolean }) {
  if (!goal) {
    return (
      <span className="text-[14px] font-medium text-muted">
        No savings goal yet. <Link href={ROUTES.SETTINGS} className="font-semibold text-teal">Set one in Settings</Link> and Auntie will keep score.
      </span>
    );
  }
  const value = goal.targetSgd > 0 ? Math.min(100, Math.round((goal.savedSgd / goal.targetSgd) * 100)) : 0;
  return (
    <>
      <div className={compact ? "flex items-baseline gap-[8px]" : "flex items-baseline justify-between gap-[8px]"}>
        <span className="font-display text-[26px] leading-none font-bold"><Money sgd={goal.savedSgd} whole /></span>
        <span className="text-[13px] font-medium text-muted">
          of <Money sgd={goal.targetSgd} whole /> by {formatDeadline(goal.deadline)}
        </span>
      </div>
      <ProgressBar value={value} />
    </>
  );
}

"use client";

import Link from "next/link";
import { BackHeader } from "@/components/layout";
import { AuntieBao } from "@/components/mascot";
import { Button, Money, NudgeCard, ProgressBar } from "@/components/ui";
import { ROUTES } from "@/constants";
import { ExpenseList } from "./ExpenseList";
import { useRoast } from "./useRoast";
import { formatDay } from "./week";

export function RoastMobile() {
  const { ready, label, totalSgd, categories, biggest, goal, goalLoaded } = useRoast();
  return (
    <>
      <BackHeader backHref={ROUTES.HOME} title="Weekly roast" subtitle={label} />
      <main className="flex min-h-0 flex-1 flex-col gap-[16px] overflow-y-auto px-[20px] pt-[6px] pb-[16px] *:shrink-0">
        <div className="flex flex-col gap-[4px]">
          <div className="flex items-end justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Leaked this week</span>
              <span className="font-display text-[36px] leading-none font-bold">{ready ? <Money sgd={totalSgd} /> : "…"}</span>
            </div>
            <div className="flex flex-col items-end gap-[2px]">
              <span className="rounded-full border-[2.5px] border-ink bg-white px-[11px] py-[5px] font-display text-[13px] font-semibold whitespace-nowrap">
                aiyoh...
              </span>
              <AuntieBao mood="meh" width={72} height={67} />
            </div>
          </div>
        </div>
        {ready && categories.length === 0 && (
          <p className="m-0 font-display text-[16px] leading-[1.4] font-medium text-muted">Log what you spend and Auntie will roast it here.</p>
        )}
        {categories.length > 0 && (
          <ul className="m-0 flex list-none flex-col border-t border-line p-0">
            {categories.map((c) => (
              <li key={c.category} className="grid grid-cols-[1fr_auto] gap-x-[12px] gap-y-[3px] border-b border-line py-[12px]">
                <span className="text-[16px] font-semibold">{c.category}</span>
                <span className="font-display text-[17px] font-bold"><Money sgd={c.totalSgd} /></span>
                <span className="col-span-full font-display text-[15px] leading-[1.35] font-medium text-muted">{c.count}x this week</span>
              </li>
            ))}
          </ul>
        )}
        <ExpenseList />
        {goal ? (
          <div className="flex flex-col gap-[8px] rounded-[18px] bg-wash px-[16px] py-[14px]">
            <span className="text-[13px] font-semibold text-muted">Savings goal by {formatDay(goal.deadline)}</span>
            <div className="flex items-baseline justify-between gap-[8px]">
              <span className="font-display text-[30px] leading-none font-bold"><Money sgd={goal.savedSgd} whole /></span>
              <span className="text-[13px] font-medium text-muted">Goal <Money sgd={goal.targetSgd} whole /></span>
            </div>
            <ProgressBar value={goal.percent} className="bg-track-alt" />
            <span className="text-[13px] font-semibold">
              {goal.shortSgd === 0 ? (
                "Goal reached."
              ) : (
                <>
                  <Money sgd={goal.shortSgd} whole /> short.{" "}
                  {goal.daysLeft < 0 ? "Deadline passed." : `${goal.daysLeft} ${goal.daysLeft === 1 ? "day" : "days"} left.`}
                </>
              )}
            </span>
          </div>
        ) : (
          goalLoaded && (
            <div className="flex flex-col gap-[4px] rounded-[18px] bg-wash px-[16px] py-[14px]">
              <span className="text-[13px] font-semibold text-muted">No savings goal yet</span>
              <Link href={ROUTES.SETTINGS} className="text-[14px] font-semibold text-teal">
                Set one in Settings
              </Link>
            </div>
          )
        )}
        {biggest && (
          <NudgeCard>
            {biggest.category} is your biggest leak: <Money sgd={biggest.totalSgd} /> over {biggest.count}{" "}
            {biggest.count === 1 ? "spend" : "spends"}. Halve it and keep <Money sgd={biggest.totalSgd / 2} /> back.
          </NudgeCard>
        )}
      </main>
      <div className="flex flex-none flex-col gap-[10px] border-t border-line px-[20px] pt-[12px] pb-[24px]">
        <Button variant="secondary" href={ROUTES.ASK}>
          Ask Auntie about it
        </Button>
      </div>
    </>
  );
}

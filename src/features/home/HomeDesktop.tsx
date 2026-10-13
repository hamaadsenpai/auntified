"use client";

import Link from "next/link";
import { SettingsIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Card, Money, Tag } from "@/components/ui";
import { ROUTES } from "@/constants";
import { formatWeekday, STATUS_TAG } from "@/features/ledger/history";
import { useHome } from "./home-data";
import { HomeAskForm } from "./HomeAskForm";
import { GoalProgress, WeekNudge, WeekSentence } from "./HomeParts";
import { LoadNote } from "./LoadNote";

const CARD = "flex flex-col gap-[4px] rounded-[22px] px-[24px] py-[20px] shadow-hard-md";
const PANEL = "flex flex-col rounded-[24px] border-[2.5px] border-ink shadow-hard-md";

const ROW = "grid min-h-[48px] grid-cols-[1fr_auto_auto] items-center gap-[12px] text-[14px] font-medium";

export function HomeDesktop() {
  const home = useHome();
  const { settings, scams, week, verdicts } = home;
  // Bars share one scale: the biggest "now" or "normal" figure is full width.
  const scale = Math.max(1, ...(week?.vsNormal ?? []).flatMap((p) => [p.totalSgd, p.normalSgd]));
  return (
    <main className="hidden min-h-dvh min-w-0 flex-col gap-[24px] bg-white px-[40px] py-[32px] lg:flex">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-medium text-muted">{home.today === null ? " " : formatWeekday(home.today)}</span>
          <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold">Home</h1>
        </div>
        <Link href={ROUTES.SETTINGS} aria-label="Settings" className="flex h-[44px] w-[44px] items-center justify-center rounded-[22px] border-[1.5px] border-line-strong">
          <SettingsIcon />
        </Link>
      </header>
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-[16px]">
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Available balance</span>
          <LoadNote load={home.settingsLoad}>
            <span className="font-display text-[48px] leading-[1.05] font-bold"><Money sgd={settings.balanceSgd} /></span>
            <span className="text-[13px] font-medium text-muted">{settings.accountName}</span>
          </LoadNote>
        </Card>
        <Card className={CARD}>
          <div className="flex justify-between gap-[8px]">
            <div className="flex flex-col gap-[4px]">
              <span className="text-[13px] font-medium text-muted">Saved with Auntie</span>
              <LoadNote load={home.settingsLoad}>
                {settings.savingsGoal ? (
                  <>
                    <span className="font-display text-[34px] leading-[1.1] font-bold"><Money sgd={settings.savingsGoal.savedSgd} whole /></span>
                    <span className="text-[13px] font-medium text-muted">toward your goal</span>
                  </>
                ) : (
                  <Link href={ROUTES.SETTINGS} className="text-[15px] font-semibold text-teal">
                    Set a goal in Settings
                  </Link>
                )}
              </LoadNote>
            </div>
            <AuntieBao mood="smug" width={60} height={56} />
          </div>
        </Card>
        <Card className={CARD}>
          <span className="text-[13px] font-medium text-muted">Scams stopped</span>
          <LoadNote load={home.transfersLoad}>
            <span className="font-display text-[34px] leading-[1.1] font-bold">{scams.count}</span>
            <span className="text-[13px] font-medium text-muted"><Money sgd={scams.keptSgd} /> kept</span>
          </LoadNote>
        </Card>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-[24px]">
        <section aria-label="Auntie's chat" className={`${PANEL} gap-[14px] p-[24px]`}>
          <div className="flex max-w-[520px] items-start gap-[12px]">
            <AuntieBao mood="meh" width={52} height={48} />
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-bold text-teal">Auntie Kumari</span>
              <AuntieBubble className="rounded-[6px_24px_24px_24px] px-[18px] py-[14px] text-[18px] text-pretty">
                <LoadNote load={home.expensesLoad}>{week && <WeekSentence week={week} tone={settings.tone} />}</LoadNote>
              </AuntieBubble>
            </div>
          </div>
          <div className="ml-[48px] grid max-w-[520px] grid-cols-[1fr_1fr] gap-[12px]">
            <div className="flex flex-col gap-[8px] rounded-[16px] border border-line-strong px-[16px] py-[14px]">
              <span className="text-[13px] font-semibold text-muted">Savings goal</span>
              <LoadNote load={home.settingsLoad}>
                <GoalProgress goal={settings.savingsGoal} compact />
              </LoadNote>
            </div>
            <WeekNudge
              week={home.expensesLoad.status === "ready" ? week : null}
              className="gap-[4px] rounded-[20px] px-[16px] py-[14px]"
              bodyClassName="text-[16px]"
            />
          </div>
          <div className="ml-[48px] flex gap-[24px]">
            <Link href={ROUTES.ROAST} className="flex min-h-[44px] items-center text-[15px] font-semibold text-teal">
              Read the full roast
            </Link>
          </div>
          <HomeAskForm />
        </section>
        <div className="flex flex-col gap-[24px]">
          <section className={`${PANEL} gap-[14px] px-[24px] py-[20px]`}>
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 font-display text-[17px] font-bold">This week vs normal</h2>
              <Link href={ROUTES.PATTERNS} className="text-[13px] font-semibold text-teal">
                Your patterns
              </Link>
            </div>
            <LoadNote load={home.expensesLoad}>
              {!week?.vsNormal.length ? (
                <p className="m-0 text-[14px] font-medium text-muted">
                  No spending logged this week. Log some on your{" "}
                  <Link href={ROUTES.ROAST} className="font-semibold text-teal">roast</Link> to see it against your normal.
                </p>
              ) : (
                week.vsNormal.map((p) => (
                  <div key={p.category} className="flex flex-col gap-[5px]">
                    <div className="flex justify-between text-[14px] font-semibold">
                      <span>{p.category}</span>
                      <span>
                        <Money sgd={p.totalSgd} />{" "}
                        <span className="font-medium text-muted">
                          {week.hasNormal ? <>vs <Money sgd={p.normalSgd} whole /></> : "no normal yet"}
                        </span>
                      </span>
                    </div>
                    <div className="flex h-[8px]">
                      <span className="rounded-[4px] bg-teal" style={{ width: `${(p.totalSgd / scale) * 100}%` }}></span>
                    </div>
                    <div className="flex h-[8px]">
                      <span className="rounded-[4px] bg-mint" style={{ width: `${(p.normalSgd / scale) * 100}%` }}></span>
                    </div>
                  </div>
                ))
              )}
            </LoadNote>
          </section>
          <section className={`${PANEL} gap-[4px] px-[24px] py-[20px]`}>
            <div className="flex items-baseline justify-between pb-[6px]">
              <h2 className="m-0 font-display text-[17px] font-bold">Latest verdicts</h2>
              <Link href={ROUTES.LEDGER} className="text-[13px] font-semibold text-teal">
                Open ledger
              </Link>
            </div>
            <LoadNote load={home.transfersLoad}>
              {verdicts.length === 0 ? (
                <p className="m-0 text-[14px] font-medium text-muted">
                  No verdicts yet. <Link href={ROUTES.PAY} className="font-semibold text-teal">Send a payment</Link> and Auntie checks it first.
                </p>
              ) : (
                verdicts.map((t, i) => (
                  <div key={t.id} className={i < verdicts.length - 1 ? `${ROW} border-b border-line` : ROW}>
                    <span><strong className="font-semibold">{t.payeeName}</strong> <Money sgd={t.amountSgd} /></span>
                    <span className="font-display text-[15px] font-bold">{Math.round(t.score ?? 0)}</span>
                    <Tag variant={STATUS_TAG[t.status].tag}>{STATUS_TAG[t.status].label}</Tag>
                  </div>
                ))
              )}
            </LoadNote>
          </section>
        </div>
      </div>
    </main>
  );
}

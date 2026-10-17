import Link from "next/link";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Button, Card, Money } from "@/components/ui";
import { ROUTES } from "@/constants";
import { lkr } from "@/constants/currencies";
import { MARKETING_FEATURES } from "@/features/marketing/features";

const WRAP = "mx-auto w-full max-w-[1120px] px-[16px] lg:px-[40px]";
const EYEBROW = "m-0 text-[12px] font-bold tracking-[.06em] text-teal uppercase";
const H2 = "m-0 font-display text-[28px] leading-[1.15] font-bold text-balance lg:text-[36px]";

const STEPS = [
  {
    title: "Connect your account",
    body: "Auntie reads your transactions. This demo runs on sample data, no bank connected.",
  },
  {
    title: "Auntie watches",
    body: "She keeps an eye on your transfers and spending against your normal week.",
  },
  {
    title: "She steps in",
    body: "Risky transfer? She warns you or blocks it before the money leaves.",
  },
];

const HIGHLIGHTS = MARKETING_FEATURES.slice(0, 4);

export function LandingScreen() {
  return (
    <main className="flex flex-col">
      <section aria-labelledby="hero-title" className={`${WRAP} grid items-center gap-[32px] py-[40px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-[56px] lg:py-[80px]`}>
        <div className="flex flex-col gap-[20px]">
          <h1 id="hero-title" className="m-0 font-display text-[38px] leading-[1.05] font-bold text-balance lg:text-[58px]">
            Auntie checks before your money goes.
          </h1>
          <p className="m-0 max-w-[520px] text-[17px] leading-[1.5] font-medium text-muted text-pretty lg:text-[19px]">
            Auntie Kumari reads your spending, calls out the leaks and stops risky transfers before they leave your account.
          </p>
          <div className="flex flex-wrap gap-[12px] pt-[4px]">
            <Button href={ROUTES.SIGNUP} className="px-[28px]">
              Get started
            </Button>
            <Button href={ROUTES.FEATURES} variant="secondary" className="px-[28px]">
              See features
            </Button>
          </div>
        </div>
        <Card className="flex flex-col gap-[16px] rounded-[24px] bg-white p-[20px] shadow-hard-md sm:p-[28px]">
          <div className="flex items-end gap-[16px]">
            <AuntieBao mood="smug" width={104} height={97} />
            <div className="flex flex-col gap-[2px] pb-[8px]">
              <span className="font-display text-[20px] leading-none font-bold">Auntie Kumari</span>
              <span className="text-[14px] font-medium text-muted">Blunt, but on your side</span>
            </div>
          </div>
          <AuntieBubble className="text-pretty">
            Four short eats runs and two food deliveries this week. <Money sgd={lkr(7_850)} />. You think money grows on coconut trees, bung?
          </AuntieBubble>
          <AuntieBubble className="rounded-[22px] text-pretty">Who is Kasun Perera to you? He told you to pay today?</AuntieBubble>
        </Card>
      </section>

      <section aria-labelledby="how-title" className="border-y border-line bg-white">
        <div className={`${WRAP} flex flex-col gap-[28px] py-[48px] lg:py-[72px]`}>
          <div className="flex flex-col gap-[8px]">
            <p className={EYEBROW}>How it works</p>
            <h2 id="how-title" className={H2}>Three steps, then she does the nagging.</h2>
          </div>
          <ol className="m-0 grid list-none gap-[16px] p-0 md:grid-cols-3 lg:gap-[24px]">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <Card className="flex h-full flex-col gap-[10px] bg-cream p-[20px] lg:p-[24px]">
                  <span
                    aria-hidden="true"
                    className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-[2.5px] border-ink bg-sun font-display text-[18px] font-bold"
                  >
                    {i + 1}
                  </span>
                  <h3 className="m-0 font-display text-[20px] leading-[1.2] font-bold">{step.title}</h3>
                  <p className="m-0 text-[15px] leading-[1.5] font-medium text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="features-title" className={`${WRAP} flex flex-col gap-[28px] py-[48px] lg:py-[72px]`}>
        <div className="flex flex-col gap-[16px] sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-[8px]">
            <p className={EYEBROW}>What she does</p>
            <h2 id="features-title" className={H2}>Less guessing, fewer regrets.</h2>
          </div>
          <Link href={ROUTES.FEATURES} className="flex min-h-[44px] items-center gap-[4px] text-[15px] font-semibold no-underline">
            See all features
            <ChevronRightIcon />
          </Link>
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((f) => (
            <Card key={f.key} className="flex flex-col gap-[8px] bg-white p-[20px]">
              <h3 className="m-0 font-display text-[18px] leading-[1.2] font-bold">{f.title}</h3>
              <p className="m-0 text-[15px] leading-[1.5] font-medium text-muted">{f.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="trust-title" className="border-y border-line bg-white">
        <div className={`${WRAP} py-[40px] lg:py-[56px]`}>
          <Card className="flex flex-col gap-[16px] bg-lemon p-[20px] sm:flex-row sm:items-center sm:gap-[24px] lg:p-[28px]">
            <AuntieBao mood="alarm" width={72} height={67} />
            <div className="flex flex-col gap-[8px]">
              <h2 id="trust-title" className="m-0 font-display text-[22px] leading-[1.2] font-bold lg:text-[24px]">
                Auntie never asks for your PIN, password or OTP.
              </h2>
              <ul className="m-0 flex list-none flex-col gap-[6px] p-0 text-[15px] leading-[1.5] font-medium">
                <li className="flex items-start gap-[8px]">
                  <CheckIcon className="mt-[2px] flex-none" />
                  Anyone asking for those is not Auntie. Do not share them.
                </li>
                <li className="flex items-start gap-[8px]">
                  <CheckIcon className="mt-[2px] flex-none" />
                  She is an assistant, not a financial adviser.
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </section>

      <section aria-labelledby="cta-title" className={`${WRAP} py-[48px] lg:py-[80px]`}>
        <Card className="flex flex-col items-center gap-[16px] rounded-[24px] bg-mint px-[20px] py-[36px] text-center shadow-hard-md lg:py-[48px]">
          <AuntieBao mood="meh" width={80} height={75} />
          <h2 id="cta-title" className={H2}>Let Auntie check your next transfer.</h2>
          <p className="m-0 max-w-[460px] text-[16px] leading-[1.5] font-medium text-muted text-pretty">
            Sign up and try it on demo data. No bank needed.
          </p>
          <Button href={ROUTES.SIGNUP} className="px-[32px]">
            Get started
          </Button>
          <p className="m-0 text-[15px] font-medium text-muted">
            Have an account?{" "}
            <Link href={ROUTES.LOGIN} className="font-semibold">
              Log in
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}

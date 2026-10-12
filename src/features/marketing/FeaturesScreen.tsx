import Link from "next/link";
import { CheckIcon, ChevronRightIcon } from "@/components/icons";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants";
import { MARKETING_FEATURES } from "./features";

const CONTAINER = "mx-auto w-full max-w-[1120px] px-[16px] lg:px-[40px]";

export function FeaturesScreen() {
  return (
    <main className="flex flex-1 flex-col gap-[40px] py-[40px] lg:gap-[56px] lg:py-[64px]">
      <header className={CONTAINER}>
        <div className="flex items-end justify-between gap-[16px]">
          <div className="flex flex-col gap-[8px]">
            <h1 className="m-0 font-display text-[32px] leading-[1.1] font-bold lg:text-[44px]">What Auntie does</h1>
            <p className="m-0 text-[16px] leading-[1.45] font-medium text-muted lg:text-[18px]">
              Everything she does today. Each card opens the demo screen.
            </p>
          </div>
          <AuntieBao mood="smug" width={72} height={67} className="hidden flex-none sm:block" />
        </div>
      </header>

      <section aria-label="Features" className={CONTAINER}>
        <ul className="m-0 grid list-none grid-cols-1 gap-[16px] p-0 sm:grid-cols-2 lg:gap-[20px] xl:grid-cols-4">
          {MARKETING_FEATURES.map((feature) => (
            <li key={feature.key} className="flex">
              <Card className="flex w-full flex-col gap-[12px] bg-white p-[20px]">
                <h2 className="m-0 font-display text-[18px] leading-[1.2] font-bold">{feature.title}</h2>
                <p className="m-0 text-[15px] leading-[1.5] font-medium text-muted">{feature.summary}</p>
                <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
                  {feature.points.map((point) => (
                    <li key={point} className="flex gap-[8px] text-[14px] leading-[1.4] font-semibold">
                      <CheckIcon size={18} className="mt-[1px] flex-none" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={feature.href}
                  aria-label={`Try it, ${feature.title}`}
                  className="mt-auto inline-flex min-h-[44px] items-center gap-[4px] self-start text-[15px] font-semibold no-underline"
                >
                  Try it
                  <ChevronRightIcon size={16} />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="features-cta" className={CONTAINER}>
        <Card className="flex flex-col gap-[20px] rounded-[24px] bg-white p-[20px] shadow-hard-md sm:p-[28px] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-[12px]">
            <AuntieBao mood="meh" width={56} height={52} className="flex-none" />
            <div className="flex min-w-0 flex-col gap-[10px]">
              <h2 id="features-cta" className="m-0 font-display text-[28px] leading-[1.15] font-bold text-balance lg:text-[36px]">
                Try Auntie for yourself
              </h2>
              <AuntieBubble className="self-start text-[15px]">
                Demo money only, no bank connected. So what is your excuse?
              </AuntieBubble>
            </div>
          </div>
          <div className="flex flex-col gap-[12px] md:w-[240px] md:flex-none">
            <Button href={ROUTES.SIGNUP} className="w-full px-[24px]">
              Get started
            </Button>
            <p className="m-0 text-center text-[15px] font-medium text-muted">
              Have an account?{" "}
              <Link href={ROUTES.LOGIN} className="font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}

import { Suspense } from "react";
import { AuntieBao } from "@/components/mascot";
import { AuntieBubble, Card } from "@/components/ui";
import { OnboardingGate } from "./OnboardingGate";

/** First stop after sign-up: asks for a currency before the app. The card is static; only the form waits on the session. */
export function OnboardingScreen() {
  return (
    <main className="flex min-h-dvh bg-cream">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-center px-[16px] py-[40px] lg:px-[40px] lg:py-[64px]">
        <Card className="flex w-full max-w-[440px] flex-col gap-[24px] rounded-[24px] bg-white px-[20px] py-[24px] shadow-hard-md sm:px-[32px] sm:py-[32px]">
          <div className="flex items-start gap-[12px]">
            <AuntieBao mood="meh" width={64} height={60} />
            <AuntieBubble className="min-w-0 flex-1">Before anything, tell Auntie what money you use.</AuntieBubble>
          </div>
          <div className="flex flex-col gap-[4px]">
            <h1 className="m-0 font-display text-[28px] leading-[1.1] font-bold">One quick thing</h1>
            <p className="m-0 text-[14px] font-medium text-muted">Pick your currency. You can change it later in Settings.</p>
          </div>
          <Suspense fallback={null}>
            <OnboardingGate />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}

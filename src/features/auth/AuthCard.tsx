import Link from "next/link";
import type { ReactNode } from "react";
import { AuntieBao, type AuntieBaoMood } from "@/components/mascot";
import { AuntieBubble, Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants";

type AuthCardProps = {
  title: string;
  greeting: string;
  mood?: AuntieBaoMood;
  submitLabel: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
};

/**
 * Shared shell for Log in and Sign up. There is no auth backend yet, so the form is a plain GET to the demo home.
 * Fields have no `name`, so nothing typed (passwords included) ends up in the URL.
 */
export function AuthCard({ title, greeting, mood = "meh", submitLabel, switchPrompt, switchLabel, switchHref, children }: AuthCardProps) {
  return (
    <main className="flex flex-1 bg-cream">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-center px-[16px] py-[40px] lg:px-[40px] lg:py-[64px]">
        <Card className="flex w-full max-w-[440px] flex-col gap-[24px] rounded-[24px] bg-white px-[20px] py-[24px] shadow-hard-md sm:px-[32px] sm:py-[32px]">
          <div className="flex items-start gap-[12px]">
            <AuntieBao mood={mood} width={64} height={60} />
            <AuntieBubble className="min-w-0 flex-1">{greeting}</AuntieBubble>
          </div>
          <div className="flex flex-col gap-[4px]">
            <h1 className="m-0 font-display text-[28px] leading-[1.1] font-bold">{title}</h1>
            <p className="m-0 text-[14px] font-medium text-muted">Demo only. Any details work and nothing is saved.</p>
          </div>
          <form action={ROUTES.HOME} className="flex flex-col gap-[16px]">
            {children}
            <Button type="submit" className="mt-[4px] w-full">
              {submitLabel}
            </Button>
          </form>
          <p className="m-0 text-center text-[15px] font-medium text-muted">
            {switchPrompt}{" "}
            <Link href={switchHref} className="font-semibold">
              {switchLabel}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}

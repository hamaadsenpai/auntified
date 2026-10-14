"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { GoogleIcon } from "@/components/icons";
import { AuntieBao, type AuntieBaoMood } from "@/components/mascot";
import { AuntieBubble, Button, Card } from "@/components/ui";
import { ROUTES } from "@/constants";
import { authErrorMessage, authService, safeNextPath } from "@/services/auth.service";

type AuthCardProps = {
  title: string;
  intro: string;
  greeting: string;
  mood?: AuntieBaoMood;
  submitLabel: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  /** Signs in with the form's fields. Throw to show an error. */
  onSubmit: (data: FormData) => Promise<void>;
  children: ReactNode;
};

/** Shared shell for Log in and Sign up: Google button, email form, errors, and the redirect once signed in. */
export function AuthCard({ title, intro, greeting, mood = "meh", submitLabel, switchPrompt, switchLabel, switchHref, onSubmit, children }: AuthCardProps) {
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  async function run(kind: "email" | "google", signIn: () => Promise<void>) {
    setPending(kind);
    try {
      await signIn();
      // Full load, so the server renders with the new session cookie and no stale client cache survives.
      location.assign(safeNextPath(new URLSearchParams(location.search).get("next"), ROUTES.HOME));
    } catch (err) {
      toast.error(authErrorMessage(err));
      setPending(null);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    void run("email", () => onSubmit(data));
  }

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
            <p className="m-0 text-[14px] font-medium text-muted">{intro}</p>
          </div>
          <Button
            variant="secondary"
            className="flex w-full items-center justify-center gap-[10px] border-ink text-night"
            disabled={pending !== null}
            onClick={() => void run("google", authService.signInWithGoogle)}
          >
            <GoogleIcon />
            {pending === "google" ? "Opening Google…" : "Continue with Google"}
          </Button>
          <div className="flex items-center gap-[12px] text-[13px] font-semibold text-muted" aria-hidden="true">
            <span className="h-[1.5px] flex-1 bg-line-strong"></span>
            or use email
            <span className="h-[1.5px] flex-1 bg-line-strong"></span>
          </div>
          {/* POST, so a submit before the JS loads can never put the password in the URL. */}
          <form method="post" onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            {children}
            <Button type="submit" className="mt-[4px] w-full disabled:opacity-60" disabled={pending !== null}>
              {pending === "email" ? "One moment…" : submitLabel}
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

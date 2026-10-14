"use client";

import Link from "next/link";
import { ROUTES } from "@/constants";
import { authService } from "@/services/auth.service";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

export function SignupScreen() {
  return (
    <AuthCard
      title="Create account"
      intro="Use Google, or sign up with your email."
      greeting="New? Sit down first. Auntie wants to know who she is looking after."
      submitLabel="Create account"
      switchPrompt="Have an account?"
      switchLabel="Log in"
      switchHref={ROUTES.LOGIN}
      onSubmit={(data) =>
        authService.signUpWithEmail(
          String(data.get("name")).trim(),
          String(data.get("email")),
          String(data.get("password")),
          data.get("terms") === "on",
        )
      }
    >
      <AuthField id="signup-name" name="name" label="Name" type="text" autoComplete="name" required />
      <AuthField id="signup-email" name="email" label="Email" type="email" autoComplete="email" inputMode="email" required />
      <AuthField
        id="signup-password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="At least 8 characters."
        required
      />
      <label className="flex cursor-pointer items-start gap-[12px] text-[14px] font-medium">
        <input type="checkbox" name="terms" required className="m-0 mt-[1px] h-[20px] w-[20px] flex-none cursor-pointer accent-teal" />
        <span>
          I agree to the{" "}
          <Link href={ROUTES.TERMS} target="_blank" className="font-semibold">
            terms
          </Link>
          , and I know this demo does not connect to a bank.
        </span>
      </label>
      <p className="m-0 rounded-[14px] bg-wash px-[14px] py-[10px] text-[13px] font-semibold text-muted">
        Auntie never asks for your PIN, password or OTP.
      </p>
    </AuthCard>
  );
}

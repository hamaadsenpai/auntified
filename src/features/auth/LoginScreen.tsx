"use client";

import { useState } from "react";
import { ROUTES } from "@/constants";
import { authErrorMessage, authService } from "@/services/auth.service";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

export function LoginScreen() {
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleForgotPassword(e: React.MouseEvent<HTMLButtonElement>) {
    const email = String(new FormData(e.currentTarget.form ?? undefined).get("email") ?? "").trim();
    setSendingReset(true);
    try {
      await authService.sendPasswordReset(email);
      setResetStatus("If there's an account for that email, a reset link is on its way. Check your inbox.");
    } catch (err) {
      setResetStatus(authErrorMessage(err));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <AuthCard
      title="Log in"
      intro="Use Google or your email and password."
      greeting="You came back. Good, we have things to discuss."
      mood="smug"
      submitLabel="Log in"
      switchPrompt="New here?"
      switchLabel="Sign up"
      switchHref={ROUTES.SIGNUP}
      onSubmit={(data) => authService.signInWithEmail(String(data.get("email")), String(data.get("password")))}
    >
      <AuthField id="login-email" name="email" label="Email" type="email" autoComplete="email" inputMode="email" required />
      <AuthField id="login-password" name="password" label="Password" type="password" autoComplete="current-password" required />
      <button
        type="button"
        onClick={handleForgotPassword}
        disabled={sendingReset}
        className="self-start text-[14px] font-semibold underline disabled:opacity-60"
      >
        {sendingReset ? "Sending…" : "Forgot password?"}
      </button>
      {resetStatus && (
        <p role="status" className="m-0 text-[14px] font-medium text-muted">
          {resetStatus}
        </p>
      )}
    </AuthCard>
  );
}

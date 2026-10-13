"use client";

import { ROUTES } from "@/constants";
import { authService } from "@/services/auth.service";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

export function LoginScreen() {
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
    </AuthCard>
  );
}

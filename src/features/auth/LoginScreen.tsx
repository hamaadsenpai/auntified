import { ROUTES } from "@/constants";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

export function LoginScreen() {
  return (
    <AuthCard
      title="Log in"
      greeting="You came back. Good, we have things to discuss."
      mood="smug"
      submitLabel="Log in"
      switchPrompt="New here?"
      switchLabel="Sign up"
      switchHref={ROUTES.SIGNUP}
    >
      <AuthField id="login-email" label="Email" type="email" autoComplete="email" inputMode="email" required />
      <AuthField id="login-password" label="Password" type="password" autoComplete="current-password" required />
    </AuthCard>
  );
}

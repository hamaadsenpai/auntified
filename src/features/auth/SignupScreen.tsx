import { ROUTES } from "@/constants";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

export function SignupScreen() {
  return (
    <AuthCard
      title="Create account"
      greeting="New? Sit down first. Auntie wants to know who she is looking after."
      submitLabel="Create account"
      switchPrompt="Have an account?"
      switchLabel="Log in"
      switchHref={ROUTES.LOGIN}
    >
      <AuthField id="signup-name" label="Name" type="text" autoComplete="name" required />
      <AuthField id="signup-email" label="Email" type="email" autoComplete="email" inputMode="email" required />
      <AuthField
        id="signup-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        hint="At least 8 characters."
        required
      />
      <label className="flex cursor-pointer items-start gap-[12px] text-[14px] font-medium">
        <input type="checkbox" required className="m-0 mt-[1px] h-[20px] w-[20px] flex-none cursor-pointer accent-teal" />
        <span>I agree to the terms, and I know this demo does not connect to a bank.</span>
      </label>
      <p className="m-0 rounded-[14px] bg-wash px-[14px] py-[10px] text-[13px] font-semibold text-muted">
        Auntie never asks for your PIN, password or OTP.
      </p>
    </AuthCard>
  );
}

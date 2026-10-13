import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { requireUser } from "@/server/auth/session";
import { getUserProfile } from "@/server/repositories/users.repository";
import { OnboardingForm } from "./OnboardingForm";

/** Reads the session and profile, so it renders inside <Suspense>. Onboarded users go straight to Home. */
export async function OnboardingGate() {
  const user = await requireUser();
  const profile = await getUserProfile(user.uid);
  if (profile?.onboarded) redirect(ROUTES.HOME);
  return <OnboardingForm initialCurrency={profile?.currency ?? null} />;
}

import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { requireUser } from "@/server/auth/session";
import { getUserProfile } from "@/server/repositories/users.repository";
import { CurrencySync } from "@/store/CurrencySync";
import { CurrencyBanner } from "./CurrencyBanner";

/**
 * The real session check for the (app) pages: the proxy only sees that a cookie exists.
 * Also sends new users to onboarding and seeds the client store with the profile currency,
 * or shows the banner asking for one when the profile has none.
 * Reads cookies, so it renders inside <Suspense> and the rest of the page keeps its static shell.
 */
export async function SessionGuard() {
  const user = await requireUser();
  const profile = await getUserProfile(user.uid);
  if (!profile?.onboarded) redirect(ROUTES.ONBOARDING);
  return profile.currency ? <CurrencySync code={profile.currency} /> : <CurrencyBanner />;
}

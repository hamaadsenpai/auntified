import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";
import { getCurrentUser } from "@/server/auth/session";

/** Sends signed-in users away from /login and /signup. Reads cookies, so it renders inside <Suspense>. */
export async function SignedInRedirect() {
  if (await getCurrentUser()) redirect(ROUTES.HOME);
  return null;
}

import type { Metadata } from "next";
import { OnboardingScreen } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Welcome · Auntified",
};

export default function Page() {
  return <OnboardingScreen />;
}

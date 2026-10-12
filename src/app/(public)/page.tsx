import type { Metadata } from "next";
import { LandingScreen } from "@/features/landing";

export const metadata: Metadata = {
  title: "Auntified, Auntie checks before you pay",
};

export default function Page() {
  return <LandingScreen />;
}

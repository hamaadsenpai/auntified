import type { Metadata } from "next";
import { TermsScreen } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Terms · Auntified",
};

export default function Page() {
  return <TermsScreen />;
}

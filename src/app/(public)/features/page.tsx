import type { Metadata } from "next";
import { FeaturesScreen } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Features · Auntified",
};

export default function Page() {
  return <FeaturesScreen />;
}

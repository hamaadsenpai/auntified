import type { Metadata } from "next";
import { SignupScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign up · Auntified",
};

export default function Page() {
  return <SignupScreen />;
}

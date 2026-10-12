import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth";

export const metadata: Metadata = {
  title: "Log in · Auntified",
};

export default function Page() {
  return <LoginScreen />;
}

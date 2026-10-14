import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/features/auth";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";

export const metadata: Metadata = {
  title: "Log in · Auntified",
};

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <LoginScreen />
    </>
  );
}

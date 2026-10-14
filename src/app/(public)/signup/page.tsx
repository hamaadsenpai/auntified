import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupScreen } from "@/features/auth";
import { SignedInRedirect } from "@/features/auth/SignedInRedirect";

export const metadata: Metadata = {
  title: "Sign up · Auntified",
};

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <SignupScreen />
    </>
  );
}

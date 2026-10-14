"use client";

import { Toaster as HotToaster } from "react-hot-toast";

/** The app's one toast stack, styled like our hard-shadow cards. Call `toast` / `toast.error` from react-hot-toast to show one. */
export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      containerStyle={{ top: 16, left: 16, right: 16 }}
      toastOptions={{
        duration: 4000,
        style: {
          maxWidth: 420,
          padding: "10px 14px",
          border: "2.5px solid var(--color-ink)",
          borderRadius: 16,
          background: "white",
          boxShadow: "var(--shadow-hard-sm)",
          color: "var(--color-night)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.35,
        },
        success: { iconTheme: { primary: "var(--color-teal)", secondary: "white" } },
        error: {
          duration: 6000,
          ariaProps: { role: "alert", "aria-live": "assertive" },
          iconTheme: { primary: "var(--color-brick)", secondary: "white" },
        },
      }}
    />
  );
}

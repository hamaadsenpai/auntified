"use client";

import { useState } from "react";
import { ROUTES } from "@/constants";
import { authService } from "@/services/auth.service";
import { useCurrencyStore } from "@/store";
import { cn } from "@/utils";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await authService.signOut();
    } finally {
      // Clear the saved currency so the next person on this browser doesn't inherit it.
      useCurrencyStore.persist.clearStorage();
      // Full load wipes every in-memory store, and the proxy now sees no cookie.
      location.assign(ROUTES.LOGIN);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={pending}
      className={cn("min-h-[44px] flex-none cursor-pointer border-none bg-transparent p-0 text-[14px] font-semibold text-brick disabled:opacity-60", className)}
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

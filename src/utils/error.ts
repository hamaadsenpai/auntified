import type { ApiFailure } from "@/types/api";

/** The API failure's message, or a generic retry line for anything else thrown. */
export function errorMessage(err: unknown) {
  return (err as ApiFailure["error"] | undefined)?.message ?? "Something went wrong. Try again.";
}

import "server-only";
import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "@/types/api";
import { ApiError } from "./errors";

export function ok<T>(data: T) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data });
}

/** Never leaks stack traces or Firestore internals: unknown errors become a generic 500. */
export function fail(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json<ApiFailure>(
      { success: false, error: { code: err.code, message: err.message } },
      { status: err.status },
    );
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json<ApiFailure>(
    { success: false, error: { code: "INTERNAL", message: "Something went wrong. Try again." } },
    { status: 500 },
  );
}

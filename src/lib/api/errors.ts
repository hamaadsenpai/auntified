import "server-only";

/** An expected failure: its code and message are safe to send to the client. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }

  static badRequest(message = "Invalid request.") {
    return new ApiError(400, "BAD_REQUEST", message);
  }

  static unauthorized(message = "Please sign in.") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Not allowed.") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Not found.") {
    return new ApiError(404, "NOT_FOUND", message);
  }
}

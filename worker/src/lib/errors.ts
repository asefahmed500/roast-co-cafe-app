import type { ZodType } from "zod";
import type { z } from "zod";

export type FieldIssue = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: FieldIssue[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const errors = {
  badRequest: (message = "Invalid request", issues?: FieldIssue[]) =>
    new ApiError(400, "BAD_REQUEST", message, issues),
  unauthorized: (message = "Please sign in to continue") =>
    new ApiError(401, "UNAUTHORIZED", message),
  forbidden: (message = "You do not have access to this resource") =>
    new ApiError(403, "FORBIDDEN", message),
  notFound: (message = "Resource not found") =>
    new ApiError(404, "NOT_FOUND", message),
  conflict: (message = "This resource already exists") =>
    new ApiError(409, "CONFLICT", message),
  tooMany: (message = "Too many requests. Please try again shortly") =>
    new ApiError(429, "RATE_LIMITED", message),
  internal: (message = "Something went wrong on our end") =>
    new ApiError(500, "INTERNAL", message),
};

/** Parse untrusted input with Zod and surface field-level errors to the client. */
export function parseOrThrow<S extends ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw errors.badRequest(
      "Please check the highlighted fields",
      result.error.issues.map((issue) => ({
        path: issue.path.join(".") || "form",
        message: issue.message,
      })),
    );
  }
  return result.data;
}

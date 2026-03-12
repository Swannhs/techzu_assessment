import { ZodType } from "zod";
import { ApiError } from "./apiError.js";

export function validate<T>(schema: ZodType<T>, payload: unknown): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: parsed.error.flatten()
    });
  }
  return parsed.data;
}

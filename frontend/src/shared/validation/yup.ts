import { ValidationError } from "yup";

export type FieldErrors = Record<string, string>;

export function mapYupErrors(error: unknown): FieldErrors {
  if (!(error instanceof ValidationError)) {
    return {};
  }

  const nextErrors: FieldErrors = {};

  if (error.inner.length === 0 && error.path) {
    nextErrors[error.path] = error.message;
    return nextErrors;
  }

  for (const issue of error.inner) {
    if (issue.path && !nextErrors[issue.path]) {
      nextErrors[issue.path] = issue.message;
    }
  }

  return nextErrors;
}

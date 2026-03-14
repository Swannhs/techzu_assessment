import { ApiClientError } from "../../lib/api/client";
import { useAppDispatch } from "../../redux/hooks";
import { enqueueToast, setStatus } from "../../redux/slices/appSlice";

function extractValidationMessage(details: unknown): string | null {
  if (!details || typeof details !== "object" || !("fieldErrors" in details)) {
    return null;
  }

  const fieldErrors = (details as { fieldErrors?: Record<string, string[] | undefined> }).fieldErrors;
  if (!fieldErrors) {
    return null;
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      return `${field}: ${messages[0]}`;
    }
  }

  return null;
}

function resolveErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiClientError) {
    const validationMessage = extractValidationMessage(error.details);
    return validationMessage ? `${error.message}. ${validationMessage}` : error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return error instanceof Error ? error.message : fallbackMessage;
}

export function useApiFeedback() {
  const dispatch = useAppDispatch();

  function notifySuccess(message: string) {
    dispatch(setStatus(message));
    dispatch(enqueueToast(message, "success"));
  }

  function notifyError(error: unknown, fallbackMessage = "Request failed") {
    const message = resolveErrorMessage(error, fallbackMessage);
    dispatch(setStatus(message));
    dispatch(enqueueToast(message, "error"));
  }

  async function runWithFeedback(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      notifySuccess(successMessage);
      return true;
    } catch (error) {
      notifyError(error);
      return false;
    }
  }

  return { notifySuccess, notifyError, runWithFeedback };
}

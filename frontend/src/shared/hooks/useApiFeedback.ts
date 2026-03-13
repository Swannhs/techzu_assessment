import { useAppDispatch } from "../../redux/hooks";
import { enqueueToast, setStatus } from "../../redux/slices/appSlice";

export function useApiFeedback() {
  const dispatch = useAppDispatch();

  function notifySuccess(message: string) {
    dispatch(setStatus(message));
    dispatch(enqueueToast(message, "success"));
  }

  function notifyError(error: unknown, fallbackMessage = "Request failed") {
    const message = error instanceof Error ? error.message : fallbackMessage;
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

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { dismissToast } from "../../redux/slices/appSlice";

const TOAST_TIMEOUT_MS = 3500;

export function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.app.toasts);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(dismissToast(toast.id));
      }, TOAST_TIMEOUT_MS)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [dispatch, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type === "success" ? "toast-success" : ""} ${toast.type === "error" ? "toast-error" : ""}`}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
          <button
            type="button"
            className="ml-3 text-sm font-bold text-current/70 hover:text-current"
            onClick={() => dispatch(dismissToast(toast.id))}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

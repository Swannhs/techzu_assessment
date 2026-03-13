import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Tab = "hq" | "outlet";
export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface AppState {
  activeTab: Tab;
  status: string;
  selectedOutletId: number | null;
  toasts: ToastMessage[];
}

const initialState: AppState = {
  activeTab: "hq",
  status: "Loading data...",
  selectedOutletId: null,
  toasts: []
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<Tab>) {
      state.activeTab = action.payload;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    setSelectedOutletId(state, action: PayloadAction<number | null>) {
      state.selectedOutletId = action.payload;
    },
    enqueueToast: {
      reducer(state, action: PayloadAction<ToastMessage>) {
        state.toasts.push(action.payload);
      },
      prepare(message: string, type: ToastType = "info") {
        return {
          payload: {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            message,
            type
          }
        };
      }
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    }
  }
});

export const { setActiveTab, setStatus, setSelectedOutletId, enqueueToast, dismissToast } =
  appSlice.actions;
export const appReducer = appSlice.reducer;

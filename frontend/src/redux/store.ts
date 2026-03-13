import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slices/appSlice";
import { hqReducer } from "./slices/hqSlice";
import { outletReducer } from "./slices/outletSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    hq: hqReducer,
    outlet: outletReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

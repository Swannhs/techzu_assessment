import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./slices/appSlice";
import { hqReducer } from "./slices/hqSlice";
import { outletReducer } from "./slices/outletSlice";

const rootReducer = combineReducers({
  app: appReducer,
  hq: hqReducer,
  outlet: outletReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  });
}

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../lib/api/client";
import {
  MenuItem,
  Outlet,
  RevenueByOutletRow,
  TopItemByOutletRow
} from "../../lib/api/types";
import { setSelectedOutletId } from "./appSlice";
import type { AppDispatch, RootState } from "../store";

interface HqState {
  outlets: Outlet[];
  menuItems: MenuItem[];
  revenueByOutlet: RevenueByOutletRow[];
  topItems: TopItemByOutletRow[];
  isLoading: boolean;
  currentActionKey: string | null;
}

const initialState: HqState = {
  outlets: [],
  menuItems: [],
  revenueByOutlet: [],
  topItems: [],
  isLoading: false,
  currentActionKey: null
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed";
}

export const fetchHqData = createAsyncThunk<
  {
    outlets: Outlet[];
    menuItems: MenuItem[];
    revenueByOutlet: RevenueByOutletRow[];
    topItems: TopItemByOutletRow[];
  },
  void,
  { state: RootState; rejectValue: string }
>("hq/fetchHqData", async (_, thunkApi) => {
  try {
    const [outlets, menuItems, revenueByOutlet, topItems] = await Promise.all([
      apiClient<Outlet[]>("/hq/outlets"),
      apiClient<MenuItem[]>("/hq/menu-items"),
      apiClient<RevenueByOutletRow[]>("/hq/reports/revenue-by-outlet"),
      apiClient<TopItemByOutletRow[]>("/hq/reports/top-items-by-outlet")
    ]);

    const selectedOutletId = thunkApi.getState().app.selectedOutletId;
    if (!selectedOutletId && outlets[0]?.id) {
      thunkApi.dispatch(setSelectedOutletId(outlets[0].id));
    }

    return { outlets, menuItems, revenueByOutlet, topItems };
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const createOutletThunk = createAsyncThunk<
  void,
  { code: string; name: string; location: string },
  { rejectValue: string }
>("hq/createOutlet", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient("/hq/outlets", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    await dispatch(fetchHqData()).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const createMenuItemThunk = createAsyncThunk<
  void,
  {
    sku: string;
    name: string;
    description: string;
    basePrice: number;
    stockDeductionUnits: number;
  },
  { rejectValue: string }
>("hq/createMenuItem", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient("/hq/menu-items", {
      method: "POST",
      body: JSON.stringify({ ...payload, isActive: true })
    });
    await dispatch(fetchHqData()).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const assignMenuToOutletThunk = createAsyncThunk<
  void,
  { outletId: number; menuItemId: number; priceOverride: number | null },
  { rejectValue: string }
>("hq/assignMenuToOutlet", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient(`/hq/outlets/${payload.outletId}/menu-items`, {
      method: "POST",
      body: JSON.stringify({
        menuItemId: payload.menuItemId,
        priceOverride: payload.priceOverride,
        isActive: true
      })
    });
    await dispatch(fetchHqData()).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const toggleMenuItemThunk = createAsyncThunk<
  void,
  { menuItemId: number; isActive: boolean; actionKey: string },
  { rejectValue: string }
>("hq/toggleMenuItem", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient(`/hq/menu-items/${payload.menuItemId}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: payload.isActive })
    });
    await dispatch(fetchHqData()).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const updateMenuItemPriceThunk = createAsyncThunk<
  void,
  { menuItemId: number; basePrice: number; actionKey: string },
  { rejectValue: string }
>("hq/updateMenuItemPrice", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient(`/hq/menu-items/${payload.menuItemId}`, {
      method: "PUT",
      body: JSON.stringify({ basePrice: payload.basePrice })
    });
    await dispatch(fetchHqData()).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

const hqSlice = createSlice({
  name: "hq",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchHqData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchHqData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.outlets = action.payload.outlets;
      state.menuItems = action.payload.menuItems;
      state.revenueByOutlet = action.payload.revenueByOutlet;
      state.topItems = action.payload.topItems;
    });
    builder.addCase(fetchHqData.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(createOutletThunk.pending, (state) => {
      state.currentActionKey = "create-outlet";
    });
    builder.addCase(createOutletThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(createOutletThunk.rejected, (state) => {
      state.currentActionKey = null;
    });

    builder.addCase(createMenuItemThunk.pending, (state) => {
      state.currentActionKey = "create-menu-item";
    });
    builder.addCase(createMenuItemThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(createMenuItemThunk.rejected, (state) => {
      state.currentActionKey = null;
    });

    builder.addCase(assignMenuToOutletThunk.pending, (state) => {
      state.currentActionKey = "assign-menu-item";
    });
    builder.addCase(assignMenuToOutletThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(assignMenuToOutletThunk.rejected, (state) => {
      state.currentActionKey = null;
    });

    builder.addCase(toggleMenuItemThunk.pending, (state, action) => {
      state.currentActionKey = action.meta.arg.actionKey;
    });
    builder.addCase(toggleMenuItemThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(toggleMenuItemThunk.rejected, (state) => {
      state.currentActionKey = null;
    });

    builder.addCase(updateMenuItemPriceThunk.pending, (state, action) => {
      state.currentActionKey = action.meta.arg.actionKey;
    });
    builder.addCase(updateMenuItemPriceThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(updateMenuItemPriceThunk.rejected, (state) => {
      state.currentActionKey = null;
    });
  }
});

export const hqReducer = hqSlice.reducer;

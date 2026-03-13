import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../lib/api/client";
import { InventoryItem, OutletMenuItem } from "../../lib/api/types";
import type { AppDispatch } from "../store";

interface OutletState {
  menu: OutletMenuItem[];
  inventory: InventoryItem[];
  lastReceipt: string;
  isLoading: boolean;
  currentActionKey: string | null;
}

const initialState: OutletState = {
  menu: [],
  inventory: [],
  lastReceipt: "",
  isLoading: false,
  currentActionKey: null
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed";
}

export const loadOutletDataThunk = createAsyncThunk<
  { menu: OutletMenuItem[]; inventory: InventoryItem[] },
  number,
  { rejectValue: string }
>("outlet/loadData", async (outletId, thunkApi) => {
  try {
    const [menu, inventory] = await Promise.all([
      apiClient<OutletMenuItem[]>(`/outlets/${outletId}/menu`),
      apiClient<InventoryItem[]>(`/outlets/${outletId}/inventory`)
    ]);
    return { menu, inventory };
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const adjustInventoryThunk = createAsyncThunk<
  void,
  { outletId: number; menuItemId: number; quantityDelta: number; reason?: string },
  { rejectValue: string }
>("outlet/adjustInventory", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    await apiClient(`/outlets/${payload.outletId}/inventory/adjust`, {
      method: "POST",
      body: JSON.stringify({
        menuItemId: payload.menuItemId,
        quantityDelta: payload.quantityDelta,
        reason: payload.reason
      })
    });
    await dispatch(loadOutletDataThunk(payload.outletId)).unwrap();
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

export const createSaleThunk = createAsyncThunk<
  string,
  {
    outletId: number;
    items: Array<{ menuItemId: number; quantity: number }>;
  },
  { rejectValue: string }
>("outlet/createSale", async (payload, thunkApi) => {
  try {
    const dispatch = thunkApi.dispatch as AppDispatch;
    const result = await apiClient<{ receiptNumber: string }>(`/outlets/${payload.outletId}/sales`, {
      method: "POST",
      body: JSON.stringify({ items: payload.items })
    });
    await dispatch(loadOutletDataThunk(payload.outletId)).unwrap();
    return result.receiptNumber;
  } catch (error) {
    return thunkApi.rejectWithValue(toErrorMessage(error));
  }
});

const outletSlice = createSlice({
  name: "outlet",
  initialState,
  reducers: {
    clearOutletData(state) {
      state.menu = [];
      state.inventory = [];
      state.lastReceipt = "";
      state.isLoading = false;
      state.currentActionKey = null;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loadOutletDataThunk.pending, (state) => {
      state.isLoading = true;
      state.lastReceipt = "";
    });
    builder.addCase(loadOutletDataThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.menu = action.payload.menu;
      state.inventory = action.payload.inventory;
    });
    builder.addCase(loadOutletDataThunk.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(adjustInventoryThunk.pending, (state) => {
      state.currentActionKey = "adjust-inventory";
    });
    builder.addCase(adjustInventoryThunk.fulfilled, (state) => {
      state.currentActionKey = null;
    });
    builder.addCase(adjustInventoryThunk.rejected, (state) => {
      state.currentActionKey = null;
    });

    builder.addCase(createSaleThunk.pending, (state) => {
      state.currentActionKey = "create-sale";
    });
    builder.addCase(createSaleThunk.fulfilled, (state, action) => {
      state.currentActionKey = null;
      state.lastReceipt = action.payload;
    });
    builder.addCase(createSaleThunk.rejected, (state) => {
      state.currentActionKey = null;
    });
  }
});

export const { clearOutletData } = outletSlice.actions;
export const outletReducer = outletSlice.reducer;

export interface Outlet {
  id: number;
  code: string;
  name: string;
  location: string;
}

export interface MenuItem {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  basePrice: string;
  stockDeductionUnits: number;
  isActive: boolean;
}

export interface RevenueByOutletRow {
  outletId: number;
  outletCode: string;
  outletName: string;
  totalRevenue: string;
}

export interface TopItemByOutletRow {
  outletId: number;
  outletCode: string;
  outletName: string;
  menuItemId: number;
  itemName: string;
  totalQuantity: number;
  totalRevenue: string;
}

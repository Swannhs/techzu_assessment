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

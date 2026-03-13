import type {
  Inventory,
  MenuItem,
  Sale,
  SaleItem
} from "@prisma/client";
import type { OutletIdParams } from "../validators/commonValidators.js";
import type {
  CreateSaleInput,
  InventoryAdjustmentInput
} from "../validators/outletValidators.js";
import { toIsoDate, toStringValue } from "./serialization.js";

export type OutletIdRequestDto = OutletIdParams;
export type InventoryAdjustmentRequestDto = InventoryAdjustmentInput;
export type CreateSaleRequestDto = CreateSaleInput;

interface AssignedOutletMenuItemInput {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: { toString(): string } | string;
  stockDeductionUnits: number;
}

export interface AssignedOutletMenuItemResponseDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  stockDeductionUnits: number;
}

export interface InventoryItemResponseDto {
  id: number;
  menuItemId: number;
  stockQuantity: number;
  updatedAt: string;
  menuItem: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface InventoryAdjustmentResponseDto {
  id: number;
  outletId: number;
  menuItemId: number;
  stockQuantity: number;
  updatedAt: string;
}

export interface SaleItemResponseDto {
  id: string;
  saleId: string;
  menuItemId: number;
  itemNameSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
}

export interface SaleResponseDto {
  id: string;
  outletId: number;
  receiptNumber: string;
  subtotalAmount: string;
  totalAmount: string;
  createdAt: string;
  saleItems: SaleItemResponseDto[];
}

export function toAssignedOutletMenuItemResponseDto(
  item: AssignedOutletMenuItemInput
): AssignedOutletMenuItemResponseDto {
  return {
    ...item,
    price: toStringValue(item.price) ?? "0"
  };
}

export function toInventoryAdjustmentResponseDto(
  inventory: Inventory
): InventoryAdjustmentResponseDto {
  return {
    id: inventory.id,
    outletId: inventory.outletId,
    menuItemId: inventory.menuItemId,
    stockQuantity: inventory.stockQuantity,
    updatedAt: toIsoDate(inventory.updatedAt)
  };
}

export function toInventoryItemResponseDto(
  inventory: Inventory & { menuItem: MenuItem }
): InventoryItemResponseDto {
  return {
    id: inventory.id,
    menuItemId: inventory.menuItemId,
    stockQuantity: inventory.stockQuantity,
    updatedAt: toIsoDate(inventory.updatedAt),
    menuItem: {
      id: inventory.menuItem.id,
      name: inventory.menuItem.name,
      sku: inventory.menuItem.sku
    }
  };
}

export function toSaleResponseDto(
  sale: Sale & { saleItems: SaleItem[] }
): SaleResponseDto {
  return {
    id: toStringValue(sale.id) ?? "",
    outletId: sale.outletId,
    receiptNumber: sale.receiptNumber,
    subtotalAmount: toStringValue(sale.subtotalAmount) ?? "0",
    totalAmount: toStringValue(sale.totalAmount) ?? "0",
    createdAt: toIsoDate(sale.createdAt),
    saleItems: sale.saleItems.map((item) => ({
      id: toStringValue(item.id) ?? "",
      saleId: toStringValue(item.saleId) ?? "",
      menuItemId: item.menuItemId,
      itemNameSnapshot: item.itemNameSnapshot,
      unitPriceSnapshot: toStringValue(item.unitPriceSnapshot) ?? "0",
      quantity: item.quantity,
      lineTotal: toStringValue(item.lineTotal) ?? "0"
    }))
  };
}

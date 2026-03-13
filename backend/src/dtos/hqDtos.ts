import type { MenuItem, Outlet, OutletMenuItem } from "@prisma/client";
import type {
  AssignMenuItemInput,
  CreateMenuItemInput,
  CreateOutletInput,
  TopItemsReportQuery,
  UpdateMenuItemInput,
  UpdateOutletAssignmentInput
} from "../validators/hqValidators.js";
import { toIsoDate, toStringValue } from "./serialization.js";

export type CreateOutletRequestDto = CreateOutletInput;
export type CreateMenuItemRequestDto = CreateMenuItemInput;
export type UpdateMenuItemRequestDto = UpdateMenuItemInput;
export type AssignMenuItemRequestDto = AssignMenuItemInput;
export type UpdateOutletAssignmentRequestDto = UpdateOutletAssignmentInput;
export type TopItemsByOutletQueryDto = TopItemsReportQuery;

export interface OutletResponseDto {
  id: number;
  code: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponseDto {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  basePrice: string;
  stockDeductionUnits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutletMenuAssignmentResponseDto {
  id: number;
  outletId: number;
  menuItemId: number;
  priceOverride: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueByOutletResponseDto {
  outletId: number;
  outletCode: string;
  outletName: string;
  totalRevenue: string;
}

export interface TopItemsByOutletResponseDto {
  outletId: number;
  outletCode: string;
  outletName: string;
  menuItemId: number;
  itemName: string;
  totalQuantity: number;
  totalRevenue: string;
  rankWithinOutlet?: number;
}

export function toOutletResponseDto(outlet: Outlet): OutletResponseDto {
  return {
    id: outlet.id,
    code: outlet.code,
    name: outlet.name,
    location: outlet.location,
    createdAt: toIsoDate(outlet.createdAt),
    updatedAt: toIsoDate(outlet.updatedAt)
  };
}

export function toMenuItemResponseDto(menuItem: MenuItem): MenuItemResponseDto {
  return {
    id: menuItem.id,
    sku: menuItem.sku,
    name: menuItem.name,
    description: menuItem.description ?? null,
    basePrice: toStringValue(menuItem.basePrice) ?? "0",
    stockDeductionUnits: menuItem.stockDeductionUnits,
    isActive: menuItem.isActive,
    createdAt: toIsoDate(menuItem.createdAt),
    updatedAt: toIsoDate(menuItem.updatedAt)
  };
}

export function toOutletMenuAssignmentResponseDto(
  assignment: OutletMenuItem
): OutletMenuAssignmentResponseDto {
  return {
    id: assignment.id,
    outletId: assignment.outletId,
    menuItemId: assignment.menuItemId,
    priceOverride: toStringValue(assignment.priceOverride),
    isActive: assignment.isActive,
    createdAt: toIsoDate(assignment.createdAt),
    updatedAt: toIsoDate(assignment.updatedAt)
  };
}

export function toRevenueByOutletResponseDto(
  row: RevenueByOutletResponseDto
): RevenueByOutletResponseDto {
  return row;
}

export function toTopItemsByOutletResponseDto(
  row: TopItemsByOutletResponseDto
): TopItemsByOutletResponseDto {
  return row;
}

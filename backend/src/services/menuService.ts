import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { MenuRepository } from "../repositories/menuRepository.js";
import { OutletRepository } from "../repositories/outletRepository.js";
import { ApiError } from "../utils/apiError.js";

export class MenuService {
  private readonly menuRepository = new MenuRepository(prisma);
  private readonly outletRepository = new OutletRepository(prisma);

  async createMenuItem(payload: {
    sku: string;
    name: string;
    description?: string | null;
    basePrice: number;
    stockDeductionUnits: number;
    isActive: boolean;
  }) {
    try {
      return await this.menuRepository.create({
        sku: payload.sku,
        name: payload.name,
        description: payload.description ?? null,
        basePrice: new Prisma.Decimal(payload.basePrice),
        stockDeductionUnits: payload.stockDeductionUnits,
        isActive: payload.isActive
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          statusCode: 409,
          code: "MENU_SKU_EXISTS",
          message: "Menu SKU already exists"
        });
      }
      throw error;
    }
  }

  listMenuItems() {
    return this.menuRepository.list();
  }

  async getMenuItem(menuItemId: number) {
    const item = await this.menuRepository.findById(menuItemId);
    if (!item) {
      throw new ApiError({
        statusCode: 404,
        code: "MENU_ITEM_NOT_FOUND",
        message: "Menu item not found"
      });
    }
    return item;
  }

  async updateMenuItem(
    menuItemId: number,
    payload: Partial<{
      name: string;
      description: string | null;
      basePrice: number;
      stockDeductionUnits: number;
      isActive: boolean;
    }>
  ) {
    await this.getMenuItem(menuItemId);
    return this.menuRepository.update(menuItemId, {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.basePrice !== undefined
        ? { basePrice: new Prisma.Decimal(payload.basePrice) }
        : {}),
      ...(payload.stockDeductionUnits !== undefined
        ? { stockDeductionUnits: payload.stockDeductionUnits }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {})
    });
  }

  async assignMenuItem(
    outletId: number,
    payload: {
      menuItemId: number;
      priceOverride?: number | null;
      isActive: boolean;
    }
  ) {
    const [outlet, menuItem] = await Promise.all([
      this.outletRepository.findById(outletId),
      this.menuRepository.findById(payload.menuItemId)
    ]);

    if (!outlet) {
      throw new ApiError({
        statusCode: 404,
        code: "OUTLET_NOT_FOUND",
        message: "Outlet not found"
      });
    }

    if (!menuItem) {
      throw new ApiError({
        statusCode: 404,
        code: "MENU_ITEM_NOT_FOUND",
        message: "Menu item not found"
      });
    }

    try {
      return await this.menuRepository.createOutletAssignment({
        outletId,
        menuItemId: payload.menuItemId,
        priceOverride:
          payload.priceOverride === undefined || payload.priceOverride === null
            ? null
            : new Prisma.Decimal(payload.priceOverride),
        isActive: payload.isActive
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          statusCode: 409,
          code: "OUTLET_MENU_ITEM_EXISTS",
          message: "Menu item already assigned to outlet"
        });
      }
      throw error;
    }
  }

  async updateOutletAssignment(
    outletId: number,
    menuItemId: number,
    payload: {
      priceOverride?: number | null;
      isActive?: boolean;
    }
  ) {
    const assignment = await this.menuRepository.findOutletAssignment(outletId, menuItemId);
    if (!assignment) {
      throw new ApiError({
        statusCode: 404,
        code: "OUTLET_MENU_ITEM_NOT_FOUND",
        message: "Outlet menu item assignment not found"
      });
    }

    return this.menuRepository.updateOutletAssignment(outletId, menuItemId, {
      ...(payload.priceOverride !== undefined
        ? {
            priceOverride:
              payload.priceOverride === null ? null : new Prisma.Decimal(payload.priceOverride)
          }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {})
    });
  }
}

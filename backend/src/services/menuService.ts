import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { MenuRepository } from "../repositories/menuRepository.js";
import { ApiError } from "../utils/apiError.js";

export class MenuService {
  private readonly menuRepository = new MenuRepository(prisma);

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
}

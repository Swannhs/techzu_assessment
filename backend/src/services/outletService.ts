import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { InventoryRepository } from "../repositories/inventoryRepository.js";
import { MenuRepository } from "../repositories/menuRepository.js";
import { OutletRepository } from "../repositories/outletRepository.js";
import { ApiError } from "../utils/apiError.js";

export class OutletService {
  private readonly outletRepository = new OutletRepository(prisma);
  private readonly inventoryRepository = new InventoryRepository(prisma);
  private readonly menuRepository = new MenuRepository(prisma);

  async createOutlet(payload: { code: string; name: string; location: string }) {
    try {
      return await this.outletRepository.create(payload);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          statusCode: 409,
          code: "OUTLET_CODE_EXISTS",
          message: "Outlet code already exists"
        });
      }
      throw error;
    }
  }

  listOutlets() {
    return this.outletRepository.list();
  }

  async listInventory(outletId: number) {
    const outlet = await this.outletRepository.findById(outletId);
    if (!outlet) {
      throw new ApiError({
        statusCode: 404,
        code: "OUTLET_NOT_FOUND",
        message: "Outlet not found"
      });
    }
    return this.inventoryRepository.listByOutlet(outletId);
  }

  async adjustInventory(
    outletId: number,
    payload: {
      menuItemId: number;
      quantityDelta: number;
      reason?: string;
    }
  ) {
    const [outlet, menuItem, inventory] = await Promise.all([
      this.outletRepository.findById(outletId),
      this.menuRepository.findById(payload.menuItemId),
      this.inventoryRepository.findByOutletAndMenuItem(outletId, payload.menuItemId)
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

    const nextStock = (inventory?.stockQuantity ?? 0) + payload.quantityDelta;
    if (nextStock < 0) {
      throw new ApiError({
        statusCode: 409,
        code: "NEGATIVE_STOCK",
        message: "Inventory adjustment would make stock negative"
      });
    }

    return this.inventoryRepository.upsert(outletId, payload.menuItemId, nextStock);
  }
}

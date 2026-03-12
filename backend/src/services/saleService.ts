import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { MenuRepository } from "../repositories/menuRepository.js";
import { OutletRepository } from "../repositories/outletRepository.js";
import { SaleRepository } from "../repositories/saleRepository.js";
import { ApiError } from "../utils/apiError.js";

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export class SaleService {
  private readonly outletRepository = new OutletRepository(prisma);

  async createSale(
    outletId: number,
    payload: {
      items: Array<{ menuItemId: number; quantity: number }>;
    }
  ) {
    const outlet = await this.outletRepository.findById(outletId);
    if (!outlet) {
      throw new ApiError({
        statusCode: 404,
        code: "OUTLET_NOT_FOUND",
        message: "Outlet not found"
      });
    }

    const groupedItems = payload.items.reduce<Map<number, number>>((acc, item) => {
      acc.set(item.menuItemId, (acc.get(item.menuItemId) ?? 0) + item.quantity);
      return acc;
    }, new Map());

    const sale = await prisma.$transaction(async (tx) => {
      const menuRepository = new MenuRepository(tx);
      const saleRepository = new SaleRepository(tx);

      const resolvedItems: Array<{
        menuItemId: number;
        quantity: number;
        itemNameSnapshot: string;
        unitPrice: number;
        lineTotal: number;
        deductionUnits: number;
      }> = [];

      for (const [menuItemId, quantity] of groupedItems.entries()) {
        const assignment = await menuRepository.findOutletAssignment(outletId, menuItemId);
        if (!assignment || !assignment.isActive || !assignment.menuItem.isActive) {
          throw new ApiError({
            statusCode: 400,
            code: "MENU_NOT_ASSIGNED",
            message: `Menu item ${menuItemId} is not assigned to outlet ${outletId}`
          });
        }
        const effectivePrice = Number(
          assignment.priceOverride ?? assignment.menuItem.basePrice
        );
        const deductionUnits = assignment.menuItem.stockDeductionUnits * quantity;

        resolvedItems.push({
          menuItemId,
          quantity,
          itemNameSnapshot: assignment.menuItem.name,
          unitPrice: effectivePrice,
          lineTotal: roundMoney(effectivePrice * quantity),
          deductionUnits
        });
      }

      for (const item of resolvedItems) {
        const updated = await saleRepository.guardedDeductInventory(
          outletId,
          item.menuItemId,
          item.deductionUnits
        );
        if (updated !== 1) {
          throw new ApiError({
            statusCode: 409,
            code: "INSUFFICIENT_STOCK",
            message: `Insufficient stock for menu item ${item.menuItemId}`
          });
        }
      }

      const subtotal = roundMoney(resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0));
      const receiptNumber = await saleRepository.nextReceiptNumber(outletId, outlet.code);

      const saleHeader = await saleRepository.createSale({
        outletId,
        receiptNumber,
        subtotalAmount: new Prisma.Decimal(subtotal),
        totalAmount: new Prisma.Decimal(subtotal)
      });

      await saleRepository.createSaleItems(
        resolvedItems.map((item) => ({
          saleId: saleHeader.id,
          menuItemId: item.menuItemId,
          itemNameSnapshot: item.itemNameSnapshot,
          unitPriceSnapshot: new Prisma.Decimal(item.unitPrice),
          quantity: item.quantity,
          lineTotal: new Prisma.Decimal(item.lineTotal)
        }))
      );

      return tx.sale.findUnique({
        where: { id: saleHeader.id },
        include: { saleItems: true }
      });
    });

    if (!sale) {
      throw new ApiError({
        statusCode: 500,
        code: "SALE_CREATE_FAILED",
        message: "Failed to create sale"
      });
    }

    return {
      ...sale,
      id: sale.id.toString(),
      saleItems: sale.saleItems.map((item) => ({
        ...item,
        id: item.id.toString(),
        saleId: item.saleId.toString()
      }))
    };
  }
}

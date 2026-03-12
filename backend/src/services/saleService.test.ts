import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { SaleService } from "./saleService.js";

const saleService = new SaleService();
let outletId = 0;
let menuItemId = 0;

describe("SaleService", () => {
  beforeEach(async () => {
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.outletMenuItem.deleteMany();
    await prisma.receiptSequence.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.outlet.deleteMany();

    const outlet = await prisma.outlet.create({
      data: {
        code: "OUTLET01",
        name: "Test Outlet",
        location: "Test City"
      }
    });

    const burger = await prisma.menuItem.create({
      data: {
        sku: "BRG-001",
        name: "Classic Burger",
        basePrice: "12.50",
        stockDeductionUnits: 1,
        isActive: true
      }
    });

    await prisma.outletMenuItem.create({
      data: {
        outletId: outlet.id,
        menuItemId: burger.id,
        priceOverride: "13.00",
        isActive: true
      }
    });

    await prisma.inventory.create({
      data: {
        outletId: outlet.id,
        menuItemId: burger.id,
        stockQuantity: 5
      }
    });

    outletId = outlet.id;
    menuItemId = burger.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a sale and deducts stock", async () => {
    const sale = await saleService.createSale(outletId, {
      items: [{ menuItemId, quantity: 2 }]
    });

    expect(sale.receiptNumber).toBe("OUTLET01-000001");
    expect(sale.saleItems).toHaveLength(1);

    const inventory = await prisma.inventory.findUnique({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      }
    });

    expect(inventory?.stockQuantity).toBe(3);
  });

  it("fails on insufficient stock and does not mutate inventory", async () => {
    await expect(
      saleService.createSale(outletId, {
        items: [{ menuItemId, quantity: 8 }]
      })
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK"
    });

    const inventory = await prisma.inventory.findUnique({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      }
    });

    expect(inventory?.stockQuantity).toBe(5);
  });
});

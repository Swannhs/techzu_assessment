import { jest } from "@jest/globals";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/config/prisma.js";
import { MenuRepository } from "../src/repositories/menuRepository.js";
import { OutletRepository } from "../src/repositories/outletRepository.js";
import { SaleRepository } from "../src/repositories/saleRepository.js";
import { SaleService } from "../src/services/saleService.js";

type SaleItemRecord = {
  saleId: bigint;
  menuItemId: number;
  itemNameSnapshot: string;
  unitPriceSnapshot: Prisma.Decimal;
  quantity: number;
  lineTotal: Prisma.Decimal;
};

describe("SaleService", () => {
  const saleService = new SaleService();

  let inventoryQuantity: number;
  let lastReceiptNumber: number;
  let storedSale:
    | {
        id: bigint;
        outletId: number;
        receiptNumber: string;
        subtotalAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        saleItems: SaleItemRecord[];
      }
    | null;

  beforeEach(() => {
    inventoryQuantity = 5;
    lastReceiptNumber = 0;
    storedSale = null;

    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue({
      id: 1,
      code: "OUTLET01",
      name: "Test Outlet",
      location: "Test City",
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    jest.spyOn(MenuRepository.prototype, "findOutletAssignment").mockResolvedValue({
      id: 10,
      outletId: 1,
      menuItemId: 7,
      priceOverride: new Prisma.Decimal("13.00"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      menuItem: {
        id: 7,
        sku: "BRG-001",
        name: "Classic Burger",
        description: "Beef burger",
        basePrice: new Prisma.Decimal("12.50"),
        stockDeductionUnits: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } as any);

    jest.spyOn(SaleRepository.prototype, "guardedDeductInventory").mockImplementation(
      async (_outletId, _menuItemId, deductionUnits) => {
        if (inventoryQuantity < deductionUnits) {
          return 0;
        }

        inventoryQuantity -= deductionUnits;
        return 1;
      }
    );

    jest.spyOn(SaleRepository.prototype, "lockReceiptSequence").mockImplementation(async () => ({
      outletId: 1,
      lastNumber: lastReceiptNumber
    }));

    (jest.spyOn(SaleRepository.prototype as any, "updateReceiptSequence") as any).mockImplementation(
      async (_outletId: number, nextReceiptNumber: number) => {
        lastReceiptNumber = nextReceiptNumber;
        return {
          outletId: 1,
          lastNumber: nextReceiptNumber,
          updatedAt: new Date()
        } as any;
      }
    );

    (jest.spyOn(SaleRepository.prototype as any, "createSaleItems") as any).mockImplementation(
      async (data: SaleItemRecord[]) => {
        if (!storedSale) {
          throw new Error("Sale must be created before sale items");
        }

        storedSale.saleItems = data;
        return { count: data.length } as any;
      }
    );

    jest.spyOn(prisma, "$transaction").mockImplementation(async (callback) => {
      const tx = {
        sale: {
          findUnique: jest.fn(async () => storedSale)
        }
      } as never;

      const result = await callback(tx);
      return result;
    });

    const createSaleSpy = jest.spyOn(SaleRepository.prototype as any, "createSale") as any;
    createSaleSpy.mockImplementation(async (data: {
      outletId: number;
      receiptNumber: string;
      subtotalAmount: Prisma.Decimal;
      totalAmount: Prisma.Decimal;
    }) => {
      storedSale = {
        id: 101n,
        outletId: data.outletId,
        receiptNumber: data.receiptNumber,
        subtotalAmount: data.subtotalAmount,
        totalAmount: data.totalAmount,
        saleItems: []
      };

      return {
        id: 101n,
        ...data,
        createdAt: new Date()
      } as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a sale and deducts stock", async () => {
    const sale = await saleService.createSale(1, {
      items: [{ menuItemId: 7, quantity: 2 }]
    });

    expect(sale.receiptNumber).toBe("OUTLET01-000001");
    expect(sale.saleItems).toHaveLength(1);
    expect(sale.saleItems[0]?.quantity).toBe(2);
    expect(sale.saleItems[0]?.unitPriceSnapshot.toString()).toBe("13");
    expect(inventoryQuantity).toBe(3);
  });

  it("fails on insufficient stock and does not mutate inventory", async () => {
    await expect(
      saleService.createSale(1, {
        items: [{ menuItemId: 7, quantity: 8 }]
      })
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK"
    });

    expect(inventoryQuantity).toBe(5);
    expect(lastReceiptNumber).toBe(0);
  });

  it("increments receipt numbers for consecutive sales", async () => {
    const firstSale = await saleService.createSale(1, {
      items: [{ menuItemId: 7, quantity: 1 }]
    });

    const secondSale = await saleService.createSale(1, {
      items: [{ menuItemId: 7, quantity: 1 }]
    });

    expect(firstSale.receiptNumber).toBe("OUTLET01-000001");
    expect(secondSale.receiptNumber).toBe("OUTLET01-000002");
    expect(lastReceiptNumber).toBe(2);
    expect(inventoryQuantity).toBe(3);
  });

  it("aggregates repeated sale lines for the same menu item", async () => {
    const sale = await saleService.createSale(1, {
      items: [
        { menuItemId: 7, quantity: 1 },
        { menuItemId: 7, quantity: 2 }
      ]
    });

    expect(sale.saleItems).toHaveLength(1);
    expect(sale.saleItems[0]?.quantity).toBe(3);
    expect(sale.saleItems[0]?.lineTotal.toString()).toBe("39");
    expect(inventoryQuantity).toBe(2);
  });
});

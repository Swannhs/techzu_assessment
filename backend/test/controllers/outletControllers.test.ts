import { jest } from "@jest/globals";
import {
  adjustOutletInventory,
  getOutletInventory
} from "../../src/controllers/outletInventoryController.js";
import { getAssignedOutletMenu } from "../../src/controllers/outletMenuController.js";
import { createOutletSale } from "../../src/controllers/outletSaleController.js";
import { MenuService } from "../../src/services/menuService.js";
import { OutletService } from "../../src/services/outletService.js";
import { SaleService } from "../../src/services/saleService.js";
import { createMockResponse } from "../helpers/http.js";

describe("Outlet controllers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns assigned outlet menu", async () => {
    jest.spyOn(MenuService.prototype, "listOutletAssignedMenu").mockResolvedValue([
      {
        id: 7,
        sku: "BRG-001",
        name: "Burger",
        description: null,
        price: { toString: () => "13" },
        stockDeductionUnits: 1
      }
    ] as any);
    const response = createMockResponse();
    response.locals.validated = { params: { outletId: 1 }, body: {}, query: {} };

    await getAssignedOutletMenu({} as any, response);

    expect(response.json).toHaveBeenCalled();
  });

  it("returns outlet inventory and adjusted inventory", async () => {
    jest.spyOn(OutletService.prototype, "listInventory").mockResolvedValue([
      {
        id: 1,
        stockQuantity: 5,
        updatedAt: new Date("2026-03-13T00:00:00.000Z"),
        outletId: 1,
        menuItem: { id: 7, name: "Burger", sku: "BRG-001" }
      }
    ] as any);
    jest.spyOn(OutletService.prototype, "adjustInventory").mockResolvedValue({
      id: 1,
      outletId: 1,
      menuItemId: 7,
      stockQuantity: 8,
      updatedAt: new Date("2026-03-13T00:00:00.000Z")
    } as any);

    const inventoryResponse = createMockResponse();
    inventoryResponse.locals.validated = { params: { outletId: 1 }, body: {}, query: {} };
    await getOutletInventory({} as any, inventoryResponse);
    expect(inventoryResponse.json).toHaveBeenCalled();

    const adjustResponse = createMockResponse();
    adjustResponse.locals.validated = {
      params: { outletId: 1 },
      body: { menuItemId: 7, quantityDelta: 3 },
      query: {}
    };
    await adjustOutletInventory({} as any, adjustResponse);
    expect(adjustResponse.json).toHaveBeenCalled();
  });

  it("creates outlet sale and returns 201", async () => {
    jest.spyOn(SaleService.prototype, "createSale").mockResolvedValue({
      id: 101n,
      outletId: 1,
      receiptNumber: "OUTLET01-000001",
      subtotalAmount: { toString: () => "26" },
      totalAmount: { toString: () => "26" },
      createdAt: new Date(),
      saleItems: [
        {
          id: 1n,
          saleId: 101n,
          menuItemId: 7,
          itemNameSnapshot: "Burger",
          unitPriceSnapshot: { toString: () => "13" },
          quantity: 2,
          lineTotal: { toString: () => "26" }
        }
      ]
    } as any);
    const response = createMockResponse();
    response.locals.validated = {
      params: { outletId: 1 },
      body: { items: [{ menuItemId: 7, quantity: 2 }] },
      query: {}
    };

    await createOutletSale({} as any, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalled();
  });
});

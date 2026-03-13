import { jest } from "@jest/globals";
import {
  assignMenuItemToOutlet,
  updateAssignedMenuItem
} from "../../src/controllers/hqAssignmentController.js";
import {
  createMenuItem,
  getMenuItem,
  listMenuItems,
  updateMenuItem
} from "../../src/controllers/hqMenuController.js";
import { createOutlet, listOutlets } from "../../src/controllers/hqOutletController.js";
import {
  getRevenueByOutlet,
  getTopItemsByOutlet
} from "../../src/controllers/hqReportController.js";
import { MenuService } from "../../src/services/menuService.js";
import { OutletService } from "../../src/services/outletService.js";
import { ReportService } from "../../src/services/reportService.js";
import { createMockResponse } from "../helpers/http.js";

describe("HQ controllers", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("createOutlet returns 201 with serialized outlet", async () => {
    jest.spyOn(OutletService.prototype, "createOutlet").mockResolvedValue({
      id: 1,
      code: "OUTLET01",
      name: "Central",
      location: "Downtown",
      createdAt: new Date("2026-03-13T00:00:00.000Z"),
      updatedAt: new Date("2026-03-13T00:00:00.000Z")
    } as any);
    const response = createMockResponse();
    response.locals.validated = {
      params: {},
      body: { code: "OUTLET01", name: "Central", location: "Downtown" },
      query: {}
    };

    await createOutlet({} as any, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      id: 1,
      code: "OUTLET01",
      name: "Central",
      location: "Downtown",
      createdAt: "2026-03-13T00:00:00.000Z",
      updatedAt: "2026-03-13T00:00:00.000Z"
    });
  });

  it("listOutlets returns serialized outlet list", async () => {
    jest.spyOn(OutletService.prototype, "listOutlets").mockResolvedValue([
      {
        id: 1,
        code: "OUTLET01",
        name: "Central",
        location: "Downtown",
        createdAt: new Date("2026-03-13T00:00:00.000Z"),
        updatedAt: new Date("2026-03-13T00:00:00.000Z")
      }
    ] as any);
    const response = createMockResponse();

    await listOutlets({} as any, response);

    expect(response.json).toHaveBeenCalledWith([
      {
        id: 1,
        code: "OUTLET01",
        name: "Central",
        location: "Downtown",
        createdAt: "2026-03-13T00:00:00.000Z",
        updatedAt: "2026-03-13T00:00:00.000Z"
      }
    ]);
  });

  it("menu controllers call service and serialize responses", async () => {
    const menuItem = {
      id: 7,
      sku: "BRG-001",
      name: "Burger",
      description: null,
      basePrice: { toString: () => "12.5" },
      stockDeductionUnits: 1,
      isActive: true,
      createdAt: new Date("2026-03-13T00:00:00.000Z"),
      updatedAt: new Date("2026-03-13T00:00:00.000Z")
    };
    jest.spyOn(MenuService.prototype, "createMenuItem").mockResolvedValue(menuItem as any);
    jest.spyOn(MenuService.prototype, "listMenuItems").mockResolvedValue([menuItem] as any);
    jest.spyOn(MenuService.prototype, "getMenuItem").mockResolvedValue(menuItem as any);
    jest.spyOn(MenuService.prototype, "updateMenuItem").mockResolvedValue(menuItem as any);

    const createResponse = createMockResponse();
    createResponse.locals.validated = { params: {}, body: { ...menuItem }, query: {} };
    await createMenuItem({} as any, createResponse);
    expect(createResponse.status).toHaveBeenCalledWith(201);

    const listResponse = createMockResponse();
    await listMenuItems({} as any, listResponse);
    expect(listResponse.json).toHaveBeenCalled();

    const getResponse = createMockResponse();
    getResponse.locals.validated = { params: { id: 7 }, body: {}, query: {} };
    await getMenuItem({} as any, getResponse);
    expect(getResponse.json).toHaveBeenCalled();

    const updateResponse = createMockResponse();
    updateResponse.locals.validated = { params: { id: 7 }, body: { name: "Burger" }, query: {} };
    await updateMenuItem({} as any, updateResponse);
    expect(updateResponse.json).toHaveBeenCalled();
  });

  it("assignment controllers use menu service", async () => {
    jest.spyOn(MenuService.prototype, "assignMenuItem").mockResolvedValue({
      id: 1,
      outletId: 1,
      menuItemId: 7,
      priceOverride: { toString: () => "13" },
      isActive: true,
      createdAt: new Date("2026-03-13T00:00:00.000Z"),
      updatedAt: new Date("2026-03-13T00:00:00.000Z")
    } as any);
    jest.spyOn(MenuService.prototype, "updateOutletAssignment").mockResolvedValue({
      id: 1,
      outletId: 1,
      menuItemId: 7,
      priceOverride: { toString: () => "13" },
      isActive: false,
      createdAt: new Date("2026-03-13T00:00:00.000Z"),
      updatedAt: new Date("2026-03-13T00:00:00.000Z")
    } as any);

    const assignResponse = createMockResponse();
    assignResponse.locals.validated = {
      params: { outletId: 1 },
      body: { menuItemId: 7, priceOverride: 13 },
      query: {}
    };
    await assignMenuItemToOutlet({} as any, assignResponse);
    expect(assignResponse.status).toHaveBeenCalledWith(201);

    const updateResponse = createMockResponse();
    updateResponse.locals.validated = {
      params: { outletId: 1, menuItemId: 7 },
      body: { isActive: false },
      query: {}
    };
    await updateAssignedMenuItem({} as any, updateResponse);
    expect(updateResponse.json).toHaveBeenCalled();
  });

  it("report controllers serialize service output", async () => {
    jest.spyOn(ReportService.prototype, "revenueByOutlet").mockResolvedValue([
      { outletId: 1, outletCode: "OUTLET01", outletName: "Central", totalRevenue: "99.00" }
    ]);
    jest.spyOn(ReportService.prototype, "topItemsByOutlet").mockResolvedValue([
      {
        outletId: 1,
        outletCode: "OUTLET01",
        outletName: "Central",
        menuItemId: 7,
        itemName: "Burger",
        totalQuantity: 5,
        totalRevenue: "65.00"
      }
    ] as any);

    const revenueResponse = createMockResponse();
    await getRevenueByOutlet({} as any, revenueResponse);
    expect(revenueResponse.json).toHaveBeenCalled();

    const topItemsResponse = createMockResponse();
    topItemsResponse.locals.validated = { params: {}, body: {}, query: { outletId: 1 } };
    await getTopItemsByOutlet({} as any, topItemsResponse);
    expect(topItemsResponse.json).toHaveBeenCalled();
  });
});

import { jest } from "@jest/globals";
import { Prisma } from "@prisma/client";
import { MenuRepository } from "../../src/repositories/menuRepository.js";
import { OutletRepository } from "../../src/repositories/outletRepository.js";
import { MenuService } from "../../src/services/menuService.js";

describe("MenuService", () => {
  const service = new MenuService();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a menu item with Decimal base price", async () => {
    const createSpy = jest.spyOn(MenuRepository.prototype, "create").mockResolvedValue({
      id: 1,
      sku: "BRG-001",
      name: "Burger",
      description: null,
      basePrice: new Prisma.Decimal("12.50"),
      stockDeductionUnits: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    await service.createMenuItem({
      sku: "BRG-001",
      name: "Burger",
      description: null,
      basePrice: 12.5,
      stockDeductionUnits: 1,
      isActive: true
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        basePrice: expect.any(Prisma.Decimal)
      })
    );
  });

  it("throws when assigning to a missing outlet", async () => {
    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue(null);
    jest.spyOn(MenuRepository.prototype, "findById").mockResolvedValue({
      id: 7
    } as any);

    await expect(
      service.assignMenuItem(9, { menuItemId: 7, priceOverride: null, isActive: true })
    ).rejects.toMatchObject({ code: "OUTLET_NOT_FOUND" });
  });

  it("maps assigned menu to outlet-specific effective price", async () => {
    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(MenuRepository.prototype, "listAssignedOutletMenu").mockResolvedValue([
      {
        menuItem: {
          id: 7,
          sku: "BRG-001",
          name: "Burger",
          description: null,
          basePrice: new Prisma.Decimal("12.50"),
          stockDeductionUnits: 1
        },
        priceOverride: new Prisma.Decimal("13.00")
      }
    ] as any);

    const result = await service.listOutletAssignedMenu(1);

    expect(result).toEqual([
      {
        id: 7,
        sku: "BRG-001",
        name: "Burger",
        description: null,
        price: new Prisma.Decimal("13.00"),
        stockDeductionUnits: 1
      }
    ]);
  });
});

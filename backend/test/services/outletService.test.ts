import { jest } from "@jest/globals";
import { InventoryRepository } from "../../src/repositories/inventoryRepository.js";
import { MenuRepository } from "../../src/repositories/menuRepository.js";
import { OutletRepository } from "../../src/repositories/outletRepository.js";
import { OutletService } from "../../src/services/outletService.js";

describe("OutletService", () => {
  const service = new OutletService();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lists inventory for an existing outlet", async () => {
    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue({ id: 1 } as any);
    const listSpy = jest
      .spyOn(InventoryRepository.prototype, "listByOutlet")
      .mockResolvedValue([{ id: 1 }] as any);

    const result = await service.listInventory(1);

    expect(listSpy).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it("prevents inventory adjustments that go negative", async () => {
    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(MenuRepository.prototype, "findById").mockResolvedValue({ id: 7 } as any);
    jest
      .spyOn(InventoryRepository.prototype, "findByOutletAndMenuItem")
      .mockResolvedValue({ stockQuantity: 1 } as any);

    await expect(
      service.adjustInventory(1, {
        menuItemId: 7,
        quantityDelta: -2
      })
    ).rejects.toMatchObject({ code: "NEGATIVE_STOCK" });
  });

  it("upserts adjusted inventory quantity", async () => {
    jest.spyOn(OutletRepository.prototype, "findById").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(MenuRepository.prototype, "findById").mockResolvedValue({ id: 7 } as any);
    jest
      .spyOn(InventoryRepository.prototype, "findByOutletAndMenuItem")
      .mockResolvedValue({ stockQuantity: 4 } as any);
    const upsertSpy = jest
      .spyOn(InventoryRepository.prototype, "upsert")
      .mockResolvedValue({ stockQuantity: 6 } as any);

    await service.adjustInventory(1, {
      menuItemId: 7,
      quantityDelta: 2
    });

    expect(upsertSpy).toHaveBeenCalledWith(1, 7, 6);
  });
});

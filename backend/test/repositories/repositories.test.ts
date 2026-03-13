import { jest } from "@jest/globals";
import { InventoryRepository } from "../../src/repositories/inventoryRepository.js";
import { MenuRepository } from "../../src/repositories/menuRepository.js";
import { OutletRepository } from "../../src/repositories/outletRepository.js";
import { ReportRepository } from "../../src/repositories/reportRepository.js";
import { SaleRepository } from "../../src/repositories/saleRepository.js";

describe("repositories", () => {
  it("InventoryRepository.listByOutlet delegates to prisma with include and order", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new InventoryRepository({
      inventory: { findMany }
    } as any);

    await repository.listByOutlet(2);

    expect(findMany).toHaveBeenCalledWith({
      where: { outletId: 2 },
      include: { menuItem: true },
      orderBy: { menuItem: { name: "asc" } }
    });
  });

  it("MenuRepository.updateOutletAssignment delegates composite key update", async () => {
    const update = jest.fn().mockResolvedValue({});
    const repository = new MenuRepository({
      outletMenuItem: { update }
    } as any);

    await repository.updateOutletAssignment(1, 7, { isActive: false });

    expect(update).toHaveBeenCalledWith({
      where: {
        outletId_menuItemId: {
          outletId: 1,
          menuItemId: 7
        }
      },
      data: { isActive: false }
    });
  });

  it("OutletRepository.list orders by id ascending", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new OutletRepository({
      outlet: { findMany }
    } as any);

    await repository.list();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { id: "asc" } });
  });

  it("ReportRepository.topItemsByOutlet uses queryRaw", async () => {
    const $queryRaw = jest.fn().mockResolvedValue([]);
    const repository = new ReportRepository({ $queryRaw } as any);

    await repository.topItemsByOutlet(1);

    expect($queryRaw).toHaveBeenCalledTimes(1);
  });

  it("SaleRepository.guardedDeductInventory converts raw update count to number", async () => {
    const $executeRaw = jest.fn().mockResolvedValue(BigInt(1));
    const repository = new SaleRepository({ $executeRaw } as any);

    const updated = await repository.guardedDeductInventory(1, 7, 2);

    expect(updated).toBe(1);
    expect($executeRaw).toHaveBeenCalledTimes(1);
  });

  it("SaleRepository.lockReceiptSequence inserts row if missing and then locks it", async () => {
    const $executeRaw = jest.fn().mockResolvedValue(1);
    const $queryRaw = jest.fn().mockResolvedValue([{ outletId: 2, lastNumber: 4 }]);
    const repository = new SaleRepository({ $executeRaw, $queryRaw } as any);

    const sequence = await repository.lockReceiptSequence(2);

    expect(sequence).toEqual({ outletId: 2, lastNumber: 4 });
    expect($executeRaw).toHaveBeenCalledTimes(1);
    expect($queryRaw).toHaveBeenCalledTimes(1);
  });
});

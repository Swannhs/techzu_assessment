import { jest } from "@jest/globals";
import { ReportRepository } from "../../src/repositories/reportRepository.js";
import { ReportService } from "../../src/services/reportService.js";

describe("ReportService", () => {
  const service = new ReportService();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns revenue rows unchanged", async () => {
    jest.spyOn(ReportRepository.prototype, "revenueByOutlet").mockResolvedValue([
      {
        outletId: 1,
        outletCode: "OUTLET01",
        outletName: "Central",
        totalRevenue: "120.00"
      }
    ]);

    const result = await service.revenueByOutlet();

    expect(result[0]?.totalRevenue).toBe("120.00");
  });

  it("normalizes bigint totals in top items report", async () => {
    jest.spyOn(ReportRepository.prototype, "topItemsByOutlet").mockResolvedValue([
      {
        outletId: 1,
        outletCode: "OUTLET01",
        outletName: "Central",
        menuItemId: 7,
        itemName: "Burger",
        totalQuantity: BigInt(5),
        totalRevenue: "65.00",
        rankWithinOutlet: BigInt(1)
      }
    ] as any);

    const result = await service.topItemsByOutlet();

    expect(result).toEqual([
      expect.objectContaining({
        totalQuantity: 5,
        rankWithinOutlet: 1
      })
    ]);
  });
});

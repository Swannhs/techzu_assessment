import { prisma } from "../config/prisma.js";
import { ReportRepository } from "../repositories/reportRepository.js";

export class ReportService {
  private readonly reportRepository = new ReportRepository(prisma);

  revenueByOutlet() {
    return this.reportRepository.revenueByOutlet();
  }

  async topItemsByOutlet(outletId?: number) {
    const result = await this.reportRepository.topItemsByOutlet(outletId);
    return result.map((item) => ({
      ...item,
      totalQuantity: Number(item.totalQuantity),
      ...("rankWithinOutlet" in item
        ? { rankWithinOutlet: Number(item.rankWithinOutlet) }
        : {})
    }));
  }
}

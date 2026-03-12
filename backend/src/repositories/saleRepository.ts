import { Prisma } from "@prisma/client";

export class SaleRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}

  async nextReceiptNumber(outletId: number, outletCode: string) {
    const latestSale = await this.tx.sale.findFirst({
      where: { outletId },
      orderBy: { id: "desc" },
      select: { receiptNumber: true }
    });

    const lastSeq = latestSale
      ? Number(latestSale.receiptNumber.split("-").pop() ?? "0")
      : 0;
    const nextSeq = lastSeq + 1;
    return `${outletCode}-${String(nextSeq).padStart(6, "0")}`;
  }

  createSale(data: {
    outletId: number;
    receiptNumber: string;
    subtotalAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
  }) {
    return this.tx.sale.create({ data });
  }

  createSaleItems(
    data: Array<{
      saleId: bigint;
      menuItemId: number;
      itemNameSnapshot: string;
      unitPriceSnapshot: Prisma.Decimal;
      quantity: number;
      lineTotal: Prisma.Decimal;
    }>
  ) {
    return this.tx.saleItem.createMany({ data });
  }

  async guardedDeductInventory(outletId: number, menuItemId: number, deductionUnits: number) {
    const updated = await this.tx.$executeRaw`
      UPDATE "Inventory"
      SET "stockQuantity" = "stockQuantity" - ${deductionUnits},
          "updatedAt" = NOW()
      WHERE "outletId" = ${outletId}
        AND "menuItemId" = ${menuItemId}
        AND "stockQuantity" >= ${deductionUnits}
    `;
    return Number(updated);
  }
}

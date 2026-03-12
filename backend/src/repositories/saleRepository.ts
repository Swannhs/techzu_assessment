import { Prisma } from "@prisma/client";

export class SaleRepository {
  constructor(private readonly tx: Prisma.TransactionClient) {}

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

  async lockReceiptSequence(outletId: number) {
    await this.tx.$executeRaw`
      INSERT INTO "ReceiptSequence" ("outletId", "lastNumber", "updatedAt")
      VALUES (${outletId}, 0, NOW())
      ON CONFLICT ("outletId") DO NOTHING
    `;

    const rows = await this.tx.$queryRaw<Array<{ outletId: number; lastNumber: number }>>`
      SELECT "outletId", "lastNumber"
      FROM "ReceiptSequence"
      WHERE "outletId" = ${outletId}
      FOR UPDATE
    `;

    return rows[0];
  }

  updateReceiptSequence(outletId: number, lastNumber: number) {
    return this.tx.receiptSequence.update({
      where: { outletId },
      data: { lastNumber }
    });
  }
}

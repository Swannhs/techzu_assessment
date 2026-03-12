import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class ReportRepository {
  constructor(private readonly db: DbClient) {}

  revenueByOutlet() {
    return this.db.$queryRaw<
      Array<{
        outletId: number;
        outletCode: string;
        outletName: string;
        totalRevenue: string;
      }>
    >`
      SELECT
        o.id AS "outletId",
        o.code AS "outletCode",
        o.name AS "outletName",
        COALESCE(SUM(s."totalAmount"), 0)::text AS "totalRevenue"
      FROM "Outlet" o
      LEFT JOIN "Sale" s ON s."outletId" = o.id
      GROUP BY o.id
      ORDER BY COALESCE(SUM(s."totalAmount"), 0) DESC, o.id ASC
    `;
  }

  topItemsByOutlet(outletId?: number) {
    if (outletId) {
      return this.db.$queryRaw<
        Array<{
          outletId: number;
          outletCode: string;
          outletName: string;
          menuItemId: number;
          itemName: string;
          totalQuantity: bigint;
          totalRevenue: string;
        }>
      >`
        SELECT
          o.id AS "outletId",
          o.code AS "outletCode",
          o.name AS "outletName",
          si."menuItemId" AS "menuItemId",
          si."itemNameSnapshot" AS "itemName",
          SUM(si.quantity) AS "totalQuantity",
          SUM(si."lineTotal")::text AS "totalRevenue"
        FROM "Sale" s
        INNER JOIN "SaleItem" si ON si."saleId" = s.id
        INNER JOIN "Outlet" o ON o.id = s."outletId"
        WHERE s."outletId" = ${outletId}
        GROUP BY o.id, si."menuItemId", si."itemNameSnapshot"
        ORDER BY SUM(si.quantity) DESC, SUM(si."lineTotal") DESC
        LIMIT 5
      `;
    }

    return this.db.$queryRaw<
      Array<{
        outletId: number;
        outletCode: string;
        outletName: string;
        menuItemId: number;
        itemName: string;
        totalQuantity: bigint;
        totalRevenue: string;
        rankWithinOutlet: bigint;
      }>
    >`
      SELECT *
      FROM (
        SELECT
          o.id AS "outletId",
          o.code AS "outletCode",
          o.name AS "outletName",
          si."menuItemId" AS "menuItemId",
          si."itemNameSnapshot" AS "itemName",
          SUM(si.quantity) AS "totalQuantity",
          SUM(si."lineTotal")::text AS "totalRevenue",
          ROW_NUMBER() OVER (
            PARTITION BY o.id
            ORDER BY SUM(si.quantity) DESC, SUM(si."lineTotal") DESC
          ) AS "rankWithinOutlet"
        FROM "Sale" s
        INNER JOIN "SaleItem" si ON si."saleId" = s.id
        INNER JOIN "Outlet" o ON o.id = s."outletId"
        GROUP BY o.id, si."menuItemId", si."itemNameSnapshot"
      ) ranked
      WHERE ranked."rankWithinOutlet" <= 5
      ORDER BY ranked."outletId" ASC, ranked."rankWithinOutlet" ASC
    `;
  }
}

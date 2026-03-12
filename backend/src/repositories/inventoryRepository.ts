import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class InventoryRepository {
  constructor(private readonly db: DbClient) {}

  listByOutlet(outletId: number) {
    return this.db.inventory.findMany({
      where: { outletId },
      include: {
        menuItem: true
      },
      orderBy: {
        menuItem: {
          name: "asc"
        }
      }
    });
  }

  findByOutletAndMenuItem(outletId: number, menuItemId: number) {
    return this.db.inventory.findUnique({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      }
    });
  }

  upsert(outletId: number, menuItemId: number, stockQuantity: number) {
    return this.db.inventory.upsert({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      },
      create: {
        outletId,
        menuItemId,
        stockQuantity
      },
      update: {
        stockQuantity
      }
    });
  }
}

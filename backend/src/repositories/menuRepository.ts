import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class MenuRepository {
  constructor(private readonly db: DbClient) {}

  create(data: {
    sku: string;
    name: string;
    description?: string | null;
    basePrice: Prisma.Decimal;
    stockDeductionUnits: number;
    isActive: boolean;
  }) {
    return this.db.menuItem.create({ data });
  }

  list() {
    return this.db.menuItem.findMany({
      orderBy: { id: "asc" }
    });
  }

  findById(menuItemId: number) {
    return this.db.menuItem.findUnique({
      where: { id: menuItemId }
    });
  }

  update(
    menuItemId: number,
    data: Partial<{
      name: string;
      description: string | null;
      basePrice: Prisma.Decimal;
      stockDeductionUnits: number;
      isActive: boolean;
    }>
  ) {
    return this.db.menuItem.update({
      where: { id: menuItemId },
      data
    });
  }

  createOutletAssignment(data: {
    outletId: number;
    menuItemId: number;
    priceOverride?: Prisma.Decimal | null;
    isActive: boolean;
  }) {
    return this.db.outletMenuItem.create({
      data
    });
  }

  findOutletAssignment(outletId: number, menuItemId: number) {
    return this.db.outletMenuItem.findUnique({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      },
      include: {
        menuItem: true
      }
    });
  }

  updateOutletAssignment(
    outletId: number,
    menuItemId: number,
    payload: Partial<{
      priceOverride: Prisma.Decimal | null;
      isActive: boolean;
    }>
  ) {
    return this.db.outletMenuItem.update({
      where: {
        outletId_menuItemId: {
          outletId,
          menuItemId
        }
      },
      data: payload
    });
  }

  listAssignedOutletMenu(outletId: number) {
    return this.db.outletMenuItem.findMany({
      where: {
        outletId,
        isActive: true,
        menuItem: {
          isActive: true
        }
      },
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
}

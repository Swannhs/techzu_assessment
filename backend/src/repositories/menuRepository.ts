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
}

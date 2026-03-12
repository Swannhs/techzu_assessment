import { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class OutletRepository {
  constructor(private readonly db: DbClient) {}

  create(data: { code: string; name: string; location: string }) {
    return this.db.outlet.create({ data });
  }

  list() {
    return this.db.outlet.findMany({
      orderBy: { id: "asc" }
    });
  }

  findById(outletId: number) {
    return this.db.outlet.findUnique({ where: { id: outletId } });
  }
}

import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { OutletRepository } from "../repositories/outletRepository.js";
import { ApiError } from "../utils/apiError.js";

export class OutletService {
  private readonly outletRepository = new OutletRepository(prisma);

  async createOutlet(payload: { code: string; name: string; location: string }) {
    try {
      return await this.outletRepository.create(payload);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError({
          statusCode: 409,
          code: "OUTLET_CODE_EXISTS",
          message: "Outlet code already exists"
        });
      }
      throw error;
    }
  }

  listOutlets() {
    return this.outletRepository.list();
  }
}

import { Request, Response } from "express";
import { SaleService } from "../services/saleService.js";
import { validate } from "../utils/validate.js";
import { outletIdParamSchema } from "../validators/commonValidators.js";
import { createSaleSchema } from "../validators/outletValidators.js";

const saleService = new SaleService();

export async function createOutletSale(request: Request, response: Response) {
  const params = validate(outletIdParamSchema, request.params);
  const payload = validate(createSaleSchema, request.body);
  const result = await saleService.createSale(params.outletId, payload);
  response.status(201).json(result);
}

import { Request, Response } from "express";
import { OutletService } from "../services/outletService.js";
import { validate } from "../utils/validate.js";
import { outletIdParamSchema } from "../validators/commonValidators.js";
import { inventoryAdjustmentSchema } from "../validators/outletValidators.js";

const outletService = new OutletService();

export async function getOutletInventory(request: Request, response: Response) {
  const params = validate(outletIdParamSchema, request.params);
  const result = await outletService.listInventory(params.outletId);
  response.json(result);
}

export async function adjustOutletInventory(request: Request, response: Response) {
  const params = validate(outletIdParamSchema, request.params);
  const payload = validate(inventoryAdjustmentSchema, request.body);
  const result = await outletService.adjustInventory(params.outletId, payload);
  response.json(result);
}

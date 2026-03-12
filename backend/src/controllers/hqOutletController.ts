import { Request, Response } from "express";
import { OutletService } from "../services/outletService.js";
import { validate } from "../utils/validate.js";
import { createOutletSchema } from "../validators/hqValidators.js";

const outletService = new OutletService();

export async function createOutlet(request: Request, response: Response) {
  const payload = validate(createOutletSchema, request.body);
  const result = await outletService.createOutlet(payload);
  response.status(201).json(result);
}

export async function listOutlets(_request: Request, response: Response) {
  const result = await outletService.listOutlets();
  response.json(result);
}

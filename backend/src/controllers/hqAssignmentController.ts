import { Request, Response } from "express";
import { MenuService } from "../services/menuService.js";
import { validate } from "../utils/validate.js";
import { outletMenuItemParamSchema, outletIdParamSchema } from "../validators/commonValidators.js";
import {
  assignMenuItemSchema,
  updateOutletAssignmentSchema
} from "../validators/hqValidators.js";

const menuService = new MenuService();

export async function assignMenuItemToOutlet(request: Request, response: Response) {
  const params = validate(outletIdParamSchema, request.params);
  const payload = validate(assignMenuItemSchema, request.body);

  const result = await menuService.assignMenuItem(params.outletId, {
    ...payload,
    isActive: payload.isActive ?? true
  });

  response.status(201).json(result);
}

export async function updateAssignedMenuItem(request: Request, response: Response) {
  const params = validate(outletMenuItemParamSchema, request.params);
  const payload = validate(updateOutletAssignmentSchema, request.body);

  const result = await menuService.updateOutletAssignment(
    params.outletId,
    params.menuItemId,
    payload
  );

  response.json(result);
}

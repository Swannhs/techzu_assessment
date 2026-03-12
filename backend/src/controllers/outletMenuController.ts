import { Request, Response } from "express";
import { MenuService } from "../services/menuService.js";
import { validate } from "../utils/validate.js";
import { outletIdParamSchema } from "../validators/commonValidators.js";

const menuService = new MenuService();

export async function getAssignedOutletMenu(request: Request, response: Response) {
  const params = validate(outletIdParamSchema, request.params);
  const result = await menuService.listOutletAssignedMenu(params.outletId);
  response.json(result);
}

import { Request, Response } from "express";
import { MenuService } from "../services/menuService.js";
import { validate } from "../utils/validate.js";
import {
  createMenuItemSchema,
  updateMenuItemSchema
} from "../validators/hqValidators.js";
import { menuItemIdParamSchema } from "../validators/commonValidators.js";

const menuService = new MenuService();

export async function createMenuItem(request: Request, response: Response) {
  const payload = validate(createMenuItemSchema, request.body);
  const result = await menuService.createMenuItem({
    ...payload,
    isActive: payload.isActive ?? true
  });
  response.status(201).json(result);
}

export async function listMenuItems(_request: Request, response: Response) {
  const result = await menuService.listMenuItems();
  response.json(result);
}

export async function getMenuItem(request: Request, response: Response) {
  const params = validate(menuItemIdParamSchema, request.params);
  const result = await menuService.getMenuItem(params.id);
  response.json(result);
}

export async function updateMenuItem(request: Request, response: Response) {
  const params = validate(menuItemIdParamSchema, request.params);
  const payload = validate(updateMenuItemSchema, request.body);
  const result = await menuService.updateMenuItem(params.id, payload);
  response.json(result);
}

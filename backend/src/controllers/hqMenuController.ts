import { Request, Response } from "express";
import type {
  CreateMenuItemRequestDto,
  UpdateMenuItemRequestDto
} from "../dtos/hqDtos.js";
import { toMenuItemResponseDto } from "../dtos/hqDtos.js";
import { MenuService } from "../services/menuService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";
import type { MenuItemIdParams } from "../validators/commonValidators.js";

const menuService = new MenuService();

export async function createMenuItem(_request: Request, response: Response) {
  const { body } = getValidatedRequest<never, CreateMenuItemRequestDto>(response);
  const payload = body;
  const result = await menuService.createMenuItem({
    ...payload,
    isActive: payload.isActive ?? true
  });
  response.status(201).json(toMenuItemResponseDto(result));
}

export async function listMenuItems(_request: Request, response: Response) {
  const result = await menuService.listMenuItems();
  response.json(result.map(toMenuItemResponseDto));
}

export async function getMenuItem(_request: Request, response: Response) {
  const { params } = getValidatedRequest<MenuItemIdParams>(response);
  const result = await menuService.getMenuItem(params.id);
  response.json(toMenuItemResponseDto(result));
}

export async function updateMenuItem(_request: Request, response: Response) {
  const { params, body } = getValidatedRequest<MenuItemIdParams, UpdateMenuItemRequestDto>(response);
  const payload = body;
  const result = await menuService.updateMenuItem(params.id, payload);
  response.json(toMenuItemResponseDto(result));
}

import { Request, Response } from "express";
import type { OutletIdRequestDto } from "../dtos/outletDtos.js";
import { toAssignedOutletMenuItemResponseDto } from "../dtos/outletDtos.js";
import { MenuService } from "../services/menuService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";

const menuService = new MenuService();

export async function getAssignedOutletMenu(_request: Request, response: Response) {
  const { params } = getValidatedRequest<OutletIdRequestDto>(response);
  const result = await menuService.listOutletAssignedMenu(params.outletId);
  response.json(result.map(toAssignedOutletMenuItemResponseDto));
}

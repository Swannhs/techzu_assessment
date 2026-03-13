import { Request, Response } from "express";
import type {
  AssignMenuItemRequestDto,
  UpdateOutletAssignmentRequestDto
} from "../dtos/hqDtos.js";
import { toOutletMenuAssignmentResponseDto } from "../dtos/hqDtos.js";
import { MenuService } from "../services/menuService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";
import type { OutletIdParams, OutletMenuItemParams } from "../validators/commonValidators.js";

const menuService = new MenuService();

export async function assignMenuItemToOutlet(_request: Request, response: Response) {
  const { params, body } = getValidatedRequest<OutletIdParams, AssignMenuItemRequestDto>(response);
  const payload = body;

  const result = await menuService.assignMenuItem(params.outletId, {
    ...payload,
    isActive: payload.isActive ?? true
  });

  response.status(201).json(toOutletMenuAssignmentResponseDto(result));
}

export async function updateAssignedMenuItem(_request: Request, response: Response) {
  const { params, body } =
    getValidatedRequest<OutletMenuItemParams, UpdateOutletAssignmentRequestDto>(response);
  const payload = body;

  const result = await menuService.updateOutletAssignment(
    params.outletId,
    params.menuItemId,
    payload
  );

  response.json(toOutletMenuAssignmentResponseDto(result));
}

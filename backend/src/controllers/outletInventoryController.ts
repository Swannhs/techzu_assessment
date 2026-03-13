import { Request, Response } from "express";
import type {
  InventoryAdjustmentRequestDto,
  OutletIdRequestDto
} from "../dtos/outletDtos.js";
import {
  toInventoryAdjustmentResponseDto,
  toInventoryItemResponseDto
} from "../dtos/outletDtos.js";
import { OutletService } from "../services/outletService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";

const outletService = new OutletService();

export async function getOutletInventory(_request: Request, response: Response) {
  const { params } = getValidatedRequest<OutletIdRequestDto>(response);
  const result = await outletService.listInventory(params.outletId);
  response.json(result.map(toInventoryItemResponseDto));
}

export async function adjustOutletInventory(_request: Request, response: Response) {
  const { params, body } =
    getValidatedRequest<OutletIdRequestDto, InventoryAdjustmentRequestDto>(response);
  const payload = body;
  const result = await outletService.adjustInventory(params.outletId, payload);
  response.json(toInventoryAdjustmentResponseDto(result));
}

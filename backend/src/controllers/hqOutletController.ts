import { Request, Response } from "express";
import type { CreateOutletRequestDto } from "../dtos/hqDtos.js";
import { toOutletResponseDto } from "../dtos/hqDtos.js";
import { OutletService } from "../services/outletService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";

const outletService = new OutletService();

export async function createOutlet(request: Request, response: Response) {
  const { body: payload } = getValidatedRequest<never, CreateOutletRequestDto>(response);
  const result = await outletService.createOutlet(payload);
  response.status(201).json(toOutletResponseDto(result));
}

export async function listOutlets(_request: Request, response: Response) {
  const result = await outletService.listOutlets();
  response.json(result.map(toOutletResponseDto));
}

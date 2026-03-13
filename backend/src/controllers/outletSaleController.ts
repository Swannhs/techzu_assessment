import { Request, Response } from "express";
import type {
  CreateSaleRequestDto,
  OutletIdRequestDto
} from "../dtos/outletDtos.js";
import { toSaleResponseDto } from "../dtos/outletDtos.js";
import { SaleService } from "../services/saleService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";

const saleService = new SaleService();

export async function createOutletSale(_request: Request, response: Response) {
  const { params, body } = getValidatedRequest<OutletIdRequestDto, CreateSaleRequestDto>(response);
  const payload = body;
  const result = await saleService.createSale(params.outletId, payload);
  response.status(201).json(toSaleResponseDto(result));
}

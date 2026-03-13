import { Request, Response } from "express";
import type { TopItemsByOutletQueryDto } from "../dtos/hqDtos.js";
import {
  toRevenueByOutletResponseDto,
  toTopItemsByOutletResponseDto
} from "../dtos/hqDtos.js";
import { ReportService } from "../services/reportService.js";
import { getValidatedRequest } from "../middlewares/validateRequest.js";

const reportService = new ReportService();

export async function getRevenueByOutlet(_request: Request, response: Response) {
  const result = await reportService.revenueByOutlet();
  response.json(result.map(toRevenueByOutletResponseDto));
}

export async function getTopItemsByOutlet(_request: Request, response: Response) {
  const { query } = getValidatedRequest<never, never, TopItemsByOutletQueryDto>(response);
  const result = await reportService.topItemsByOutlet(query.outletId);
  response.json(result.map(toTopItemsByOutletResponseDto));
}

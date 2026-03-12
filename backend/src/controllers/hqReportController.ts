import { Request, Response } from "express";
import { ReportService } from "../services/reportService.js";
import { validate } from "../utils/validate.js";
import { topItemsReportQuerySchema } from "../validators/hqValidators.js";

const reportService = new ReportService();

export async function getRevenueByOutlet(_request: Request, response: Response) {
  const result = await reportService.revenueByOutlet();
  response.json(result);
}

export async function getTopItemsByOutlet(request: Request, response: Response) {
  const query = validate(topItemsReportQuerySchema, request.query);
  const result = await reportService.topItemsByOutlet(query.outletId);
  response.json(result);
}

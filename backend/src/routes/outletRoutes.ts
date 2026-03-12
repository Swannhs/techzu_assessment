import { Router } from "express";
import {
  adjustOutletInventory,
  getOutletInventory
} from "../controllers/outletInventoryController.js";
import { getAssignedOutletMenu } from "../controllers/outletMenuController.js";
import { createOutletSale } from "../controllers/outletSaleController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const outletRoutes = Router();

outletRoutes.get("/:outletId/menu", asyncHandler(getAssignedOutletMenu));
outletRoutes.get("/:outletId/inventory", asyncHandler(getOutletInventory));
outletRoutes.post("/:outletId/inventory/adjust", asyncHandler(adjustOutletInventory));
outletRoutes.post("/:outletId/sales", asyncHandler(createOutletSale));

import { Router } from "express";
import {
  adjustOutletInventory,
  getOutletInventory
} from "../controllers/outletInventoryController.js";
import { getAssignedOutletMenu } from "../controllers/outletMenuController.js";
import { createOutletSale } from "../controllers/outletSaleController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { outletIdParamSchema } from "../validators/commonValidators.js";
import { createSaleSchema, inventoryAdjustmentSchema } from "../validators/outletValidators.js";

export const outletRoutes = Router();

outletRoutes.get(
  "/:outletId/menu",
  validateRequest({ params: outletIdParamSchema }),
  asyncHandler(getAssignedOutletMenu)
);
outletRoutes.get(
  "/:outletId/inventory",
  validateRequest({ params: outletIdParamSchema }),
  asyncHandler(getOutletInventory)
);
outletRoutes.post(
  "/:outletId/inventory/adjust",
  validateRequest({ params: outletIdParamSchema, body: inventoryAdjustmentSchema }),
  asyncHandler(adjustOutletInventory)
);
outletRoutes.post(
  "/:outletId/sales",
  validateRequest({ params: outletIdParamSchema, body: createSaleSchema }),
  asyncHandler(createOutletSale)
);

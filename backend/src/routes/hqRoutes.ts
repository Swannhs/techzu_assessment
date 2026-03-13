import { Router } from "express";
import {
  createMenuItem,
  getMenuItem,
  listMenuItems,
  updateMenuItem
} from "../controllers/hqMenuController.js";
import {
  assignMenuItemToOutlet,
  updateAssignedMenuItem
} from "../controllers/hqAssignmentController.js";
import {
  getRevenueByOutlet,
  getTopItemsByOutlet
} from "../controllers/hqReportController.js";
import { createOutlet, listOutlets } from "../controllers/hqOutletController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { menuItemIdParamSchema, outletIdParamSchema, outletMenuItemParamSchema } from "../validators/commonValidators.js";
import {
  assignMenuItemSchema,
  createMenuItemSchema,
  createOutletSchema,
  topItemsReportQuerySchema,
  updateMenuItemSchema,
  updateOutletAssignmentSchema
} from "../validators/hqValidators.js";

export const hqRoutes = Router();

hqRoutes.post("/outlets", validateRequest({ body: createOutletSchema }), asyncHandler(createOutlet));
hqRoutes.get("/outlets", asyncHandler(listOutlets));
hqRoutes.post("/menu-items", validateRequest({ body: createMenuItemSchema }), asyncHandler(createMenuItem));
hqRoutes.get("/menu-items", asyncHandler(listMenuItems));
hqRoutes.get("/menu-items/:id", validateRequest({ params: menuItemIdParamSchema }), asyncHandler(getMenuItem));
hqRoutes.put(
  "/menu-items/:id",
  validateRequest({ params: menuItemIdParamSchema, body: updateMenuItemSchema }),
  asyncHandler(updateMenuItem)
);
hqRoutes.post(
  "/outlets/:outletId/menu-items",
  validateRequest({ params: outletIdParamSchema, body: assignMenuItemSchema }),
  asyncHandler(assignMenuItemToOutlet)
);
hqRoutes.put(
  "/outlets/:outletId/menu-items/:menuItemId",
  validateRequest({
    params: outletMenuItemParamSchema,
    body: updateOutletAssignmentSchema
  }),
  asyncHandler(updateAssignedMenuItem)
);
hqRoutes.get("/reports/revenue-by-outlet", asyncHandler(getRevenueByOutlet));
hqRoutes.get(
  "/reports/top-items-by-outlet",
  validateRequest({ query: topItemsReportQuerySchema }),
  asyncHandler(getTopItemsByOutlet)
);

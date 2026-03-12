import { Router } from "express";
import { getAssignedOutletMenu } from "../controllers/outletMenuController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const outletRoutes = Router();

outletRoutes.get("/:outletId/menu", asyncHandler(getAssignedOutletMenu));

import { Router } from "express";
import {
  createMenuItem,
  getMenuItem,
  listMenuItems,
  updateMenuItem
} from "../controllers/hqMenuController.js";
import { createOutlet, listOutlets } from "../controllers/hqOutletController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const hqRoutes = Router();

hqRoutes.post("/outlets", asyncHandler(createOutlet));
hqRoutes.get("/outlets", asyncHandler(listOutlets));
hqRoutes.post("/menu-items", asyncHandler(createMenuItem));
hqRoutes.get("/menu-items", asyncHandler(listMenuItems));
hqRoutes.get("/menu-items/:id", asyncHandler(getMenuItem));
hqRoutes.put("/menu-items/:id", asyncHandler(updateMenuItem));

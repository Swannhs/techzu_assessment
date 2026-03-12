import { Router } from "express";
import { createOutlet, listOutlets } from "../controllers/hqOutletController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const hqRoutes = Router();

hqRoutes.post("/outlets", asyncHandler(createOutlet));
hqRoutes.get("/outlets", asyncHandler(listOutlets));

import { Router } from "express";
import { hqRoutes } from "./hqRoutes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRoutes.use("/hq", hqRoutes);

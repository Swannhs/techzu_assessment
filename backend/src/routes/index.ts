import { Router } from "express";
import { hqRoutes } from "./hqRoutes.js";
import { outletRoutes } from "./outletRoutes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRoutes.use("/hq", hqRoutes);
apiRoutes.use("/outlets", outletRoutes);

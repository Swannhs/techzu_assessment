import { Router } from "express";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

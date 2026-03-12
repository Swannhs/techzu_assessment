import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";

export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR"
  });
}

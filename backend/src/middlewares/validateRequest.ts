import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { validate } from "../utils/validate.js";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export interface ValidatedRequestData<TParams = unknown, TBody = unknown, TQuery = unknown> {
  params: TParams;
  body: TBody;
  query: TQuery;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (request: Request, response: Response, next: NextFunction) => {
    response.locals.validated = {
      params: schemas.params ? validate(schemas.params, request.params) : request.params,
      body: schemas.body ? validate(schemas.body, request.body) : request.body,
      query: schemas.query ? validate(schemas.query, request.query) : request.query
    };

    next();
  };
}

export function getValidatedRequest<TParams = unknown, TBody = unknown, TQuery = unknown>(
  response: Response
) {
  return response.locals.validated as ValidatedRequestData<TParams, TBody, TQuery>;
}

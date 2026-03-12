import { ApiErrorOptions } from "../types/errors.js";

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

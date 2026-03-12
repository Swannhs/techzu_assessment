export interface ApiErrorOptions {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "/api";

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {})
      },
      ...options
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? `Unable to reach the server: ${error.message}`
        : "Unable to reach the server";
    throw new ApiClientError(message, 0, "NETWORK_ERROR");
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed", code: "REQUEST_FAILED" }));
      throw new ApiClientError(
        error.message ?? "Request failed",
        response.status,
        error.code,
        error.details
      );
    }

    const text = await response.text().catch(() => "");
    throw new ApiClientError(text || "Request failed", response.status, "REQUEST_FAILED");
  }

  return response.json() as Promise<T>;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function badRequest(message: string, code?: string): never {
  throw new HttpError(400, message, code ?? "BAD_REQUEST");
}

export function notFound(message: string = "Resource not found", code?: string): never {
  throw new HttpError(404, message, code ?? "NOT_FOUND");
}

export function conflict(message: string, code?: string): never {
  throw new HttpError(409, message, code ?? "CONFLICT");
}

export function internalError(
  message: string = "Internal server error",
  code?: string
): never {
  throw new HttpError(500, message, code ?? "INTERNAL_ERROR");
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

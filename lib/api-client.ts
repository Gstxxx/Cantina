interface ApiRequestOptions extends RequestInit {
  tenantId?: string;
  unitId?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { tenantId, unitId, headers, ...fetchOptions } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((v, k) => {
        requestHeaders[k] = v;
      });
    } else if (Array.isArray(headers)) {
      for (const [k, v] of headers) requestHeaders[k] = v;
    } else {
      Object.assign(requestHeaders, headers as Record<string, string>);
    }
  }
  if (tenantId) requestHeaders["x-tenant-id"] = tenantId;
  if (unitId) requestHeaders["x-unit-id"] = unitId;

  const response = await fetch(path, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Request failed",
      code: "UNKNOWN_ERROR",
    }));

    throw new ApiError(response.status, error.code, error.error);
  }

  return response.json();
}

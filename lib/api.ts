import { NextRequest, NextResponse } from "next/server";
import { HttpError, isHttpError } from "./errors";

const TENANT_HEADER = "x-tenant-id";
const UNIT_HEADER = "x-unit-id";

export function getTenantId(request: NextRequest): string | null {
  return request.headers.get(TENANT_HEADER) ?? request.nextUrl.searchParams.get("tenantId");
}

export function getUnitId(request: NextRequest): string | null {
  return request.headers.get(UNIT_HEADER) ?? request.nextUrl.searchParams.get("unitId");
}

export function requireTenantId(request: NextRequest): string {
  const id = getTenantId(request);
  if (!id) throw new HttpError(400, "Missing tenant context (X-Tenant-Id or tenantId)", "MISSING_TENANT");
  return id;
}

export function requireUnitId(request: NextRequest): string {
  const id = getUnitId(request);
  if (!id) throw new HttpError(400, "Missing unit context (X-Unit-Id or unitId)", "MISSING_UNIT");
  return id;
}

export function json<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function handleApi(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((e) => {
    if (isHttpError(e)) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: e.status }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  });
}

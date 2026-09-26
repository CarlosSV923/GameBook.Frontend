import { NextResponse } from "next/server";

import { createIgdbClient } from "@/server/igdb/igdb-client";
import { IgdbClientError, type IgdbCatalogFilters } from "@/shared/api/igdb";

export const IGDB_ROUTE_ERROR_CODE = "IGDB_INVALID_REQUEST";

export function getIgdbServerClient() {
  return createIgdbClient();
}

export function parseCatalogFilters(
  request: Request,
): { filters: IgdbCatalogFilters } | { response: NextResponse } {
  const searchParams = new URL(request.url).searchParams;

  const limit = parseInteger(searchParams.get("limit"), "limit", 1, 20);
  const offset = parseInteger(searchParams.get("offset"), "offset", 0);
  const platformId = parseInteger(
    searchParams.get("platformId"),
    "platformId",
    1,
  );
  const yearFrom = parseInteger(
    searchParams.get("yearFrom"),
    "yearFrom",
    1,
    9999,
  );
  const yearTo = parseInteger(searchParams.get("yearTo"), "yearTo", 1, 9999);

  const response =
    limit.response ??
    offset.response ??
    platformId.response ??
    yearFrom.response ??
    yearTo.response;

  if (response) {
    return { response };
  }

  if (
    yearFrom.value !== undefined &&
    yearTo.value !== undefined &&
    yearFrom.value > yearTo.value
  ) {
    return {
      response: invalidRequest(
        "yearFrom must be less than or equal to yearTo.",
      ),
    };
  }

  const name = searchParams.get("name")?.trim();

  return {
    filters: {
      limit: limit.value,
      name: name || undefined,
      offset: offset.value,
      platformId: platformId.value,
      yearFrom: yearFrom.value,
      yearTo: yearTo.value,
    },
  };
}

export function parseRequiredPositiveId(
  value: string,
  label: string,
): number | NextResponse {
  const parsed = parseInteger(value, label, 1);

  return parsed.response ?? parsed.value!;
}

export function invalidRequest(message: string): NextResponse {
  return NextResponse.json(
    {
      code: IGDB_ROUTE_ERROR_CODE,
      message,
    },
    { status: 400 },
  );
}

export function igdbErrorResponse(error: unknown): NextResponse {
  const normalized =
    error instanceof IgdbClientError
      ? error
      : new IgdbClientError(
          "IGDB_UNAVAILABLE",
          "The IGDB service is unavailable.",
        );

  return NextResponse.json(
    {
      code: normalized.code,
      message: normalized.message,
      requestId: crypto.randomUUID(),
    },
    { status: statusForIgdbError(normalized.code) },
  );
}

function parseInteger(
  value: string | null,
  label: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): { response?: NextResponse; value?: number } {
  if (value === null) {
    return {};
  }

  if (!/^\d+$/.test(value)) {
    return { response: invalidRequest(`${label} must be an integer.`) };
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    return { response: invalidRequest(`${label} is out of range.`) };
  }

  return { value: parsed };
}

function statusForIgdbError(code: IgdbClientError["code"]): number {
  switch (code) {
    case "IGDB_NOT_CONFIGURED":
    case "IGDB_UNAVAILABLE":
      return 503;
    case "IGDB_RATE_LIMITED":
      return 429;
    case "IGDB_AUTH_FAILED":
    case "IGDB_INVALID_RESPONSE":
      return 502;
  }
}

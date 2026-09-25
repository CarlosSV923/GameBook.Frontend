import { NextResponse } from "next/server";

import {
  getIgdbServerClient,
  igdbErrorResponse,
  parseCatalogFilters,
} from "@/server/igdb/igdb-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const parsed = parseCatalogFilters(request);

  if ("response" in parsed) {
    return parsed.response;
  }

  try {
    const page = await getIgdbServerClient().getCatalog(parsed.filters);
    return NextResponse.json(page);
  } catch (error) {
    return igdbErrorResponse(error);
  }
}

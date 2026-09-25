import { NextResponse } from "next/server";

import {
  getIgdbServerClient,
  igdbErrorResponse,
} from "@/server/igdb/igdb-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";

  try {
    const suggestions =
      await getIgdbServerClient().getPlatformSuggestions(query);
    return NextResponse.json(suggestions);
  } catch (error) {
    return igdbErrorResponse(error);
  }
}

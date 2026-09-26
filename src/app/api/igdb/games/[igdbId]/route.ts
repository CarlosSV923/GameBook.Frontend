import { NextResponse } from "next/server";

import {
  getIgdbServerClient,
  igdbErrorResponse,
  parseRequiredPositiveId,
} from "@/server/igdb/igdb-route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ igdbId: string }> },
) {
  const { igdbId: rawIgdbId } = await context.params;
  const igdbId = parseRequiredPositiveId(rawIgdbId, "igdbId");

  if (igdbId instanceof NextResponse) {
    return igdbId;
  }

  try {
    const game = await getIgdbServerClient().getGameDetail(igdbId);

    if (!game) {
      return NextResponse.json(
        { code: "IGDB_GAME_NOT_FOUND", message: "The game was not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(game);
  } catch (error) {
    return igdbErrorResponse(error);
  }
}

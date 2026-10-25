import type { AuthStatus } from "@/features/auth/ui/auth-provider";

export type FavoriteSaveState =
  "confirming" | "duplicate" | "error" | "idle" | "saved" | "saving";

type SaveAction = "activate" | "cancel" | "confirm" | "escape" | "outside";

export function nextFavoriteSaveState(
  status: AuthStatus,
  current: FavoriteSaveState,
  action: SaveAction,
): FavoriteSaveState {
  if (action === "activate") {
    if (status === "loading" || current === "saving" || current === "saved") {
      return current;
    }
    return current === "confirming" ? "idle" : "confirming";
  }
  if (action === "confirm") {
    return status === "authenticated" && current === "confirming"
      ? "saving"
      : current;
  }
  return current === "confirming" ? "idle" : current;
}

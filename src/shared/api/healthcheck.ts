import {
  ApiClientError,
  type Fetcher,
  type ApiErrorPayload,
} from "@/shared/api/http";

export const healthcheckTimeoutMs = 15_000;
export const healthcheckMaxRetries = 15;

const healthcheckHeaders = { Accept: "application/json" };

export async function waitForServiceHealth(
  fetcher: Fetcher,
  serviceUrl: string,
  signal?: AbortSignal,
): Promise<void> {
  let lastStatus = 0;

  for (let retry = 0; retry <= healthcheckMaxRetries; retry += 1) {
    if (signal?.aborted) {
      throw createAbortError();
    }

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    const abortTimeoutId = setTimeout(
      () => controller.abort(),
      healthcheckTimeoutMs,
    );
    let raceTimeoutId: ReturnType<typeof setTimeout> | undefined;

    signal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      const response = await Promise.race([
        fetcher(`${serviceUrl}/health`, {
          headers: healthcheckHeaders,
          method: "GET",
          signal: controller.signal,
        }),
        new Promise<Response>((_, reject) => {
          raceTimeoutId = setTimeout(() => {
            reject(new Error("The healthcheck request timed out."));
          }, healthcheckTimeoutMs);
        }),
      ]);

      if (response.status === 200) {
        await response.body?.cancel();
        return;
      }

      lastStatus = response.status;
      await response.body?.cancel();
    } catch (error) {
      if (signal?.aborted) {
        throw createAbortError();
      }

      lastStatus = error instanceof ApiClientError ? error.status : 0;
    } finally {
      clearTimeout(abortTimeoutId);
      if (raceTimeoutId !== undefined) {
        clearTimeout(raceTimeoutId);
      }
      signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  const payload: ApiErrorPayload = { code: "SERVICE_UNAVAILABLE" };
  throw new ApiClientError(
    503,
    payload,
    lastStatus
      ? `The service healthcheck returned HTTP ${lastStatus}.`
      : "The service healthcheck did not respond in time.",
  );
}

function createAbortError(): Error {
  const error = new Error("The request was aborted.");
  error.name = "AbortError";
  return error;
}

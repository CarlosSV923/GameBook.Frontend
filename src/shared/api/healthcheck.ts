import axios from "axios";
import { defer, firstValueFrom, of, throwError, timer } from "rxjs";
import { catchError, map, mergeMap, retry } from "rxjs/operators";

import {
  ApiClientError,
  defaultHttpClient,
  type HttpClient,
} from "@/shared/api/http";

export const healthcheckTimeoutMs = 15_000;
export const healthcheckMaxRetries = 15;

const healthcheckHeaders = { Accept: "application/json" };

export async function waitForServiceHealth(
  serviceUrl: string,
  signal?: AbortSignal,
  httpClient: HttpClient = defaultHttpClient,
): Promise<void> {
  return firstValueFrom(
    defer(() =>
      httpClient.request({
        headers: healthcheckHeaders,
        method: "GET",
        signal,
        timeout: healthcheckTimeoutMs,
        url: `${serviceUrl}/health`,
        validateStatus: () => true,
      }),
    ).pipe(
      mergeMap((response) => {
        if (response.status === 200) {
          return of(undefined);
        }

        return throwError(() => new HealthcheckError(response.status));
      }),
      retry({
        count: healthcheckMaxRetries,
        delay: (error) => {
          if (signal?.aborted || axios.isCancel(error)) {
            return throwError(() => createAbortError());
          }

          return timer(0);
        },
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        if (signal?.aborted || isAbortError(error)) {
          return throwError(() => createAbortError());
        }

        return throwError(
          () =>
            new ApiClientError(
              503,
              { code: "SERVICE_UNAVAILABLE" },
              error instanceof HealthcheckError
                ? `The service healthcheck returned HTTP ${error.status}.`
                : "The service healthcheck did not respond in time.",
            ),
        );
      }),
    ),
  );
}

class HealthcheckError extends Error {
  constructor(readonly status: number) {
    super(`Healthcheck returned HTTP ${status}.`);
    this.name = "HealthcheckError";
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function createAbortError(): Error {
  const error = new Error("The request was aborted.");
  error.name = "AbortError";
  return error;
}

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { defer, firstValueFrom, of, throwError, timer } from "rxjs";
import { catchError, map, mergeMap, retry } from "rxjs/operators";

export type HttpClient = AxiosInstance;
export type HttpRequestConfig = AxiosRequestConfig;

export type RequestJsonOptions = {
  onUnauthorized?: () => void;
  retry?: boolean;
};

const retryDelaysMs = [250, 750] as const;

export type ApiErrorDetail = {
  field: string;
  reason: string;
};

export type ApiErrorPayload = {
  code?: string;
  message?: string;
  requestId?: string;
  details?: ApiErrorDetail[];
};

export class ApiClientError extends Error {
  readonly code: string;
  readonly details: ApiErrorDetail[];
  readonly requestId?: string;
  readonly status: number;

  constructor(
    status: number,
    payload: ApiErrorPayload = {},
    message = payload.message ?? "The API request failed.",
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = payload.code ?? "API_REQUEST_FAILED";
    this.details = payload.details ?? [];
    this.requestId = payload.requestId;
    this.status = status;
  }
}

export function createHttpClient(): HttpClient {
  return axios.create();
}

export const defaultHttpClient = createHttpClient();

export async function requestJson<T>(
  httpClient: HttpClient,
  url: string,
  config: HttpRequestConfig,
  options: RequestJsonOptions = {},
): Promise<T> {
  const canRetry =
    options.retry !== false && (config.method ?? "GET").toUpperCase() === "GET";

  return firstValueFrom(
    requestResponse(httpClient, url, config, canRetry).pipe(
      map((response) => {
        const body = normalizeResponseData(response);

        if (response.status === 401) {
          options.onUnauthorized?.();
        }

        if (response.status < 200 || response.status >= 300) {
          const payload = isApiErrorPayload(body) ? body : {};
          throw new ApiClientError(response.status, payload);
        }

        if (typeof body === "string" && isJsonResponse(response)) {
          throw new ApiClientError(
            response.status,
            {},
            "The API response is invalid.",
          );
        }

        return body as T;
      }),
      catchError((error: unknown) => throwError(() => toApiClientError(error))),
    ),
  );
}

export async function requestRaw<T = unknown>(
  httpClient: HttpClient,
  url: string,
  config: HttpRequestConfig,
  canRetry = false,
): Promise<AxiosResponse<T>> {
  return firstValueFrom(requestResponse<T>(httpClient, url, config, canRetry));
}

export function requestResponse<T = unknown>(
  httpClient: HttpClient,
  url: string,
  config: HttpRequestConfig,
  canRetry = false,
) {
  return defer(() =>
    httpClient.request<T>({
      ...config,
      url,
      validateStatus: () => true,
    }),
  ).pipe(
    mergeMap((response) => {
      if (canRetry && isRetryableStatus(response.status)) {
        return throwError(() => new RetryableResponseError(response));
      }

      return of(response);
    }),
    retry({
      count: canRetry ? retryDelaysMs.length : 0,
      delay: (_error, retryIndex) => timer(retryDelaysMs[retryIndex - 1] ?? 0),
    }),
  );
}

function normalizeResponseData(response: AxiosResponse): unknown | null {
  return response.data === "" || response.data === undefined
    ? null
    : response.data;
}

function isJsonResponse(response: AxiosResponse): boolean {
  const contentType = response.headers["content-type"];
  return typeof contentType === "string" && contentType.includes("json");
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function toApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof RetryableResponseError) {
    const body = normalizeResponseData(error.response);
    return new ApiClientError(
      error.response.status,
      isApiErrorPayload(body) ? body : {},
    );
  }

  const message =
    error instanceof Error ? error.message : "The network request failed.";
  return new ApiClientError(0, { code: "NETWORK_ERROR" }, message);
}

class RetryableResponseError extends Error {
  constructor(readonly response: AxiosResponse) {
    super(`Retryable HTTP response: ${response.status}`);
    this.name = "RetryableResponseError";
  }
}

export function resolveBaseUrl(
  value: string | undefined,
  variableName: string,
) {
  const baseUrl = value?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error(`${variableName} is not configured.`);
  }

  return baseUrl;
}

export function requireBearerToken(token: string) {
  if (!token.trim()) {
    throw new ApiClientError(401, { code: "TOKEN_MISSING" });
  }

  return `Bearer ${token}`;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

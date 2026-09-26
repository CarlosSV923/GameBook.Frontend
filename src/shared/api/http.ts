export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export type RequestJsonOptions = {
  onUnauthorized?: () => void;
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

export async function readResponseBody(
  response: Response,
): Promise<unknown | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError(
      response.status,
      {},
      "The API response is invalid.",
    );
  }
}

export async function requestJson<T>(
  fetcher: Fetcher,
  url: string,
  init: RequestInit,
  options: RequestJsonOptions = {},
): Promise<T> {
  const canRetry = (init.method ?? "GET").toUpperCase() === "GET";
  const signal = init.signal ?? undefined;

  for (let attempt = 0; ; attempt += 1) {
    let response: Response;

    try {
      response = await fetcher(url, init);
    } catch (error) {
      if (canRetry && attempt < retryDelaysMs.length && !signal?.aborted) {
        await waitBeforeRetry(retryDelaysMs[attempt], signal);
        continue;
      }

      throw new ApiClientError(
        0,
        { code: "NETWORK_ERROR" },
        error instanceof Error ? error.message : "The network request failed.",
      );
    }

    if (
      canRetry &&
      isRetryableStatus(response.status) &&
      attempt < retryDelaysMs.length
    ) {
      await response.body?.cancel();
      await waitBeforeRetry(retryDelaysMs[attempt], signal);
      continue;
    }

    const body = await readResponseBody(response);

    if (!response.ok) {
      if (response.status === 401) {
        options.onUnauthorized?.();
      }

      const payload = isApiErrorPayload(body) ? body : {};
      throw new ApiClientError(response.status, payload);
    }

    return body as T;
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function waitBeforeRetry(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, delayMs);

    const abort = () => {
      clearTimeout(timeoutId);
      reject(createAbortError());
    };

    signal?.addEventListener("abort", abort, { once: true });
  });
}

function createAbortError(): Error {
  const error = new Error("The request was aborted.");
  error.name = "AbortError";
  return error;
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
  return typeof value === "object" && value !== null;
}

import axios, { type AxiosRequestConfig } from "axios";
import type { HttpClient } from "@/shared/api/http";
import type { ApplicationTokenProvider } from "@/shared/api/igdb";

export type MockHttpResponse = {
  body?: unknown;
  headers?: Record<string, string>;
  status?: number;
};

export type MockRequest = {
  body: string | null;
  headers: Headers;
  method: string;
  url: string;
};

export function createMockHttpClient(
  responses: readonly MockHttpResponse[] = [],
): { httpClient: HttpClient; requests: MockRequest[] } {
  const queue = [...responses];
  const requests: MockRequest[] = [];

  const httpClient = axios.create({
    adapter: async (config) => {
      const response = queue.shift() ?? {};
      const headers = new Headers();

      for (const [key, value] of Object.entries(
        config.headers?.toJSON?.() ?? config.headers ?? {},
      )) {
        if (typeof value === "string") {
          headers.set(key, value);
        }
      }

      requests.push({
        body: serializeRequestBody(config.data),
        headers,
        method: (config.method ?? "GET").toUpperCase(),
        url: config.url ?? "",
      });

      return {
        config,
        data: response.body === undefined ? null : response.body,
        headers: response.headers ?? {},
        request: undefined,
        status: response.status ?? 200,
        statusText: String(response.status ?? 200),
      };
    },
  });

  return { httpClient, requests };
}

function serializeRequestBody(body: AxiosRequestConfig["data"]): string | null {
  if (body === undefined || body === null) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  return JSON.stringify(body);
}

export function createMockTokenProvider(
  tokens: readonly string[] = ["test-application-token"],
): { calls: boolean[]; provider: ApplicationTokenProvider } {
  const calls: boolean[] = [];
  let index = 0;

  return {
    calls,
    provider: {
      async getToken(forceRefresh = false) {
        calls.push(forceRefresh);
        const token = tokens[Math.min(index, tokens.length - 1)];
        index += 1;

        if (!token) {
          throw new Error("The mock token provider has no token.");
        }

        return token;
      },
    },
  };
}

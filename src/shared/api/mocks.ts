import type { Fetcher } from "@/shared/api/http";
import type { ApplicationTokenProvider } from "@/shared/api/igdb";

export type MockFetchResponse = {
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

export function createMockFetcher(
  responses: readonly MockFetchResponse[] = [],
): { fetcher: Fetcher; requests: MockRequest[] } {
  const queue = [...responses];
  const requests: MockRequest[] = [];

  const fetcher: Fetcher = async (input, init = {}) => {
    const response = queue.shift() ?? {};
    const body =
      response.body === undefined ? null : JSON.stringify(response.body);

    requests.push({
      body: serializeRequestBody(init.body),
      headers: new Headers(init.headers),
      method: init.method ?? "GET",
      url: input,
    });

    return new Response(body, {
      headers: response.headers,
      status: response.status ?? 200,
    });
  };

  return { fetcher, requests };
}

function serializeRequestBody(
  body: BodyInit | null | undefined,
): string | null {
  if (body === undefined || body === null) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  return String(body);
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

import {
  requireBearerToken,
  requestJson,
  resolveBaseUrl,
  type Fetcher,
  type RequestJsonOptions,
} from "@/shared/api/http";
import { waitForServiceHealth } from "@/shared/api/healthcheck";
import type {
  AuthUserClient,
  ChangePasswordInput,
  LoginResponse,
  LoginUserInput,
  RegisterUserInput,
  SessionResponse,
  UserResponse,
} from "@/shared/api/auth-user";

type AuthUserClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  onUnauthorized?: RequestJsonOptions["onUnauthorized"];
};

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export function createAuthUserClient(
  options: AuthUserClientOptions = {},
): AuthUserClient {
  const fetcher = options.fetcher ?? fetch;
  const baseUrl = () =>
    resolveBaseUrl(
      options.baseUrl ?? process.env.NEXT_PUBLIC_AUTHUSER_URL,
      "NEXT_PUBLIC_AUTHUSER_URL",
    );
  const requestOptions = { ...options, retry: false };
  const waitForHealth = (serviceUrl: string) =>
    waitForServiceHealth(fetcher, serviceUrl);

  return {
    async changeMyPassword(token, input: ChangePasswordInput) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      await requestJson<null>(
        fetcher,
        `${serviceUrl}/v1/users/me/password`,
        {
          body: JSON.stringify(input),
          headers: {
            ...jsonHeaders,
            Authorization: requireBearerToken(token),
          },
          method: "PATCH",
        },
        requestOptions,
      );
    },

    async disableMyAccount(token: string) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      await requestJson<null>(
        fetcher,
        `${serviceUrl}/v1/users/me`,
        {
          headers: {
            Accept: "application/json",
            Authorization: requireBearerToken(token),
          },
          method: "DELETE",
        },
        requestOptions,
      );
    },

    async getCurrentSession(token: string) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      return requestJson<SessionResponse>(
        fetcher,
        `${serviceUrl}/v1/auth/session`,
        {
          headers: {
            Accept: "application/json",
            Authorization: requireBearerToken(token),
          },
          method: "GET",
        },
        requestOptions,
      );
    },

    async login(input: LoginUserInput) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      return requestJson<LoginResponse>(
        fetcher,
        `${serviceUrl}/v1/auth/login`,
        {
          body: JSON.stringify(input),
          headers: jsonHeaders,
          method: "POST",
        },
        requestOptions,
      );
    },

    async register(input: RegisterUserInput) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      return requestJson<UserResponse>(
        fetcher,
        `${serviceUrl}/v1/auth/register`,
        {
          body: JSON.stringify(input),
          headers: jsonHeaders,
          method: "POST",
        },
        requestOptions,
      );
    },
  };
}

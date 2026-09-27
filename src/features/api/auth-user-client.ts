import {
  requireBearerToken,
  requestJson,
  resolveBaseUrl,
  defaultHttpClient,
  type HttpClient,
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
  httpClient?: HttpClient;
  onUnauthorized?: RequestJsonOptions["onUnauthorized"];
};

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export function createAuthUserClient(
  options: AuthUserClientOptions = {},
): AuthUserClient {
  const httpClient = options.httpClient ?? defaultHttpClient;
  const baseUrl = () =>
    resolveBaseUrl(
      options.baseUrl ?? process.env.NEXT_PUBLIC_AUTHUSER_URL,
      "NEXT_PUBLIC_AUTHUSER_URL",
    );
  const requestOptions = { ...options, retry: false };
  const waitForHealth = (serviceUrl: string) =>
    waitForServiceHealth(serviceUrl, undefined, httpClient);

  return {
    async changeMyPassword(token, input: ChangePasswordInput) {
      const serviceUrl = baseUrl();
      await waitForHealth(serviceUrl);
      await requestJson<null>(
        httpClient,
        `${serviceUrl}/v1/users/me/password`,
        {
          data: input,
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
        httpClient,
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
        httpClient,
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
        httpClient,
        `${serviceUrl}/v1/auth/login`,
        {
          data: input,
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
        httpClient,
        `${serviceUrl}/v1/auth/register`,
        {
          data: input,
          headers: jsonHeaders,
          method: "POST",
        },
        requestOptions,
      );
    },
  };
}

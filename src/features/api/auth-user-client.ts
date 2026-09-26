import {
  requireBearerToken,
  requestJson,
  resolveBaseUrl,
  type Fetcher,
  type RequestJsonOptions,
} from "@/shared/api/http";
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

  return {
    async changeMyPassword(token, input: ChangePasswordInput) {
      await requestJson<null>(
        fetcher,
        `${baseUrl()}/v1/users/me/password`,
        {
          body: JSON.stringify(input),
          headers: {
            ...jsonHeaders,
            Authorization: requireBearerToken(token),
          },
          method: "PATCH",
        },
        options,
      );
    },

    getCurrentSession(token: string) {
      return requestJson<SessionResponse>(
        fetcher,
        `${baseUrl()}/v1/auth/session`,
        {
          headers: {
            Accept: "application/json",
            Authorization: requireBearerToken(token),
          },
          method: "GET",
        },
        options,
      );
    },

    login(input: LoginUserInput) {
      return requestJson<LoginResponse>(
        fetcher,
        `${baseUrl()}/v1/auth/login`,
        {
          body: JSON.stringify(input),
          headers: jsonHeaders,
          method: "POST",
        },
        options,
      );
    },

    register(input: RegisterUserInput) {
      return requestJson<UserResponse>(
        fetcher,
        `${baseUrl()}/v1/auth/register`,
        {
          body: JSON.stringify(input),
          headers: jsonHeaders,
          method: "POST",
        },
        options,
      );
    },
  };
}

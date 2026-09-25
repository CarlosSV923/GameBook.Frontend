"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createAuthUserClient } from "@/features/api/auth-user-client";
import type {
  AuthUserClient,
  ChangePasswordInput,
  LoginResponse,
  LoginUserInput,
  UserIdentity,
} from "@/shared/api/auth-user";
import { ApiClientError } from "@/shared/api/http";
import {
  clearAccessToken,
  readAccessToken,
  writeAccessToken,
} from "@/shared/auth/session-storage";

export type AuthStatus = "loading" | "anonymous" | "authenticated";

export type AuthContextValue = {
  status: AuthStatus;
  user: UserIdentity | null;
  isAuthenticated: boolean;
  getAccessToken: () => string | null;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  signIn: (input: LoginUserInput) => Promise<LoginResponse>;
  signOut: () => void;
  refreshSession: () => Promise<boolean>;
};

export const sessionStatusCheckIntervalMs = 30_000;

type AuthProviderProps = {
  children: ReactNode;
  client?: AuthUserClient;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children, client }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserIdentity | null>(null);
  const userRef = useRef<UserIdentity | null>(null);

  const clearSession = useCallback(() => {
    clearAccessToken();
    userRef.current = null;
    setUser(null);
    setStatus("anonymous");
  }, []);

  const authClient = useMemo(() => client ?? createAuthUserClient(), [client]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const token = readAccessToken();

    if (!token) {
      userRef.current = null;
      setUser(null);
      setStatus("anonymous");
      return false;
    }

    try {
      const response = await authClient.getCurrentSession(token);
      userRef.current = response.user;
      setUser(response.user);
      setStatus("authenticated");
      return true;
    } catch (error) {
      if (shouldDiscardToken(error)) {
        clearSession();
        return false;
      }

      if (!userRef.current) {
        setUser(null);
        setStatus("anonymous");
      }

      return false;
    }
  }, [authClient, clearSession]);

  const signIn = useCallback(
    async (input: LoginUserInput): Promise<LoginResponse> => {
      const response = await authClient.login(input);
      writeAccessToken(response.accessToken);

      try {
        const session = await authClient.getCurrentSession(
          response.accessToken,
        );
        userRef.current = session.user;
        setUser(session.user);
        setStatus("authenticated");
        return response;
      } catch (error) {
        clearAccessToken();
        userRef.current = null;
        setUser(null);
        setStatus("anonymous");
        throw error;
      }
    },
    [authClient],
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput): Promise<void> => {
      const token = readAccessToken();

      if (!token) {
        clearSession();
        throw new ApiClientError(401, { code: "TOKEN_MISSING" });
      }

      try {
        await authClient.changeMyPassword(token, input);
        clearSession();
      } catch (error) {
        if (shouldDiscardToken(error)) {
          clearSession();
        }

        throw error;
      }
    },
    [authClient, clearSession],
  );

  const signOut = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(() => {
      if (active) {
        void refreshSession();
      }
    });

    return () => {
      active = false;
    };
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshSession();
    }, sessionStatusCheckIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [refreshSession, status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      getAccessToken: () => readAccessToken(),
      changePassword,
      isAuthenticated: status === "authenticated",
      refreshSession,
      signIn,
      signOut,
      status,
      user,
    }),
    [changePassword, refreshSession, signIn, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

function shouldDiscardToken(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return error.status === 401;
}

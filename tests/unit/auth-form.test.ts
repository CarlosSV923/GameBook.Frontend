import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AuthForm } from "@/features/auth/auth-form";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";

describe("AuthForm", () => {
  it("renders the registration fields with accessible required inputs", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PreferencesProvider,
        null,
        createElement(AuthForm, {
          mode: "register",
          onSubmit: async () => undefined,
        }),
      ),
    );

    expect(markup).toContain("Create your GameBook account.");
    expect(markup).toContain('id="register-full-name"');
    expect(markup).toContain('id="register-password-confirmation"');
    expect((markup.match(/ required/g) ?? []).length).toBe(4);
    expect(markup).toContain('type="password"');
    expect((markup.match(/auth-form__password-toggle/g) ?? []).length).toBe(2);
    expect((markup.match(/aria-label="Show password"/g) ?? []).length).toBe(2);
    expect(markup).toContain("At least 8 characters");
  });

  it("renders the login form without registration-only fields", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PreferencesProvider,
        null,
        createElement(AuthForm, {
          mode: "login",
          notice: "Your account is ready.",
          onSubmit: async () => undefined,
        }),
      ),
    );

    expect(markup).toContain("Sign in to GameBook.");
    expect(markup).toContain("Your account is ready.");
    expect(markup).toContain('id="login-email"');
    expect(markup).not.toContain('id="register-full-name"');
    expect(markup).not.toContain('id="register-password-confirmation"');
    expect((markup.match(/auth-form__password-toggle/g) ?? []).length).toBe(1);
    expect(markup).toContain('aria-label="Show password"');
  });
});

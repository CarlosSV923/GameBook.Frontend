import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PasswordChangedModal } from "@/features/auth/password-changed-modal";
import { PreferencesProvider } from "@/features/preferences/preferences-provider";

describe("PasswordChangedModal", () => {
  it("explains the successful change and next sign-in step", () => {
    const markup = renderToStaticMarkup(
      createElement(
        PreferencesProvider,
        null,
        createElement(PasswordChangedModal, { onClose: () => undefined }),
      ),
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain("Password updated");
    expect(markup).toContain("Your session will close now");
    expect(markup).toContain("Sign in again");
  });
});

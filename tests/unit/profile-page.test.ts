import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { messages } from "@/shared/i18n/messages";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/features/auth/ui/auth-provider", () => ({
  useAuth: () => ({
    changePassword: vi.fn(),
    disableAccount: vi.fn(),
    status: "authenticated",
    user: { email: "ada@example.test", fullName: "Ada Lovelace", id: "user-1" },
  }),
}));
vi.mock("@/features/preferences/ui/preferences-provider", () => ({
  usePreferences: () => ({ copy: messages.en }),
}));

import { ProfilePage } from "@/features/profile/ui/profile-page";

describe("ProfilePage", () => {
  it("renders password controls and a separate account deactivation section", () => {
    const markup = renderToStaticMarkup(createElement(ProfilePage));

    expect(markup).toContain(messages.en.auth.profile.passwordTitle);
    expect(markup).toContain(messages.en.auth.profile.currentPassword);
    expect(markup).toContain(messages.en.auth.profile.newPassword);
    expect(markup).toContain(
      messages.en.auth.profile.disableAccountDescription,
    );
    expect(markup).toContain('id="profile-current-password"');
    expect(markup).toContain('id="profile-new-password-hint"');
    expect(markup).toContain('aria-label="Show password"');
    expect(markup).toContain("bg-primary-action");
    expect(markup).toContain("Ada Lovelace");
  });
});

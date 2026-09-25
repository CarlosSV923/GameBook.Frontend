import { describe, expect, it } from "vitest";

import {
  isValidPassword,
  validateChangePasswordForm,
  validateLoginForm,
  validateRegisterForm,
} from "@/features/auth/auth-validation";

const validationMessages = {
  email: "invalid email",
  fullName: "full name required",
  password: "password rules",
  passwordConfirmation: "passwords do not match",
  required: "required",
};

describe("auth form validation", () => {
  it("enforces the agreed password policy without requiring lowercase", () => {
    expect(isValidPassword("ABCDEFG1!")).toBe(true);
    expect(isValidPassword("Abcdefg1")).toBe(false);
    expect(isValidPassword("abcdefg1!")).toBe(false);
    expect(isValidPassword("Abcdefgh!")).toBe(false);
    expect(isValidPassword("Abcdefg1")).toBe(false);
  });

  it("validates registration fields and confirmation", () => {
    expect(
      validateRegisterForm(
        {
          email: "bad-email",
          fullName: " ",
          password: "weak",
          passwordConfirmation: "different",
        },
        validationMessages,
      ),
    ).toEqual({
      email: "invalid email",
      fullName: "full name required",
      password: "password rules",
      passwordConfirmation: "passwords do not match",
    });
  });

  it("validates login email and password presence", () => {
    expect(
      validateLoginForm({ email: "", password: "" }, validationMessages),
    ).toEqual({ email: "required", password: "required" });
  });

  it("validates the current password and new password policy", () => {
    expect(
      validateChangePasswordForm(
        { currentPassword: "", newPassword: "weak" },
        { newPassword: "password rules", required: "required" },
      ),
    ).toEqual({
      currentPassword: "required",
      newPassword: "password rules",
    });
  });
});

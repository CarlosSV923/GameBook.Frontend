export type AuthField =
  "email" | "fullName" | "password" | "passwordConfirmation";

export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type RegisterFormValues = {
  email: string;
  fullName: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(
  values: RegisterFormValues,
  messages: {
    email: string;
    fullName: string;
    password: string;
    passwordConfirmation: string;
    required: string;
  },
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = messages.fullName;
  }

  if (!values.email.trim()) {
    errors.email = messages.required;
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = messages.email;
  }

  if (!isValidPassword(values.password)) {
    errors.password = messages.password;
  }

  if (
    !values.passwordConfirmation ||
    values.passwordConfirmation !== values.password
  ) {
    errors.passwordConfirmation = messages.passwordConfirmation;
  }

  return errors;
}

export function validateLoginForm(
  values: LoginFormValues,
  messages: { email: string; required: string },
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (!values.email.trim()) {
    errors.email = messages.required;
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = messages.email;
  }

  if (!values.password) {
    errors.password = messages.required;
  }

  return errors;
}

export function isValidPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

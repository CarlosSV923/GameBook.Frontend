export type UserIdentity = {
  email: string;
  fullName: string;
  id: string;
};

export type RegisterUserInput = {
  email: string;
  fullName: string;
  password: string;
  passwordConfirmation: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type UserResponse = {
  user: UserIdentity;
};

export type LoginResponse = UserResponse & {
  accessToken: string;
  expiresIn: 3600;
  tokenType: "Bearer";
};

export type SessionResponse = UserResponse;

export interface AuthUserClient {
  changeMyPassword(token: string, input: ChangePasswordInput): Promise<void>;
  getCurrentSession(token: string): Promise<SessionResponse>;
  login(input: LoginUserInput): Promise<LoginResponse>;
  register(input: RegisterUserInput): Promise<UserResponse>;
}

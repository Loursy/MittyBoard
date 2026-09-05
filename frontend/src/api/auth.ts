import { api } from "../lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<AuthResponse>("/api/auth/register", body).then((r) => r.data),

  login: (body: LoginRequest) =>
    api.post<AuthResponse>("/api/auth/login", body).then((r) => r.data),
};

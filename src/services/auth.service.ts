import { apiFetch } from "./api";

export interface LoginPayload { email: string; password: string; }
export interface LoginResponse { token: string; user: { id: number; name: string; role: string; } }

export const login = (data: LoginPayload) =>
  apiFetch<LoginResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
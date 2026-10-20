import { request } from "./client";
import { CONFIG } from "../config";
import type { AuthUser } from "../types";

export const authApi = {
  me: () => request<AuthUser>("/api/auth/me"),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
};

export const googleLoginUrl = () =>
  `${CONFIG.apiBase}/api/auth/login/google?returnUrl=${encodeURIComponent(
    window.location.pathname + window.location.search,
  )}`;

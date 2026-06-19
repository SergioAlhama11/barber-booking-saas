import { adminFetch } from "@/services/core/adminFetch";
import type { AdminMe } from "./types";

export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  await adminFetch<void>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin(): Promise<void> {
  await adminFetch<void>("/admin/auth/logout", {
    method: "POST",
  });
}

export function getAdminMe() {
  return adminFetch<AdminMe>("/admin/me");
}

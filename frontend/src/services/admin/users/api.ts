import { adminFetch } from "@/services/core/adminFetch";
import type { AdminUser, CreateAdminUserRequest } from "./types";

export function getAdminUsers() {
  return adminFetch<AdminUser[]>("/admin/users");
}

export function createAdminUser(request: CreateAdminUserRequest) {
  return adminFetch<AdminUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

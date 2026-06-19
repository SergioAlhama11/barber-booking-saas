export type AdminRole = "SUPER_ADMIN" | "OWNER" | "BARBER";

export type AdminUser = {
  id: number;
  email: string;
  role: AdminRole;
  barbershopId: number | null;
  barberId: number | null;
};

export type CreateAdminUserRequest = {
  email: string;
  password: string;
  role: AdminRole;
  barbershopId?: number | null;
  barberId?: number | null;
};

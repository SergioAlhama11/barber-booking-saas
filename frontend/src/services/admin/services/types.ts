export type AdminService = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
};

export type CreateAdminServiceRequest = {
  barbershopId?: number;
  name: string;
  durationMinutes: number;
  price: number;
};

export type UpdateAdminServiceRequest = {
  name: string;
  durationMinutes: number;
  price: number;
};

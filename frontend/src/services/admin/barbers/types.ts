export type AdminBarber = {
  id: number;
  barbershopId: number;
  name: string;
};

export type CreateAdminBarberRequest = {
  name: string;
  barbershopId?: number;
};

export type UpdateAdminBarberRequest = {
  name: string;
};

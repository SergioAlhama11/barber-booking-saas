export type AdminMe = {
  id: number;
  email: string;
  barbershopId: number;
  barberId: number | null;
  roles: string[];
};

export type AdminSession = {
  me: AdminMe | null;
};

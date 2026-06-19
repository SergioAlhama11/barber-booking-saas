export type AdminBarbershop = {
  id: number;
  name: string;
  slug: string;
};

export type CreateAdminBarbershopRequest = {
  name: string;
  ownerEmail: string;
};

export type UpdateAdminBarbershopRequest = {
  name: string;
};

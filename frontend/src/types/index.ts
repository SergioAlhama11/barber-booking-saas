export interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Barber {
  id: number;
  name: string;
}

export interface Barbershop {
  id: number;
  name: string;
  slug: string;
}

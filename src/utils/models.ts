export interface UserCredentials {
  username: string;
  password: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const SortOption = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;

export type SortOptionValue = (typeof SortOption)[keyof typeof SortOption];

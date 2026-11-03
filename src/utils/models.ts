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

export interface AuthMessages {
  mismatch: string;
  lockedOut: string;
  usernameRequired: string;
  passwordRequired: string;
  protectedPath: string;
}

export interface CheckoutMessages {
  firstNameRequired: string;
  lastNameRequired: string;
  postalCodeRequired: string;
  orderCompleteHeader: string;
  orderCompleteBodyContains: string;
  informationTitle: string;
  overviewTitle: string;
  completeTitle: string;
}

export interface UiMessages {
  auth: AuthMessages;
  checkout: CheckoutMessages;
  aboutHrefPattern: string;
}

export const SortOption = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;

export type SortOptionValue = (typeof SortOption)[keyof typeof SortOption];

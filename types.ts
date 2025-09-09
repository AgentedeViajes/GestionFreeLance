export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export interface Item {
  id: string;
  name: string;
  value: number;
  currency: Currency;
}

export interface Payment {
  id: string;
  amount: number;
  currency: Currency;
  date: string;
}

export interface Booking {
  id: string;
  reservationNumber: string;
  items: Item[];
  payments: Payment[];
  createdAt: string;
}
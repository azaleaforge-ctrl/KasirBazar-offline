export type PaymentMethod = "qris" | "cash";

export interface Product {
  id: string;
  name: string;
  price: number;
  photo?: string;
  category?: string;
  stock?: number;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  photo?: string;
  qty: number;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  photo?: string;
}

export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number;
  method: PaymentMethod;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  stock?: number;
  // Absent when the request lands on a v1 (pre-solde) canary pod, null when
  // a v2 pod served it but no value was set, a number once populated.
  solde?: number | null;
}

export interface OrderProduct {
  product_id: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface Order {
  id: string;
  user_id: string;
  products: OrderProduct[];
  total_price: number;
  status: "CREATED" | "PAID" | "FAILED";
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: "SUCCESS" | "FAILED";
  created_at: string;
}

export interface CreateOrderPayload {
  user_id: string;
  products: { product_id: string; quantity: number; unit_price?: number }[];
}

export interface CreatePaymentPayload {
  order_id: string;
  user_id: string;
  amount: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  category: string;
  description?: string;
  stock?: number;
  solde?: number;
}

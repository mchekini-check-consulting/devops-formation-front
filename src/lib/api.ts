// ─────────────────────────────────────────────────────────────
// API CONFIG — remplacer par les vraies URLs en production
// ─────────────────────────────────────────────────────────────
import type {
  Product,
  Order,
  Payment,
  CreateOrderPayload,
  CreatePaymentPayload,
  CreateProductPayload,
} from "../types/api";

import { buildUrl, doFetch } from "./http";
export { API_CONFIG } from "./config";

export class ApiError extends Error {
  status: number;
  payload: any;

  constructor(status: number, payload: any, message?: string) {
    super(message || (payload && payload.message) || `API Error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// ── Catalog Service ───────────────────────────────────────────

export const catalogService = {
  async getProducts(filters?: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    // Call the real catalog service. The backend exposes GET /products with optional query params:
    // name, category, minPrice, maxPrice
    const params = new URLSearchParams();
    if (filters?.name) params.set("name", filters.name);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.minPrice !== undefined)
      params.set("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined)
      params.set("maxPrice", String(filters.maxPrice));

    // In development use CRA dev proxy (relative paths); in production call configured API_CONFIG directly
    const url = buildUrl(
      "CATALOG",
      `${params.toString() ? `?${params.toString()}` : ""}`
    );
    try {
      const data = await doFetch(url, { method: "GET" });
      if (!Array.isArray(data))
        throw new ApiError(200, data, "Invalid payload from catalog service");
      return data as Product[];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch products from catalog service", err);
      throw err;
    }
  },
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const url = buildUrl("CATALOG");
    try {
      const data = await doFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return data as Product;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create product", err);
      throw err;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const url = buildUrl("CATALOG", `/${encodeURIComponent(id)}`);
    try {
      await doFetch(url, { method: "DELETE" });
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete product", err);
      throw err;
    }
  },
};

// ── Order Service ─────────────────────────────────────────────

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const url = buildUrl("ORDERS", "");
    try {
      const data = await doFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return data as Order;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create order", err);
      throw err;
    }
  },

  async getOrders(): Promise<Order[]> {
    const url = buildUrl("ORDERS", "");
    try {
      const data = await doFetch(url, { method: "GET" });
      return data as Order[];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch orders", err);
      throw err;
    }
  },

  async getOrder(id: string): Promise<Order> {
    const url = buildUrl("ORDERS", `/${encodeURIComponent(id)}`);
    try {
      const data = await doFetch(url, { method: "GET" });
      return data as Order;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch order", err);
      throw err;
    }
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    // In development use CRA dev proxy; in production call API_CONFIG
    const url = buildUrl("ORDERS", `/${encodeURIComponent(id)}`);
    try {
      const data = await doFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return data as Order;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to update order status", err);
      throw err;
    }
  },
};

// ── Payment Service ───────────────────────────────────────────

export const paymentService = {
  async createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    const url = buildUrl("PAYMENT", "");
    // Backend expects camelCase (orderId, userId) per docs — map payload accordingly
    const body = {
      orderId: (payload as any).order_id || (payload as any).orderId,
      userId: (payload as any).user_id || (payload as any).userId,
      amount: payload.amount,
    };

    try {
      const parsed = await doFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Normalize backend response (camelCase) to frontend shape (snake_case)
      const payment: Payment = {
        id: parsed.id,
        order_id: parsed.orderId ?? parsed.order_id,
        user_id: parsed.userId ?? parsed.user_id,
        amount: parsed.amount,
        status: parsed.status,
        created_at: parsed.createdAt ?? parsed.created_at,
      };
      return payment;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to create payment", err);
      throw err;
    }
  },

  async getPayments(): Promise<Payment[]> {
    const url = buildUrl("PAYMENT", "");
    try {
      const parsed = await doFetch(url, { method: "GET" });
      const items = Array.isArray(parsed) ? parsed : [];
      return items.map((p: any) => ({
        id: p.id,
        order_id: p.orderId ?? p.order_id,
        user_id: p.userId ?? p.user_id,
        amount: p.amount,
        status: p.status,
        created_at: p.createdAt ?? p.created_at,
      }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch payments", err);
      throw err;
    }
  },

  async getPayment(id: string): Promise<Payment> {
    const url = buildUrl("PAYMENT", `/${encodeURIComponent(id)}`);
    try {
      const p = await doFetch(url, { method: "GET" });
      return {
        id: p.id,
        order_id: p.orderId ?? p.order_id,
        user_id: p.userId ?? p.user_id,
        amount: p.amount,
        status: p.status,
        created_at: p.createdAt ?? p.created_at,
      } as Payment;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch payment", err);
      throw err;
    }
  },
};

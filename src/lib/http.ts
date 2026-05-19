import { API_CONFIG } from "./config";
import { getToken } from "../services/keycloak";

export const isDev =
  typeof window !== "undefined" && process.env.NODE_ENV === "development";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts (HTTP)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Session-scoped trace context — one correlation ID per browser tab lifetime
const _correlationId = generateUUID();

export function buildUrl(service: "CATALOG" | "ORDERS" | "PAYMENT", path = "") {
  if (isDev) {
    switch (service) {
      case "CATALOG":
        return `/api/catalog${path}`;
      case "ORDERS":
        return `/api/orders${path}`;
      case "PAYMENT":
        return `/api/payments${path}`;
    }
  }
  const base = API_CONFIG[service];
  if (!path) return base;
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export async function doFetch(url: string, opts?: RequestInit) {
  const token = await getToken();
  const traceHeaders: Record<string, string> = {
    "X-Correlation-ID": _correlationId,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(url, {
    ...opts,
    headers: { ...traceHeaders, ...(opts?.headers as Record<string, string>) },
  });
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  let parsed: any = null;
  if (text) {
    try {
      parsed = contentType.includes("application/json")
        ? JSON.parse(text)
        : text;
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    // Lazy import ApiError to avoid circular dependency at module load
    const { ApiError } = await import("./api");
    throw new ApiError(res.status, parsed);
  }
  return parsed;
}

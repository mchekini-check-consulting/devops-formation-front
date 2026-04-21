import { API_CONFIG } from "./config";

export const isDev =
  typeof window !== "undefined" && process.env.NODE_ENV === "development";

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
  const base = API_CONFIG[service].replace(/\/$/, "");
  return `${base}${path}`;
}

export async function doFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
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

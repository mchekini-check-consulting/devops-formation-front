import { API_CONFIG } from "./config";

export const isDev =
  typeof window !== "undefined" && process.env.NODE_ENV === "development";

// Session-scoped trace context — one correlation ID per browser tab lifetime
const _trace = {
  correlationId: crypto.randomUUID(),
  userId: "",
};

export function setUserId(userId: string) {
  _trace.userId = userId;
}

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
  const traceHeaders: Record<string, string> = {
    "X-Correlation-ID": _trace.correlationId,
    ...(_trace.userId ? { "X-User-ID": _trace.userId } : {}),
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

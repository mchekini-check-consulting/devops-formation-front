import { API_CONFIG } from "./config";
import { getToken, getUserId } from "../services/keycloak";

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

function generateHexId(bytes: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");
}

function buildTraceparent(traceId: string): string {
  const spanId = generateHexId(8);
  return `00-${traceId}-${spanId}-01`;
}

// Session-scoped trace context — one correlation ID per browser tab lifetime
const _correlationId = generateUUID();
// Session-scoped W3C traceId (16 bytes = 32 hex) shared by all requests in this tab
const _traceId = generateHexId(16);
// Fallback user ID for unauthenticated sessions (no JWT)
const _anonymousUserId = generateUUID();

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
  const userId = token ? getUserId() : _anonymousUserId;
  const traceHeaders: Record<string, string> = {
    "X-Correlation-ID": _correlationId,
    traceparent: buildTraceparent(_traceId),
    "X-User-ID": userId,
  };
  if (token) {
    traceHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers: { ...traceHeaders, ...(opts?.headers as Record<string, string>) },
    });
  } catch (networkErr) {
    // When APIM returns 429 on the OPTIONS preflight without CORS headers,
    // the browser blocks the request and fetch() throws a TypeError.
    // Dispatch rate-limit event so the global banner is shown.
    window.dispatchEvent(new CustomEvent("api:rate-limit"));
    const { ApiError } = await import("./api");
    throw new ApiError(429, null, "Rate limit exceeded");
  }

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
    // Also handle 429 that arrives with proper CORS headers
    if (res.status === 429) {
      window.dispatchEvent(new CustomEvent("api:rate-limit"));
    }

    // Lazy import ApiError to avoid circular dependency at module load
    const { ApiError } = await import("./api");
    throw new ApiError(res.status, parsed);
  }
  return parsed;
}

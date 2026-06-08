declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>;
  }
}

const runtimeConfig =
  typeof window !== "undefined" && (window.__APP_CONFIG__ || {});

const envOr = (key: string, fallback: string) =>
  (runtimeConfig && runtimeConfig[key]) ||
  (process.env[("REACT_APP_" + key) as keyof NodeJS.ProcessEnv] as string) ||
  fallback;

export const API_CONFIG = {
  CATALOG: envOr("CATALOG", "http://localhost:4000"),
  ORDERS: envOr("ORDERS", "http://localhost:8000"),
  PAYMENT: envOr("PAYMENT", "http://localhost:8082"),
};

export const KEYCLOAK_CONFIG = {
  URL: envOr("KEYCLOAK_URL", "http://localhost:8080"),
  REALM: envOr("KEYCLOAK_REALM", "ecommerce"),
  CLIENT_ID: envOr("KEYCLOAK_CLIENT_ID", "ecommerce-front"),
};

export function isAuthEnabled(): boolean {
  return envOr("AUTH_ENABLED", "true") !== "false";
}

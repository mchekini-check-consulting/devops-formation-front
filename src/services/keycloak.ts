import Keycloak from "keycloak-js";
import { KEYCLOAK_CONFIG } from "../lib/config";

const keycloak = new Keycloak({
  url: KEYCLOAK_CONFIG.URL,
  realm: KEYCLOAK_CONFIG.REALM,
  clientId: KEYCLOAK_CONFIG.CLIENT_ID,
});

export async function initKeycloak(): Promise<boolean> {
  const token = sessionStorage.getItem("kc_token") || undefined;
  const refreshToken = sessionStorage.getItem("kc_refreshToken") || undefined;
  const idToken = sessionStorage.getItem("kc_idToken") || undefined;

  const authenticated = await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
    token,
    refreshToken,
    idToken
  });

  if (authenticated) {
    sessionStorage.setItem("kc_token", keycloak.token!);
    sessionStorage.setItem("kc_refreshToken", keycloak.refreshToken!);
    sessionStorage.setItem("kc_idToken", keycloak.idToken!);
  }

  // Keep sessionStorage in sync when tokens are refreshed
  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).then(() => {
      sessionStorage.setItem("kc_token", keycloak.token!);
      sessionStorage.setItem("kc_refreshToken", keycloak.refreshToken!);
      sessionStorage.setItem("kc_idToken", keycloak.idToken!);
    });
  };

  return authenticated;
}

export async function getToken(): Promise<string> {
  await keycloak.updateToken(30);
  return keycloak.token!;
}

export function getUsername(): string {
  return keycloak.tokenParsed?.preferred_username ?? "";
}

export function getUserId(): string {
  return keycloak.tokenParsed?.sub ?? "";
}

export function logout(): void {
  sessionStorage.removeItem("kc_token");
  sessionStorage.removeItem("kc_refreshToken");
  sessionStorage.removeItem("kc_idToken");
  keycloak.logout({ redirectUri: window.location.origin });
}

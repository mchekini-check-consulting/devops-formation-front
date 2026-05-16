import Keycloak from "keycloak-js";
import { KEYCLOAK_CONFIG } from "../lib/config";

const keycloak = new Keycloak({
  url: KEYCLOAK_CONFIG.URL,
  realm: KEYCLOAK_CONFIG.REALM,
  clientId: KEYCLOAK_CONFIG.CLIENT_ID,
});

export async function initKeycloak(): Promise<boolean> {
  const authenticated = await keycloak.init({
    onLoad: "check-sso",
    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
    checkLoginIframe: false,
  });

  if (!authenticated) {
    await keycloak.login();
  }

  return true;
}

export async function getToken(): Promise<string> {
  await keycloak.updateToken(30);
  return keycloak.token!;
}

export function getUsername(): string {
  return keycloak.tokenParsed?.preferred_username ?? "";
}

export function logout(): void {
  keycloak.logout({ redirectUri: window.location.origin });
}

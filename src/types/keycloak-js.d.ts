declare module "keycloak-js" {
  export interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
  }

  export interface KeycloakInitOptions {
    onLoad?: "login-required" | "check-sso";
    pkceMethod?: "S256";
    checkLoginIframe?: boolean;
    silentCheckSsoRedirectUri?: string;
  }

  export interface KeycloakLogoutOptions {
    redirectUri?: string;
  }

  export interface KeycloakTokenParsed {
    preferred_username?: string;
    [key: string]: unknown;
  }

  export default class Keycloak {
    token?: string;
    tokenParsed?: KeycloakTokenParsed;
    constructor(config: KeycloakConfig);
    init(options: KeycloakInitOptions): Promise<boolean>;
    login(): Promise<void>;
    updateToken(minValidity: number): Promise<boolean>;
    logout(options?: KeycloakLogoutOptions): void;
  }
}

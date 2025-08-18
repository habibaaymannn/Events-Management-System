// src/keycloak.js
import Keycloak from "keycloak-js";
import { keycloakSettings } from "./config/keycloakConfig";

export const keycloak = new Keycloak({
  url: `${keycloakSettings.url}`,
  realm: keycloakSettings.realm,
  clientId: keycloakSettings.clientId,
});

export async function initKeycloak() {
  const authenticated = await keycloak.init({
    onLoad: keycloakSettings.onLoad, // "login-required"
    checkLoginIframe: keycloakSettings.checkLoginIframe,
    pkceMethod: keycloakSettings.pkceMethod,
  });

  if (!authenticated) {
    // If not authenticated, trigger login
    await keycloak.login();
  }

  // Expose token for your existing apiConfig.js
  window.keycloak = keycloak;

  // Optional: auto-refresh token
  setInterval(async () => {
    try {
      const refreshed = await keycloak.updateToken(60);
      if (refreshed) {
        window.keycloak = keycloak;
      }
    } catch (e) {
      // Token refresh failed -> login again
      keycloak.login();
    }
  }, 30000);
}

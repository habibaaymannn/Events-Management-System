// src/config/keycloakConfig.js

// Base URL of your Keycloak server
// Default to localhost:8080 in dev, but allow overriding via .env
const KEYCLOAK_BASE_URL =
  process.env.REACT_APP_KEYCLOAK_BASE_URL || "http://localhost:8080"; // dev default

// Realm name (must match realm.json)
const KEYCLOAK_REALM =
  process.env.REACT_APP_KEYCLOAK_REALM || "EMS-realm";

// 👇 CHANGE #1: Use the *public frontend client* instead of spring-boot-app
// The backend (Spring Boot) still uses spring-boot-app (confidential client),
// but the browser SPA should authenticate as ems-frontend (public).
const KEYCLOAK_CLIENT_ID =
  process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "ems-frontend";

// FYI: issuer-uri is normally `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`
export const keycloakSettings = {
  url: KEYCLOAK_BASE_URL, 
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
  // optional switches you can adjust:
  onLoad: "login-required", // Force login on app load
  checkLoginIframe: false,
  pkceMethod: "S256",       // Secure PKCE flow for public clients
};

// src/keycloak.js
import Keycloak from "keycloak-js";

let keycloak;

export function getKeycloak() {
  return keycloak || window.keycloak;
}

function persistTokens(kc) {
  try {
    if (kc?.token) localStorage.setItem("kc-token", kc.token);
    if (kc?.refreshToken) localStorage.setItem("kc-refresh", kc.refreshToken);
  } catch {
    if (kc?.token) sessionStorage.setItem("kc-token", kc.token);
    if (kc?.refreshToken) sessionStorage.setItem("kc-refresh", kc.refreshToken);
  }
}

export async function initKeycloak() {
  const cfg = window.__APP_CONFIG__ || {};
  keycloak = new Keycloak({
    url: cfg.KEYCLOAK_URL,
    realm: cfg.KEYCLOAK_REALM,
    clientId: cfg.KEYCLOAK_CLIENT_ID,
  });

  const ok = await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod: "S256",
    // Always come back to "/" after login so the app can route by role
    redirectUri: window.location.origin + "/",
  });

  if (!ok) throw new Error("Keycloak init returned false");

  window.keycloak = keycloak;
  persistTokens(keycloak);

  keycloak.onAuthSuccess = () => persistTokens(keycloak);
  keycloak.onAuthRefreshSuccess = () => persistTokens(keycloak);
  keycloak.onTokenExpired = () => {
    keycloak
      .updateToken(30)
      .then(() => persistTokens(keycloak))
      .catch(() => keycloak.login({ redirectUri: window.location.origin + "/" }));
  };

  // extra periodic refresh
  setInterval(() => {
    keycloak.updateToken(60)
      .then(refreshed => { if (refreshed) persistTokens(keycloak); })
      .catch(() => {});
  }, 20000);

  return keycloak;
}

export async function doLogout() {
  try {
    try {
      localStorage.removeItem("kc-token");
      localStorage.removeItem("kc-refresh");
    } catch (_) {}
    sessionStorage.removeItem("kc-token");
    sessionStorage.removeItem("kc-refresh");

    const kc = window.keycloak;
    if (kc) {
      await kc.logout({ redirectUri: window.location.origin + "/" });
    } else {
      window.location.href = "/";
    }
  } catch {
    window.location.href = "/";
  }
}

/** ---------- NEW: unified role resolver ---------- **/
function normalizeRole(r) {
  if (!r) return "";
  // lower, replace dashes/spaces with underscores
  let n = r.toLowerCase().replace(/[-\s]+/g, "_");
  // strip any leading "role_"
  n = n.replace(/^role_/, "");
  // common synonyms → canonical names used in your app
  if (n === "event_organizer") n = "organizer";
  if (n === "serviceprovider") n = "service_provider";
  if (n === "venueprovider") n = "venue_provider";
  return n;
}

export function getUserRoles() {
  const kc = window.keycloak;
  const cfg = window.__APP_CONFIG__ || {};
  const clientId = cfg.KEYCLOAK_CLIENT_ID || "ems-frontend";
  const parsed = kc?.tokenParsed || {};

  const realmRoles = Array.isArray(parsed?.realm_access?.roles)
    ? parsed.realm_access.roles
    : [];

  const clientRoles = Array.isArray(parsed?.resource_access?.[clientId]?.roles)
    ? parsed.resource_access[clientId].roles
    : [];

  const all = [...realmRoles, ...clientRoles].map(normalizeRole);
  // de-dupe
  return Array.from(new Set(all));
}

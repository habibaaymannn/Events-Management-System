// src/config/apiConfig.js
const API_BASE =
  (window.__APP_CONFIG__?.API_BASE ?? process.env.REACT_APP_API_BASE) ?? '';

export const buildApiUrl = (endpoint) => `${API_BASE}${endpoint}`;

// Only add JSON header when we actually send a body (POST/PUT/PATCH)
export const getAuthHeaders = (withJson = false) => {
  const token =
    (window.keycloak && window.keycloak.token) ||
    localStorage.getItem('kc-token') ||
    sessionStorage.getItem('kc-token');

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (withJson) headers['Content-Type'] = 'application/json';
  return headers;
};

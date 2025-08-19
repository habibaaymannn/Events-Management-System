// src/config/apiConfig.js
const runtime = window.__APP_CONFIG__ || {};
const API_BASE = runtime.API_BASE || process.env.REACT_APP_API_BASE || '/api';

export const buildApiUrl = (endpoint) => `${API_BASE}${endpoint}`;

export const getAuthHeaders = () => {
  const token =
    (window.keycloak && window.keycloak.token) ||
    localStorage.getItem('kc-token') ||
    sessionStorage.getItem('kc-token');

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

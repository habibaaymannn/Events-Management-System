// API Configuration - Easy to modify
// src/config/apiConfig.js (or wherever your BASE_URL is built)
const API_CONFIG = {
  protocol: 'http',
  host: 'localhost',
  port: 8180,          // <-- make sure this matches server.port
};
export const BASE_URL = `${API_CONFIG.protocol}://${API_CONFIG.host}:${API_CONFIG.port}`;

// Helper function to build API endpoints
export const buildApiUrl = (endpoint) => `${BASE_URL}${endpoint}`;

// Helper function to get authentication headers
export const getAuthHeaders = () => {
  let token = null;

  if (window.keycloak && window.keycloak.token) {
    token = window.keycloak.token;
  } else {
    token = localStorage.getItem('keycloak-token') || 
            sessionStorage.getItem('keycloak-token') ||
            localStorage.getItem('kc-token') ||
            sessionStorage.getItem('kc-token');
  }
  
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to get headers (no authentication) - keep for compatibility
export const getHeaders = () => ({
  "Content-Type": "application/json"
});

// Export the config for direct access if needed
export { API_CONFIG };

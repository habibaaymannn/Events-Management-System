// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const kc = window.keycloak;

  if (!kc || !kc.authenticated) {
    // not authenticated yet (shouldn't happen because we use login-required)
    return null;
  }

  const roles = kc.tokenParsed?.realm_access?.roles || [];
  const hasRole = allowedRoles.length === 0 || roles.some(r => allowedRoles.includes(r));

  return hasRole ? children : <Navigate to="/unauthorized" replace />;
}

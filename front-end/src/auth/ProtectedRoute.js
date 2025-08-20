// src/auth/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function roleHome(roles = []) {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("organizer")) return "/organizer";
  if (roles.includes("service_provider")) return "/service-provider";
  if (roles.includes("venue_provider")) return "/venue-provider";
  if (roles.includes("attendee")) return "/attendee";
  return "/unauthorized";
}

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const kc = window.keycloak;

  if (!kc || !kc.authenticated) {
    // With onLoad:"login-required" this should be rare; render nothing briefly
    return null;
  }

  const roles = kc.tokenParsed?.realm_access?.roles || [];
  const hasRole =
    allowedRoles.length === 0 || roles.some((r) => allowedRoles.includes(r));

  // If they don't have the required role, push them to *their* dashboard
  return hasRole ? children : <Navigate to={roleHome(roles)} replace />;
}

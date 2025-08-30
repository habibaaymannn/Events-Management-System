// src/auth/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRoles } from "../keycloak";

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
    // keycloak.init handles redirect to login
    return null;
  }

  const roles = getUserRoles(); // <-- unified roles (realm + client)
  const hasRole =
    allowedRoles.length === 0 || roles.some((r) => allowedRoles.includes(r));

  return hasRole ? children : <Navigate to={roleHome(roles)} replace />;
}

import React from "react";
import { doLogout } from "../../keycloak";

export default function LogoutButton({ className = "logout-btn", children = "Logout", style }) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        doLogout();
      }}
      aria-label="Logout"
    >
      {children}
    </button>
  );
}

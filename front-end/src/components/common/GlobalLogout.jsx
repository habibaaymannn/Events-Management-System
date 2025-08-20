import React from "react";
import LogoutButton from "./LogoutButton";

export default function GlobalLogout() {
  const kc = window.keycloak;
  if (!kc || !kc.authenticated) return null; // show only when logged in

  return (
    <div style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
      <LogoutButton
        className="logout-btn"
        style={{
          appearance: "none",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "#fff",
          color: "#111",
          font: "inherit",
          padding: "8px 14px",
          borderRadius: 10,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,.06)",
          zIndex: 2147483647
        }}
      >
        Logout
      </LogoutButton>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

export default function PasswordUpdated() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "60vh",
      display: "grid",
      placeItems: "center",
      padding: 24
    }}>
      <div style={{
        maxWidth: 520,
        width: "100%",
        background: "rgba(113,44,129,0.06)",
        border: "1px solid rgba(113,44,129,0.25)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)"
      }}>
        <h1 style={{ margin: 0, marginBottom: 8, color: "#712C81" }}>
          Password updated 🎉
        </h1>
        <p style={{ marginTop: 0, color: "#333" }}>
          Your password has been changed successfully. You may now sign in with your new credentials.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => navigate("/")}
            style={{ 
              background: "#712C81", color: "#fff", border: 0,
              borderRadius: 10, padding: "10px 14px", cursor: "pointer"
            }}
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ 
              background: "transparent", color: "#712C81", border: "1px solid #712C81",
              borderRadius: 10, padding: "10px 14px", cursor: "pointer"
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

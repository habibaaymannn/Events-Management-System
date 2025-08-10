import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import Analytics from "./Analytics";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-tab-content">
        <Routes>
          <Route path="/" element={<Navigate to="analytics" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="events" element={<EventMonitoring />} />
          <Route path="analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
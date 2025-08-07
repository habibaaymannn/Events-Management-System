import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import Analytics from "./Analytics";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  // Get the base path for admin
  const base = "/admin";
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <nav className="admin-tabs">
        <NavLink to={`${base}/users`} className={({ isActive }) => isActive ? "active" : ""}>User Management</NavLink>
        <div className="admin-tab-spacer" />
        <NavLink to={`${base}/events`} className={({ isActive }) => isActive ? "active" : ""}>Event Monitoring</NavLink>
        <div className="admin-tab-spacer" />
        <NavLink to={`${base}/analytics`} className={({ isActive }) => isActive ? "active" : ""}>Analytics</NavLink>
      </nav>
      <div className="admin-tab-content">
        <Routes>
          <Route path="/" element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="events" element={<EventMonitoring />} />
          <Route path="analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
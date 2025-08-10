import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ServiceOverview from "./ServiceOverview";
import MyServices from "./MyServices";
import ServiceBookings from "./ServiceBookings";
import ServiceRevenue from "./ServiceRevenue";
import "./ServiceProviderDashboard.css";

const ServiceProviderDashboard = () => {
  return (
    <div className="service-provider-dashboard">
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ServiceOverview />} />
          <Route path="services" element={<MyServices />} />
          <Route path="bookings" element={<ServiceBookings />} />
          <Route path="revenue" element={<ServiceRevenue />} />
        </Routes>
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
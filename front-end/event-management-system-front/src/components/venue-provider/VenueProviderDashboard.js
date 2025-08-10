import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VenueOverview from "./VenueOverview";
import MyVenues from "./MyVenues";
import Bookings from "./Bookings";
import Revenue from "./Revenue";
import "./VenueProviderDashboard.css";

const VenueProviderDashboard = () => {
  return (
    <div className="venue-provider-dashboard">
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<VenueOverview />} />
          <Route path="venues" element={<MyVenues />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="revenue" element={<Revenue />} />
        </Routes>
      </div>
    </div>
  );
};

export default VenueProviderDashboard;
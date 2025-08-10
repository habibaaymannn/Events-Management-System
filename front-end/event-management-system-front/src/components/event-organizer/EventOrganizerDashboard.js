import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EventOverview from "./EventOverview";
import CreateEvent from "./CreateEvent";
import MyEvents from "./MyEvents";
import BookVenues from "./BookVenues";
import BookServices from "./BookServices";
import "./EventOrganizerDashboard.css";

const EventOrganizerDashboard = () => {
  return (
    <div className="event-organizer-dashboard">
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<EventOverview />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="book-venues" element={<BookVenues />} />
          <Route path="book-services" element={<BookServices />} />
        </Routes>
      </div>
    </div>
  );
};

export default EventOrganizerDashboard;
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";

// You should fetch the venue from a global state, context, or backend.
// For demo, we'll use localStorage or mock data.
const getVenueById = (id) => {
  const venues = JSON.parse(localStorage.getItem("venues") || "[]");
  return venues.find(v => v.id === Number(id));
};

const SetAvailability = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(getVenueById(venueId));
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleAvailabilityChange = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const isAvailable = venue.availability.includes(dateStr);
    const updatedVenue = {
      ...venue,
      availability: isAvailable
        ? venue.availability.filter(d => d !== dateStr)
        : [...venue.availability, dateStr],
    };
    setVenue(updatedVenue);
    // Save to localStorage for demo
    const venues = JSON.parse(localStorage.getItem("venues") || "[]");
    const updatedVenues = venues.map(v => v.id === updatedVenue.id ? updatedVenue : v);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
  };

  return (
    <div className="admin-dashboard">
      <h2>Set Availability for: {venue.name}</h2>
      <div className="center-calendar">
      <Calendar
        value={selectedDate}
        onClickDay={handleAvailabilityChange}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          return venue.availability.includes(dateStr) ? "calendar-available" : null;
        }}
      />
      <div style={{ color: "#888", marginTop: 8 }}>
        Click a date to toggle its availability.
      </div>
      <button style={{ marginTop: 12 }} onClick={() => navigate("/")}>Back to Dashboard</button>
    </div>
    </div>
  );
};

export default SetAvailability;
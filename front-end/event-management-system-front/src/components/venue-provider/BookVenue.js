import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";

const getVenueById = (id) => {
  const venues = JSON.parse(localStorage.getItem("venues") || "[]");
  return venues.find(v => v.id === Number(id));
};

const BookVenue = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(getVenueById(venueId));
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleBookDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    if (
      venue.bookings.some(b => b.date === dateStr) ||
      !venue.availability.includes(dateStr)
    ) return;
    alert("Booking confirmed and email notification sent!");
    const updatedVenue = {
      ...venue,
      bookings: [...venue.bookings, { date: dateStr, user: "You" }]
    };
    setVenue(updatedVenue);
    // Save to localStorage for demo
    const venues = JSON.parse(localStorage.getItem("venues") || "[]");
    const updatedVenues = venues.map(v => v.id === updatedVenue.id ? updatedVenue : v);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
  };

  const handleCancelBooking = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    alert("Booking cancelled and email notification sent!");
    const updatedVenue = {
      ...venue,
      bookings: venue.bookings.filter(b => b.date !== dateStr)
    };
    setVenue(updatedVenue);
    // Save to localStorage for demo
    const venues = JSON.parse(localStorage.getItem("venues") || "[]");
    const updatedVenues = venues.map(v => v.id === updatedVenue.id ? updatedVenue : v);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
  };

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isBooked = venue.bookings.some(b => b.date === dateStr);
  const isAvailable = venue.availability.includes(dateStr);

  return (
    <div className="admin-dashboard">
      <h2>Book {venue.name}</h2>
      <div className="center-calendar">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          if (venue.bookings.some(b => b.date === dateStr)) return "calendar-booked";
          if (venue.availability.includes(dateStr)) return "calendar-available";
          return null;
        }}
      />
      <div style={{ marginTop: 16 }}>
        {isBooked ? (
          <button onClick={() => handleCancelBooking(selectedDate)}>
            Cancel Booking
          </button>
        ) : (
          <button
            onClick={() => handleBookDate(selectedDate)}
            disabled={!isAvailable}
            style={{ background: isAvailable ? "#1976d2" : "#aaa", color: "#fff", cursor: isAvailable ? "pointer" : "not-allowed" }}
          >
            Book This Date
          </button>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>All Bookings for {venue.name}:</strong>
        <ul>
          {venue.bookings.length === 0 && <li style={{ color: "#888" }}>No bookings yet.</li>}
          {venue.bookings.map(b => (
            <li key={b.date}>{b.date} - {b.user}</li>
          ))}
        </ul>
      </div>
      <button style={{ marginTop: 12 }} onClick={() => navigate("/")}>Back to Dashboard</button>
    </div>
    </div>
  );
};

export default BookVenue;
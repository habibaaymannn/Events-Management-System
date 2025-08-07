import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";

const initialVenues = [
  {
    id: 1,
    name: "Sunset Villa",
    type: "Villa",
    location: "Downtown",
    capacity_minimum: 50,
    capacity_maximum: 200,
    images: [],
    price: 500,
    priceType: "per event",
    availability: [],
    bookings: [],
  },
];

const VenueProviderDashboard = () => {
  const [venues, setVenues] = useState(initialVenues);
  const [showAdd, setShowAdd] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: "",
    type: "",
    location: "",
    capacity_minimum: "",
    capacity_maximum: "",
    images: [],
    price: "",
    priceType: "per event",
    availability: [],
    bookings: [],
  });
  const [activeVenue, setActiveVenue] = useState(null);
  const [calendarMode, setCalendarMode] = useState(null); // "availability" or "booking"
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add Venue Handler
  const handleAddVenue = (e) => {
    e.preventDefault();
    setVenues([
      ...venues,
      { ...newVenue, id: Date.now(), images: newVenue.images, availability: [], bookings: [] },
    ]);
    setNewVenue({
      name: "",
      type: "",
      location: "",
      capacity_minimum: "",
      capacity_maximum: "",
      images: [],
      price: "",
      priceType: "per event",
      availability: [],
      bookings: [],
    });
    setShowAdd(false);
  };

  // Remove Venue Handler
  const handleRemoveVenue = (id) => {
    setVenues(venues.filter((v) => v.id !== id));
    setActiveVenue(null);
    setCalendarMode(null);
  };

  // Toggle availability for a date
  const handleAvailabilityChange = (date) => {
    setVenues(venues.map(v => {
      if (v.id !== activeVenue.id) return v;
      const dateStr = date.toISOString().split("T")[0];
      const isAvailable = v.availability.includes(dateStr);
      return {
        ...v,
        availability: isAvailable
          ? v.availability.filter(d => d !== dateStr)
          : [...v.availability, dateStr],
      };
    }));
  };

  // Book a date
  const handleBookDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(venues.map(v => {
      if (v.id !== activeVenue.id) return v;
      if (
        v.bookings.some(b => b.date === dateStr) ||
        !v.availability.includes(dateStr)
      )
        return v; // already booked or not available
      alert("Booking confirmed and email notification sent!");
      return {
        ...v,
        bookings: [...v.bookings, { date: dateStr, user: "You" }]
      };
    }));
  };

  // Cancel a booking
  const handleCancelBooking = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(venues.map(v => {
      if (v.id !== activeVenue.id) return v;
      alert("Booking cancelled and email notification sent!");
      return {
        ...v,
        bookings: v.bookings.filter(b => b.date !== dateStr)
      };
    }));
  };

  // Render calendar for setting availability
  const renderAvailabilityCalendar = (venue) => (
    <div style={{ background: "#f5faff", borderRadius: 8, padding: "1rem", margin: "1rem 0" }}>
      <strong>Set Availability for: {venue.name}</strong>
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
      <button style={{ marginTop: 12 }} onClick={() => { setActiveVenue(null); setCalendarMode(null); }}>Close</button>
    </div>
  );

  // Render calendar for booking
  const renderBookingCalendar = (venue) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const isBooked = venue.bookings.some(b => b.date === dateStr);
    const isAvailable = venue.availability.includes(dateStr);

    return (
      <div style={{ background: "#f5faff", borderRadius: 8, padding: "1rem", margin: "1rem 0" }}>
        <strong>Book {venue.name}</strong>
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
        <button style={{ marginTop: 12 }} onClick={() => { setActiveVenue(null); setCalendarMode(null); }}>Close</button>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Venue Provider Dashboard</h2>
      <div className="admin-section">
        <h3>Your Venues</h3>
        <button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "Add New Venue"}
        </button>
        {showAdd && (
          <form onSubmit={handleAddVenue} style={{ marginTop: "1rem" }}>
            <div>
              <input
                required
                placeholder="Venue Name"
                value={newVenue.name}
                onChange={e => setNewVenue({ ...newVenue, name: e.target.value })}
              />
              <input
                required
                placeholder="Type (e.g. Villa, Hall)"
                value={newVenue.type}
                onChange={e => setNewVenue({ ...newVenue, type: e.target.value })}
              />
              <input
                required
                placeholder="Location"
                value={newVenue.location}
                onChange={e => setNewVenue({ ...newVenue, location: e.target.value })}
              />
              <input
                required
                type="number"
                placeholder="Min Capacity"
                value={newVenue.capacity_minimum}
                onChange={e => setNewVenue({ ...newVenue, capacity_minimum: e.target.value })}
                min={1}
              />
              <input
                required
                type="number"
                placeholder="Max Capacity"
                value={newVenue.capacity_maximum}
                onChange={e => setNewVenue({ ...newVenue, capacity_maximum: e.target.value })}
                min={1}
              />
              <input
                required
                type="number"
                placeholder="Price"
                value={newVenue.price}
                onChange={e => setNewVenue({ ...newVenue, price: e.target.value })}
                min={1}
              />
              <select
                value={newVenue.priceType}
                onChange={e => setNewVenue({ ...newVenue, priceType: e.target.value })}
              >
                <option value="per event">Per Event</option>
                <option value="per hour">Per Hour</option>
              </select>
              <input
                type="file"
                multiple
                onChange={e => setNewVenue({ ...newVenue, images: Array.from(e.target.files) })}
              />
              <div style={{ marginTop: 8 }}>
                {newVenue.images && newVenue.images.length > 0 &&
                  newVenue.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={typeof img === "string" ? img : URL.createObjectURL(img)}
                      alt="venue"
                      width={40}
                      style={{ marginRight: 4 }}
                    />
                  ))}
              </div>
            </div>
            <button type="submit" style={{ marginTop: "1rem" }}>
              Add Venue
            </button>
          </form>
        )}
        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Images</th>
              <th>Set Availability</th>
              <th>Book</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.location}</td>
                <td>
                  {v.capacity_minimum} - {v.capacity_maximum}
                </td>
                <td>
                  {v.price} ({v.priceType})
                </td>
                <td>
                  {v.images.length > 0
                    ? v.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt="venue"
                          width={30}
                          style={{ marginRight: 2 }}
                        />
                      ))
                    : "None"}
                </td>
                <td>
                  <button onClick={() => { setActiveVenue(v); setCalendarMode("availability"); }}>
                    Set Availability
                  </button>
                </td>
                <td>
                  <button onClick={() => { setActiveVenue(v); setCalendarMode("booking"); }}>
                    Book
                  </button>
                </td>
                <td>
                  <button onClick={() => handleRemoveVenue(v.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeVenue && calendarMode === "availability" && renderAvailabilityCalendar(activeVenue)}
      {activeVenue && calendarMode === "booking" && renderBookingCalendar(activeVenue)}
    </div>
  );
};

export default VenueProviderDashboard;
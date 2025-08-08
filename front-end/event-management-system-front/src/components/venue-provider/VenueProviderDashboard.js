import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";
import "./VenueTable.css";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [venues, setVenues] = useState(() => {
    const stored = localStorage.getItem("venues");
    return stored ? JSON.parse(stored) : initialVenues;
  });
  useEffect(() => {
    localStorage.setItem("venues", JSON.stringify(venues));
  }, [venues]);
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

  // Add helper function to safely get image URL
  const getImageUrl = (img) => {
    try {
      if (typeof img === "string") {
        // Handle base64 data URLs and regular URLs
        if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('blob:')) {
          return img;
        }
        return null;
      }
      if (img instanceof File || img instanceof Blob) {
        return URL.createObjectURL(img);
      }
      return null;
    } catch (error) {
      console.warn("Failed to create image URL:", error);
      return null;
    }
  };

  // Add helper function to convert File to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Add Venue Handler
  const handleAddVenue = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Converting images...", newVenue.images);
      
      // Convert File objects to base64 strings
      const imagePromises = newVenue.images.map(async (img) => {
        if (img instanceof File) {
          console.log("Converting file:", img.name);
          const base64 = await convertFileToBase64(img);
          console.log("Converted to base64, length:", base64.length);
          return base64;
        }
        return img; // If it's already a string/URL
      });
      
      const convertedImages = await Promise.all(imagePromises);
      console.log("All images converted:", convertedImages.length);
      
      const newVenueData = { 
        ...newVenue, 
        id: Date.now(), 
        images: convertedImages, 
        availability: [], 
        bookings: [] 
      };
      
      const updatedVenues = [...venues, newVenueData];
      setVenues(updatedVenues);
      
      // Also update localStorage immediately
      localStorage.setItem("venues", JSON.stringify(updatedVenues));
      console.log("Venue saved with images:", newVenueData.images.length);
      
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
      
      alert("Venue added successfully with images!");
    } catch (error) {
      console.error("Error converting images:", error);
      alert("Error processing images. Please try again.");
    }
  };

  // Remove Venue Handler
  const handleRemoveVenue = (id) => {
    setVenues(venues.filter((v) => v.id !== id));
    setActiveVenue(null);
    setCalendarMode(null);
  };

  // Toggle availability for a date
  const handleAvailabilityChange = (date) => {
    setVenues(
      venues.map((v) => {
        if (v.id !== activeVenue.id) return v;
        const dateStr = date.toISOString().split("T")[0];
        const isAvailable = v.availability.includes(dateStr);
        return {
          ...v,
          availability: isAvailable
            ? v.availability.filter((d) => d !== dateStr)
            : [...v.availability, dateStr],
        };
      })
    );
  };

  // Book a date
  const handleBookDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(
      venues.map((v) => {
        if (v.id !== activeVenue.id) return v;
        if (v.bookings.some((b) => b.date === dateStr) || !v.availability.includes(dateStr))
          return v; // already booked or not available
        alert("Booking confirmed and email notification sent!");
        return {
          ...v,
          bookings: [...v.bookings, { date: dateStr, user: "You" }],
        };
      })
    );
  };

  // Cancel a booking
  const handleCancelBooking = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(
      venues.map((v) => {
        if (v.id !== activeVenue.id) return v;
        alert("Booking cancelled and email notification sent!");
        return {
          ...v,
          bookings: v.bookings.filter((b) => b.date !== dateStr),
        };
      })
    );
  };

  // Render calendar for setting availability
  const renderAvailabilityCalendar = (venue) => (
    <div
      style={{
        background: "#f5faff",
        borderRadius: 8,
        padding: "1rem",
        margin: "1rem 0",
      }}
    >
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
      <button
        style={{ marginTop: 12 }}
        onClick={() => {
          setActiveVenue(null);
          setCalendarMode(null);
        }}
      >
        Close
      </button>
    </div>
  );

  // Render calendar for booking
  const renderBookingCalendar = (venue) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const isBooked = venue.bookings.some((b) => b.date === dateStr);
    const isAvailable = venue.availability.includes(dateStr);

    return (
      <div
        style={{
          background: "#f5faff",
          borderRadius: 8,
          padding: "1rem",
          margin: "1rem 0",
        }}
      >
        <strong>Book {venue.name}</strong>
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          tileClassName={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            if (venue.bookings.some((b) => b.date === dateStr)) return "calendar-booked";
            if (venue.availability.includes(dateStr)) return "calendar-available";
            return null;
          }}
        />
        <div style={{ marginTop: 16 }}>
          {isBooked ? (
            <button onClick={() => handleCancelBooking(selectedDate)}>Cancel Booking</button>
          ) : (
            <button
              onClick={() => handleBookDate(selectedDate)}
              disabled={!isAvailable}
              style={{
                background: isAvailable ? "#1976d2" : "#aaa",
                color: "#fff",
                cursor: isAvailable ? "pointer" : "not-allowed",
              }}
            >
              Book This Date
            </button>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <strong>All Bookings for {venue.name}:</strong>
          <ul>
            {venue.bookings.length === 0 && <li style={{ color: "#888" }}>No bookings yet.</li>}
            {venue.bookings.map((b) => (
              <li key={b.date}>{b.date} - {b.user}</li>
            ))}
          </ul>
        </div>
        <button
          style={{ marginTop: 12 }}
          onClick={() => {
            setActiveVenue(null);
            setCalendarMode(null);
          }}
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title text-center">Venue Provider Dashboard</h2>
        </div>

        <div className="mb-3">
          <h3 style={{ color: "#495057", marginBottom: "1rem" }}>Your Venues</h3>
          <button
            className={`btn ${showAdd ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setShowAdd(!showAdd)}
          >
            {showAdd ? "Cancel" : "Add New Venue"}
          </button>

          {showAdd && (
            <div className="card mt-3">
              <form onSubmit={handleAddVenue}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Venue Name</label>
                    <input
                      required
                      className="form-control"
                      placeholder="Enter venue name"
                      value={newVenue.name}
                      onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <input
                      required
                      className="form-control"
                      placeholder="e.g. Villa, Hall"
                      value={newVenue.type}
                      onChange={(e) => setNewVenue({ ...newVenue, type: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      required
                      className="form-control"
                      placeholder="Enter location"
                      value={newVenue.location}
                      onChange={(e) => setNewVenue({ ...newVenue, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min Capacity</label>
                    <input
                      required
                      type="number"
                      className="form-control"
                      placeholder="Minimum capacity"
                      value={newVenue.capacity_minimum}
                      onChange={(e) => setNewVenue({ ...newVenue, capacity_minimum: e.target.value })}
                      min={1}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Capacity</label>
                    <input
                      required
                      type="number"
                      className="form-control"
                      placeholder="Maximum capacity"
                      value={newVenue.capacity_maximum}
                      onChange={(e) => setNewVenue({ ...newVenue, capacity_maximum: e.target.value })}
                      min={1}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      required
                      type="number"
                      className="form-control"
                      placeholder="Enter price"
                      value={newVenue.price}
                      onChange={(e) => setNewVenue({ ...newVenue, price: e.target.value })}
                      min={1}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Type</label>
                    <select
                      className="form-control"
                      value={newVenue.priceType}
                      onChange={(e) => setNewVenue({ ...newVenue, priceType: e.target.value })}
                    >
                      <option value="per event">Per Event</option>
                      <option value="per hour">Per Hour</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Images</label>
                    <input
                      type="file"
                      multiple
                      className="form-control"
                      onChange={(e) => setNewVenue({ ...newVenue, images: Array.from(e.target.files) })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  {newVenue.images && newVenue.images.length > 0 ? (
                    newVenue.images.map((img, idx) => {
                      const imageUrl = getImageUrl(img);
                      return imageUrl ? (
                        <div key={idx} style={{ position: 'relative', display: 'inline-block', marginRight: 8 }}>
                          <img
                            src={imageUrl}
                            alt="venue preview"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 8,
                              border: '2px solid #e9ecef'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = newVenue.images.filter((_, i) => i !== idx);
                              setNewVenue({ ...newVenue, images: updatedImages });
                            }}
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div key={idx} style={{ 
                          display: 'inline-block', 
                          marginRight: 8,
                          padding: '10px',
                          background: '#f8f9fa',
                          borderRadius: 8,
                          border: '2px solid #dc3545',
                          color: '#dc3545',
                          fontSize: '0.8rem'
                        }}>
                          Invalid image
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                      No images selected. Choose images to preview them here.
                    </p>
                  )}
                </div>
                <button type="submit" className="btn btn-success mt-3">
                  Add Venue
                </button>
              </form>
            </div>
          )}

          <table className="table mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Set Availability</th>
                <th>Book</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr
                  key={v.id}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    if (e.target.tagName === "BUTTON") return;
                    navigate(`/venue/${v.id}/details`);
                  }}
                >
                  <td>
                    <div>
                      <strong style={{ color: "#2c3e50" }}>{v.name}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>Click to view details</div>
                    </div>
                  </td>
                  <td>{v.type}</td>
                  <td>{v.location}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>
                      {v.capacity_minimum} - {v.capacity_maximum}
                    </span>
                    <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>people</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#28a745" }}>${v.price}</div>
                    <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>({v.priceType})</div>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/venue/${v.id}/availability`);
                      }}
                    >
                      Set Availability
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-success"
                      style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/venue/${v.id}/book`);
                      }}
                    >
                      Book
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveVenue(v.id);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeVenue && calendarMode === "availability" && renderAvailabilityCalendar(activeVenue)}
      {activeVenue && calendarMode === "booking" && renderBookingCalendar(activeVenue)}
    </main>
  );
};

export default VenueProviderDashboard;
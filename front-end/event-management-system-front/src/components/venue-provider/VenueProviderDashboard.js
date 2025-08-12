import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAllVenues, createVenue, updateVenue, deleteVenue } from "../../api/venueApi";

const initialVenues = [];

const VenueProviderDashboard = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  
  // Add booking requests state
  const [bookingRequests, setBookingRequests] = useState(() => {
    const stored = localStorage.getItem("bookingRequests");
    return stored ? JSON.parse(stored) : [];
  });

  // Get venue booking requests
  const venueBookingRequests = bookingRequests.filter(req => 
    req.type === 'venue' && 
    venues.some(v => v.id.toString() === req.itemId.toString())
  );

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await getAllVenues();
      setVenues(data);
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  // Handle booking request approval/rejection
  const handleBookingRequest = (requestId, action) => {
    const updatedRequests = bookingRequests.map(req => {
      if (req.id === requestId) {
        const newStatus = action === 'approve' ? 'confirmed' : 'rejected';
        
        // If approved, add booking to venue
        if (action === 'approve') {
          const venue = venues.find(v => v.id.toString() === req.itemId.toString());
          if (venue) {
            const updatedVenues = venues.map(v => 
              v.id === venue.id 
                ? { ...v, bookings: [...(v.bookings || []), { date: req.date, user: req.organizerEmail, eventName: req.eventName }] }
                : v
            );
            setVenues(updatedVenues);
          }
        }
        
        return { ...req, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return req;
    });
    
    setBookingRequests(updatedRequests);
  };

  const [showAdd, setShowAdd] = useState(false);
  const [editVenueId, setEditVenueId] = useState(null);
  const [formVenue, setFormVenue] = useState({
    name: "",
    type: "",
    location: "",
    capacity: {
      minCapacity: "",
      maxCapacity: ""
    },
    pricing: {
      perHour: "",
      perEvent: ""
    },
    images: [],
    supportedEventTypes: [],
    availability: [],
    bookings: [],
  });
  const [calendarVenue, setCalendarVenue] = useState(null);
  const [calendarMode, setCalendarMode] = useState(null); // "availability" or "bookings"
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper: convert File to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper: get image URL
  const getImageUrl = (img) => {
    if (typeof img === "string" && (img.startsWith("data:") || img.startsWith("http"))) return img;
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };

  // Helper to format venue type for display
  const formatVenueType = (type) => {
    switch (type) {
      case "VILLA":
        return "Villa";
      case "CHALET":
        return "Chalet";
      case "SCHOOL_HALL":
        return "School Hall";
      default:
        return type;
    }
  };

  // Add or Edit Venue
  const handleVenueFormSubmit = async (e) => {
    e.preventDefault();
    const images = await Promise.all(
      formVenue.images.map(async (img) => (img instanceof File ? await convertFileToBase64(img) : img))
    );
    
    const venueData = {
      name: formVenue.name,
      type: formVenue.type,
      location: formVenue.location,
      capacity: {
        minCapacity: parseInt(formVenue.capacity.minCapacity),
        maxCapacity: parseInt(formVenue.capacity.maxCapacity)
      },
      pricing: {
        perHour: parseFloat(formVenue.pricing.perHour) || 0,
        perEvent: parseFloat(formVenue.pricing.perEvent) || 0
      },
      images,
      supportedEventTypes: formVenue.supportedEventTypes
    };

    try {
      if (editVenueId) {
        await updateVenue(editVenueId, venueData);
      } else {
        await createVenue(venueData);
      }
      setEditVenueId(null);
      setShowAdd(false);
      loadVenues();
    } catch (error) {
      console.error("Error saving venue:", error);
    }
    
    setFormVenue({
      name: "",
      type: "",
      location: "",
      capacity: {
        minCapacity: "",
        maxCapacity: ""
      },
      pricing: {
        perHour: "",
        perEvent: ""
      },
      images: [],
      supportedEventTypes: [],
      availability: [],
      bookings: [],
    });
  };

  // Remove Venue
  const handleRemoveVenue = async (id) => {
    try {
      await deleteVenue(id);
      setCalendarVenue(null);
      setCalendarMode(null);
      loadVenues();
    } catch (error) {
      // Handle error
    }
  };

  // Edit Venue
  const handleEditVenue = (venue) => {
    setEditVenueId(venue.id);
    setFormVenue({ ...venue });
    setShowAdd(true);
  };

  // Navigate to venue details
  const handleViewVenueDetails = (venueId) => {
    navigate(`/venue/${venueId}/details`);
  };

  // Set Availability
  const handleAvailabilityChange = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(prevVenues => {
      const updatedVenues = prevVenues.map((v) => {
        if (v.id !== calendarVenue.id) return v;
        const isAvailable = v.availability.includes(dateStr);
        // Remove booking if date is made unavailable
        const newBookings = isAvailable
          ? v.bookings.filter((b) => b.date !== dateStr)
          : v.bookings;
        return {
          ...v,
          availability: isAvailable
            ? v.availability.filter((d) => d !== dateStr)
            : [...v.availability, dateStr],
          bookings: newBookings,
        };
      });
      // Update calendarVenue so modal reflects changes immediately
      const updatedVenue = updatedVenues.find(v => v.id === calendarVenue.id);
      setCalendarVenue(updatedVenue);
      return updatedVenues;
    });
  };

  // Book a date (only if available)
  const handleBookDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(prevVenues => {
      const updatedVenues = prevVenues.map((v) => {
        if (v.id !== calendarVenue.id) return v;
        if (v.bookings.some((b) => b.date === dateStr) || !v.availability.includes(dateStr)) {
          alert("You can only book available dates!");
          return v;
        }
        alert("Booking confirmed and email notification sent!");
        return {
          ...v,
          bookings: [...v.bookings, { date: dateStr, user: "You" }],
        };
      });
      // Update calendarVenue so modal reflects changes immediately
      const updatedVenue = updatedVenues.find(v => v.id === calendarVenue.id);
      setCalendarVenue(updatedVenue);
      return updatedVenues;
    });
  };

  // Cancel a booking
  const handleCancelBooking = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setVenues(prevVenues => {
      const updatedVenues = prevVenues.map((v) => {
        if (v.id !== calendarVenue.id) return v;
        alert("Booking cancelled and email notification sent!");
        return {
          ...v,
          bookings: v.bookings.filter((b) => b.date !== dateStr),
        };
      });
      // Update calendarVenue so modal reflects changes immediately
      const updatedVenue = updatedVenues.find(v => v.id === calendarVenue.id);
      setCalendarVenue(updatedVenue);
      return updatedVenues;
    });
  };

  // Calendar for availability
  const renderAvailabilityCalendar = (venue) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: 24,
        margin: "24px 0",
        boxShadow: "0 2px 12px #eee",
      }}
    >
      <h3>Set Availability for: {venue.name}</h3>
      <Calendar
        value={selectedDate}
        onClickDay={handleAvailabilityChange}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          return venue.availability.includes(dateStr) ? "calendar-available" : null;
        }}
      />
      <div style={{ marginTop: 16, color: "#888" }}>
        <small>Click a date to toggle its availability. Unavailable dates will also remove any bookings for that date.</small>
      </div>
      <button
        style={{ marginTop: 16 }}
        onClick={() => {
          setCalendarVenue(null);
          setCalendarMode(null);
        }}
      >
        Close
      </button>
    </div>
  );

  // Calendar for bookings
  const renderBookingsCalendar = (venue) => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const isBooked = venue.bookings.some((b) => b.date === dateStr);
    const isAvailable = venue.availability.includes(dateStr);

    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          margin: "24px 0",
          boxShadow: "0 2px 12px #eee",
        }}
      >
        <h3>Bookings for: {venue.name}</h3>
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
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
              }}
            >
              Book This Date
            </button>
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <strong>All Bookings:</strong>
          <ul>
            {venue.bookings.length === 0 && <li style={{ color: "#888" }}>No bookings yet.</li>}
            {venue.bookings.map((b) => (
              <li key={b.date}>
                {b.date} - {b.user}
              </li>
            ))}
          </ul>
        </div>
        <button
          style={{ marginTop: 16 }}
          onClick={() => {
            setCalendarVenue(null);
            setCalendarMode(null);
          }}
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
        Venue Provider Dashboard
      </h2>

      {/* Booking Requests Section */}
      {venueBookingRequests.filter(req => req.status === 'pending').length > 0 && (
        <div className="card" style={{ marginBottom: 32, border: '2px solid #ffc107' }}>
          <h3 style={{ marginBottom: 20, color: "#f59e0b" }}>Pending Booking Requests</h3>
          <div style={{ overflowX: "auto", width: '100%' }}>
            <table className="table" style={{ minWidth: '800px', width: '100%' }}>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venueBookingRequests.filter(req => req.status === 'pending').map(req => {
                  const venue = venues.find(v => v.id.toString() === req.itemId.toString());
                  return (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>{req.eventName}</td>
                      <td>{req.organizerEmail}</td>
                      <td>{new Date(req.date).toLocaleDateString()}</td>
                      <td>{venue?.name || 'Unknown Venue'}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => handleBookingRequest(req.id, 'approve')}
                            className="btn btn-success"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleBookingRequest(req.id, 'reject')}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setShowAdd(!showAdd);
          setEditVenueId(null);
          setFormVenue({
            name: "",
            type: "",
            location: "",
            capacity: {
              minCapacity: "",
              maxCapacity: ""
            },
            pricing: {
              perHour: "",
              perEvent: ""
            },
            images: [],
            supportedEventTypes: [],
            availability: [],
            bookings: [],
          });
        }}
        className="btn btn-primary"
        style={{ marginBottom: 24 }}
      >
        {showAdd ? "Cancel" : "Add New Venue"}
      </button>

      {showAdd && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
            {editVenueId ? "Edit Venue" : "Add New Venue"}
          </h3>
          <form onSubmit={handleVenueFormSubmit}>
            <div className="form-group">
              <input
                required
                placeholder="Venue Name"
                value={formVenue.name}
                onChange={(e) => setFormVenue({ ...formVenue, name: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <select
                required
                value={formVenue.type}
                onChange={(e) => setFormVenue({ ...formVenue, type: e.target.value })}
                className="form-control"
              >
                <option value="">Select Venue Type</option>
                <option value="Villa">Villa</option>
                <option value="Chalet">Chalet</option>
                <option value="School_Hall">School Hall</option>
              </select>
            </div>
            <div className="form-group">
              <input
                required
                placeholder="Location"
                value={formVenue.location}
                onChange={(e) => setFormVenue({ ...formVenue, location: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <input
                  required
                  type="number"
                  placeholder="Min Capacity"
                  value={formVenue.capacity.minCapacity}
                  onChange={(e) => setFormVenue({ 
                    ...formVenue, 
                    capacity: { ...formVenue.capacity, minCapacity: e.target.value }
                  })}
                  min={1}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <input
                  required
                  type="number"
                  placeholder="Max Capacity"
                  value={formVenue.capacity.maxCapacity}
                  onChange={(e) => setFormVenue({ 
                    ...formVenue, 
                    capacity: { ...formVenue.capacity, maxCapacity: e.target.value }
                  })}
                  min={1}
                  className="form-control"
                />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Price Per Hour"
                  value={formVenue.pricing.perHour}
                  onChange={(e) => setFormVenue({ 
                    ...formVenue, 
                    pricing: { ...formVenue.pricing, perHour: e.target.value }
                  })}
                  min={0}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Price Per Event"
                  value={formVenue.pricing.perEvent}
                  onChange={(e) => setFormVenue({ 
                    ...formVenue, 
                    pricing: { ...formVenue.pricing, perEvent: e.target.value }
                  })}
                  min={0}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormVenue({ ...formVenue, images: Array.from(e.target.files) })}
                className="form-control"
              />
              {formVenue.images && formVenue.images.length > 0 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {formVenue.images.map((img, idx) => {
                    const imageUrl = getImageUrl(img);
                    return imageUrl ? (
                      <div key={idx} style={{ position: "relative" }}>
                        <img
                          src={imageUrl}
                          alt="venue preview"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "2px solid #e9ecef"
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = formVenue.images.filter((_, i) => i !== idx);
                            setFormVenue({ ...formVenue, images: updatedImages });
                          }}
                          style={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-success">
              {editVenueId ? "Update Venue" : "Add Venue"}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Your Venues</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1200px', width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No venues added yet. Click "Add New Venue" to get started.
                  </td>
                </tr>
              ) : (
                venues.map((v) => (
                  <tr 
                    key={v.id} 
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      // Don't navigate if clicking on buttons
                      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                        return;
                      }
                      handleViewVenueDetails(v.id);
                    }}
                  >
                    <td style={{ fontWeight: 600, color: "#2c3e50" }}>
                      {v.name}
                    </td>
                    <td>{formatVenueType(v.type)}</td>
                    <td>{v.location}</td>
                    <td>{v.capacity?.minCapacity} - {v.capacity?.maxCapacity}</td>
                    <td>
                      {v.pricing?.perHour ? `$${v.pricing.perHour}/hr` : ''}
                      {v.pricing?.perHour && v.pricing?.perEvent ? ' | ' : ''}
                      {v.pricing?.perEvent ? `$${v.pricing.perEvent}/event` : ''}
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalendarVenue(v);
                          setCalendarMode("availability");
                        }}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        Set Availability
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalendarVenue(v);
                          setCalendarMode("bookings");
                        }}
                        className="btn btn-success"
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        View Bookings
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVenue(v);
                          }}
                          className="btn btn-warning"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVenue(v.id);
                          }}
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Modals */}
      {calendarVenue && calendarMode === "availability" && (
        <div className="modal-overlay" onClick={() => { setCalendarVenue(null); setCalendarMode(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Set Availability for: {calendarVenue.name}</h4>
              <button className="modal-close" onClick={() => { setCalendarVenue(null); setCalendarMode(null); }}>
                ×
              </button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#6c757d" }}>
                Click on dates to toggle availability. Green dates are available for booking.
              </p>
            </div>
            <Calendar
              value={selectedDate}
              onClickDay={handleAvailabilityChange}
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                return calendarVenue.availability.includes(dateStr) ? "calendar-available" : null;
              }}
              style={{ margin: "0 auto" }}
            />
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <p style={{ color: "#28a745", fontWeight: "bold" }}>
                {calendarVenue.availability?.length || 0} dates available
              </p>
            </div>
          </div>
        </div>
      )}

      {calendarVenue && calendarMode === "bookings" && (
        <div className="modal-overlay" onClick={() => { setCalendarVenue(null); setCalendarMode(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Bookings for: {calendarVenue.name}</h4>
              <button className="modal-close" onClick={() => { setCalendarVenue(null); setCalendarMode(null); }}>
                ×
              </button>
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#6c757d" }}>
                Green = Available | Red = Booked | Click on available dates to book them.
              </p>
            </div>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              tileClassName={({ date }) => {
                const dateStr = date.toISOString().split("T")[0];
                if (calendarVenue.bookings.some((b) => b.date === dateStr)) return "calendar-booked";
                if (calendarVenue.availability.includes(dateStr)) return "calendar-available";
                return null;
              }}
              style={{ margin: "0 auto" }}
            />
            
            <div style={{ marginTop: 20, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <h5 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
                Selected Date: {selectedDate.toLocaleDateString()}
              </h5>
              {(() => {
                const dateStr = selectedDate.toISOString().split("T")[0];
                const isBooked = calendarVenue.bookings.some((b) => b.date === dateStr);
                const isAvailable = calendarVenue.availability.includes(dateStr);
                
                return (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {isBooked ? (
                      <>
                        <span style={{ color: "#dc3545", fontWeight: "bold" }}>Booked</span>
                        <button 
                          onClick={() => handleCancelBooking(selectedDate)}
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Cancel Booking
                        </button>
                      </>
                    ) : isAvailable ? (
                      <>
                        <span style={{ color: "#28a745", fontWeight: "bold" }}>Available</span>
                        <button
                          onClick={() => handleBookDate(selectedDate)}
                          className="btn btn-success"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Book This Date
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "#6c757d", fontWeight: "bold" }}>Not Available</span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div style={{ marginTop: 20 }}>
              <h5 style={{ color: "#2c3e50", marginBottom: 10 }}>All Bookings:</h5>
              {calendarVenue.bookings.length === 0 ? (
                <p style={{ color: "#6c757d", fontStyle: "italic" }}>No bookings yet.</p>
              ) : (
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  {calendarVenue.bookings.map((b, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      marginBottom: 4,
                      background: "white",
                      borderRadius: 6,
                      border: "1px solid #e9ecef"
                    }}>
                      <span style={{ fontWeight: "bold" }}>
                        {new Date(b.date + 'T00:00:00').toLocaleDateString()}
                      </span>
                      <span style={{ color: "#6c757d" }}>{b.user}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueProviderDashboard;
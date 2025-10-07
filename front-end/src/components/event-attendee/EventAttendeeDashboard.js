import React, { useState, useEffect } from "react";
import {getAllEvents, getEventById} from "../../api/eventApi";
import { getBookingsByAttendeeId, bookEvent, cancelEventBooking } from "../../api/bookingApi";

const formatType = (name) => {
  if (!name) return "Unknown";
  return name
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateTime = (dateString) => {
  if (!dateString) return { date: "TBD", time: "" };
  const date = new Date(dateString);
  return {
    date: date.toISOString().slice(0, 10),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
};

const EventAttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState("All");
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(null);
  const attendeeId = window.keycloak?.tokenParsed?.sub;

  useEffect(() => {
    (async () => {
      try {
        const apiEvents = await getAllEvents(0, 50);
        const mapped = apiEvents.map(ev => {
          const { date, time } = formatDateTime(ev.startTime);
          return {
            id: ev.id,
            name: ev.name,
            date: date,
            time: time,
            location: ev.venueLocation ?? "Location not set",
            price: ev.retailPrice,
            category: ev.type,
            status: ev.status,
            organizer: ev.organizerName,
          };
        });

        setEvents(mapped);
      } catch (e) {
        console.error("Failed to load events", e);
      }
    })();
  }, []);
  useEffect(() => {
    if (attendeeId && events.length > 0) {
      loadBookings(attendeeId);
    }
  }, [attendeeId, events]);

  const loadBookings = async (id) => {
    if (!id) return;
    try {
      const bookings = await getBookingsByAttendeeId(id);
      const activities = bookings
          .map(b => {
            const ev = events.find(e => e.id === b.eventId) || {};
            const { date, time } = formatDateTime(b.startTime);
            return {
              eventId: b.eventId,
              bookingId: b.id,
              name: ev.name,
              date: date,
              time: time,
              price: b.amount,
              status: b.status,
              organizer: ev.organizerName,
            };
          })
          .filter(a => a.eventId);
      setMyActivities(activities);
    } catch (e) {
      console.error("Failed to load attendee bookings", e);
    }
  };
  const handleViewDetails = async (event) => {
    const fullEvent = await getEventById(event.id);
    const { date, time } = formatDateTime(fullEvent.startTime);
    setSelectedEvent({
      ...fullEvent,
      date: date,
      time: time,
      price: fullEvent.retailPrice,
      status: fullEvent.status,
      organizer: fullEvent.organizerName,
      category: fullEvent.type,
      location: fullEvent.venueLocation ?? "Location not set"
    });
  };
  const handlePayment = async (event) => {
    try{
      const bookingData = {
        eventId: event.id,
        attendeeId: attendeeId,
        startTime: event.startTime,
        endTime: event.endTime,
        amount: event.retailPrice,
        currency: "USD",
        status: "BOOKED",
        isCaptured: false
      };
      const result = await bookEvent(bookingData);

      // If Stripe or payment gateway responds with redirect
      if (result.paymentUrl) {
        localStorage.setItem("pendingEventBooking", JSON.stringify({
          eventId: event.id,
          bookingId: result.id || result.stripePaymentId,
          bookingType: "EVENT"
        }));
        window.location.href = result.paymentUrl;
        return;
      }
      await loadBookings(attendeeId);
      alert(
          "Payment successful! Email confirmation sent. Event reminders will be sent closer to the date."
      );
    }catch (error) {
      alert("Failed to book event. Please try again.");
    }
};
  const handleCancelRegistration = async (bookingId) => {
    const ev = myActivities.find(a => a.bookingId === bookingId);
    if (!ev) return;
    const cancellationReason = prompt("Please enter cancellation reason:");
    if (cancellationReason === null) return;
    await cancelEventBooking(ev.bookingId, cancellationReason);
    await loadBookings(attendeeId);
};
  const handleRateEvent = (eventId, rating) => {
    setMyActivities(prev =>
        prev.map((e) =>
            e.id === eventId ? { ...e, rating, ratedDate: new Date().toISOString() } : e
        )
    );
    setShowRating(null);
    setRating(0);
    alert("Thank you for rating this event!");
  };

  const filteredEvents = events
      .filter((event) => {
        if (filter !== "All" && event.category !== filter) return false;
        return !(searchTerm &&
            !event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !event.location.toLowerCase().includes(searchTerm.toLowerCase()));

      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(a.date) - new Date(b.date);
        if (sortBy === "price") return a.price - b.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  const filteredMyActivities = myActivities.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    if (activityFilter === "Previous") return eventDate < today;
    if (activityFilter === "Current") {
      const daysDiff = Math.abs((eventDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff <= 1;
    }
    if (activityFilter === "Upcoming") return eventDate > today;
    return true;
  });

  return (
    <div style={{ width: "98vw", maxWidth: "98vw", margin: "10px auto", padding: "0 10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
        Event Attendee Dashboard
      </h2>

      {/* Browse Events Section */}
      <div className="card" style={{ marginBottom: 24, width: "100%", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Browse Events</h3>

        {/* Search and Filters */}
        <div className="filter-controls" style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: "250px" }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
            style={{ minWidth: "150px" }}
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ minWidth: "150px" }}
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Events Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "1.5rem",
            width: "100%",
          }}
        >
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="card"
              style={{
                border: "1px solid #e9ecef",
                borderRadius: 12,
                padding: 16,
                background: "#f9f9f9",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "1.2rem" }}>
                {event.name}
              </h4>
              <div style={{ marginBottom: 16, fontSize: "0.9rem", color: "#495057" }}>
                <p style={{ margin: "4px 0" }}>
                  <strong>Date:</strong> {event.date} at {event.time}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Location:</strong> {event.location}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Price:</strong>{" "}
                  <span style={{ color: "#28a745", fontWeight: 600 }}>${event.price}</span>
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Category:</strong> {formatType(event.category)}
                </p>
              </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(event);
                    }}
                    className="btn btn-primary"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                  >
                    View Details
                  </button>

                </div>

            </div>
          ))}
        </div>
      </div>

      {/* My Activities Section */}
      <div className="card" style={{ width: "100%", padding: "1.5rem" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
        >
          <h3 style={{ margin: 0, color: "#2c3e50" }}>My Activities</h3>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="form-control"
            style={{ maxWidth: "200px" }}
          >
            <option value="All">All Events</option>
            <option value="Previous">Previous</option>
            <option value="Current">Current</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>

        {filteredMyActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6c757d" }}>
            <p style={{ fontSize: "1.1rem", margin: 0 }}>No events found for the selected filter.</p>
            <p style={{ fontSize: "0.9rem", margin: "8px 0 0 0" }}>Browse events above to join some!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "1.5rem",
              width: "100%",
            }}
          >
            {filteredMyActivities.map((event) => {
              const eventDate = new Date(event.date);
              const today = new Date();
              const isPast = eventDate < today;

              return (
                <div
                  key={event.bookingId}
                  className="card"
                  style={{
                    border: "1px solid #e9ecef",
                    borderRadius: 12,
                    padding: 16,
                    background: isPast ? "#f8f9fa" : "#ffffff",
                    position: "relative",
                  }}
                >
                  {isPast && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        padding: "2px 8px",
                        background: "#6c757d",
                        color: "white",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                      }}
                    >
                      COMPLETED
                    </div>
                  )}
                  <h4 style={{ margin: "0 0 12px 0", color: "#2c3e50", fontSize: "1.1rem" }}>
                    {event.name}
                  </h4>
                  <div style={{ marginBottom: 16, fontSize: "0.9rem", color: "#495057" }}>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Date:</strong> {event.date} at {event.time}
                    </p>
                    <p style={{margin: "4px 0"}}>
                      <strong>Price:</strong> ${event.price}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Status:</strong> {event.status}
                    </p>
                    {event.rating && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Your Rating:</strong>
                        <span style={{ color: "#ffc107", marginLeft: 4 }}>
                          {"★".repeat(event.rating)}
                          {"☆".repeat(5 - event.rating)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                    {!isPast && event.status !== "CANCELLED" && (
                        <button
                            onClick={() => handleCancelRegistration(event.bookingId)}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                        >
                          Cancel Registration
                        </button>
                    )}
                    {isPast && !event.rating && (
                      <button
                        onClick={() => setShowRating(event.bookingId)}
                        className="btn btn-warning"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                      >
                        Rate Event
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h4>{selectedEvent.name}</h4>
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                  ×
                </button>
              </div>
              <div>
                <div>
                  <p>
                    <strong>Date:</strong> {selectedEvent.date} at {selectedEvent.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedEvent.location}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {selectedEvent.organizer}
                  </p>
                  <p>
                    <strong>Price:</strong> ${selectedEvent.price}
                  </p>
                  <p>
                    <strong>Category:</strong> {formatType(selectedEvent.category)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "4px 0", color: "#495057" }}>
                    <strong>Description:</strong> {selectedEvent.description}
                  </p>
                </div>
              </div>

              <div style={{display: "flex", gap: "16px", marginTop: 20, justifyContent: "flex-end"}}>
                <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
                  Close
                </button>

                {!myActivities.some(a => a.eventId === selectedEvent.id && a.status === "BOOKED") ? (
                    <button
                        className="btn btn-success"
                        onClick={() => handlePayment(selectedEvent)}
                    >
                      Pay Now
                    </button>
                ) : (
                    <button className="btn btn-secondary" disabled>
                      Registered
                    </button>
                )}
              </div>
            </div>
          </div>
      )}
      {/* Rating Modal */}
      {showRating && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowRating(null);
            setRating(0);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Rate This Event</h4>
              <button
                className="modal-close"
                onClick={() => {
                  setShowRating(null);
                  setRating(0);
                }}
              >
                ×
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ margin: "20px 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "2rem",
                      cursor: "pointer",
                      color: star <= rating ? "#ffc107" : "#ddd",
                      transition: "color 0.2s ease",
                    }}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRating(null);
                    setRating(0);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  disabled={rating === 0}
                  onClick={() => handleRateEvent(showRating, rating)}
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAttendeeDashboard;

import React, { useState, useEffect } from "react";
//import { getMyServices } from "../../api/serviceApi";
import { getAllEvents } from "../../api/eventApi";
import { getBookingsByAttendeeId } from "../../api/bookingApi";
import { keycloakSettings } from "../../config/keycloakConfig"; 


const initialEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    date: "2024-03-15",
    time: "09:00",
    location: "Convention Center",
    price: 150,
    organizer: "TechCorp",
    description: "Latest technology trends and innovations",
    category: "Technology",
    status: "Open",
    attendees: 200,
    maxAttendees: 500,
  },
  {
    id: 2,
    name: "Music Festival",
    date: "2024-04-20",
    time: "18:00",
    location: "Central Park",
    price: 75,
    organizer: "Music Events",
    description: "Live music from various artists",
    category: "Entertainment",
    status: "Open",
    attendees: 800,
    maxAttendees: 1000,
  },
];

const EventAttendeeDashboard = () => {
  // const [services, setServices] = useState([]);
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const svc = await getMyServices();
  //       setServices(svc);
  //     } catch (e) {
  //       // eslint-disable-next-line no-console
  //       console.error("Failed to load services", e);
  //     }
  //   })();
  // }, []);

  // const [events, setEvents] = useState(() => {
  //   const organizerEvents = localStorage.getItem("events");
  //   const storedEvents = organizerEvents ? JSON.parse(organizerEvents) : [];
  //   return [
  //     ...initialEvents,
  //     ...storedEvents.map((event) => ({
  //       ...event,
  //       price: event.retailPrice || 100,
  //       location: event.venue || "TBD",
  //       organizer: "Event Organizer",
  //       description: `Event organized with ${
  //         event.services.length > 0 ? event.services.join(", ") : "basic setup"
  //       }`,
  //       category: "General",
  //       status: "Open",
  //       attendees: 0,
  //       maxAttendees: 100,
  //     })),
  //   ];
  // });


  const [events, setEvents] = useState([]);
  // Load REAL events from the backend and replace the placeholder list
useEffect(() => {
  (async () => {
    try {
      // eventApi.getAllEvents already unwraps Spring Page -> returns an array
      const apiEvents = await getAllEvents(0, 50);

      // Normalize backend fields to what the UI expects
      const mapped = apiEvents.map(ev => {
        const start = ev.startTime ? new Date(ev.startTime) : null;
        return {
          id: ev.id,
          name: ev.name ?? ev.title ?? "Untitled Event",
          date: start ? start.toISOString().slice(0, 10) : "TBD",
          time: start ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          location: ev.location ?? ev.venue ?? "TBD",
          price: typeof ev.price === "number"  ? (ev.price > 10000 ? Math.round(ev.price / 100) : ev.price): (ev.retailPrice ?? 0),
          category: ev.type ?? ev.category ?? "General",
          attendees: ev.attendeesCount ?? ev.registeredAttendees ?? 0,
          maxAttendees: ev.capacity ?? ev.maxAttendees ?? 100,
          status: ev.status ?? "Open",
          // keep services so your existing description template won’t break
          services: Array.isArray(ev.services)
            ? ev.services.map(s => (typeof s === "string" ? s : (s?.name ?? ""))).filter(Boolean)
            : [],
        };
      });

      setEvents(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load events", e);
    }
  })();
}, []);

// Activities from backend (attendee’s own bookings)
const [myActivities, setMyActivities] = useState([]);
// Fast membership check for registered status
const [registeredIds, setRegisteredIds] = useState(new Set());

// Load attendee bookings once
useEffect(() => {
  (async () => {
    try {
      const attendeeId = keycloakSettings?.tokenParsed?.sub;
      if (!attendeeId) return;

      const bookings = await getBookingsByAttendeeId(attendeeId);

      // Event IDs you are registered for
      const regs = new Set(
        bookings
          .map(b => b.eventId ?? b.event?.id)
          .filter(Boolean)
      );
      setRegisteredIds(regs);

      // Build activity cards (shown in "My Activities")
      const activities = bookings
        .map(b => {
          const ev = b.event || {};
          const start = ev.startTime ? new Date(ev.startTime) : null;
          return {
            id: b.eventId ?? ev.id,
            name: ev.name ?? b.eventName ?? "Untitled Event",
            date: start ? start.toISOString().slice(0, 10) : "TBD",
            time: start ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            location: ev.location ?? ev.venue ?? "TBD",
            status: b.status ?? "Registered",
          };
        })
        .filter(a => a.id);
      setMyActivities(activities);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load attendee bookings", e);
    }
  })();
}, []);


  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPayment, setShowPayment] = useState(null);
  const [activityFilter, setActivityFilter] = useState("All");
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(null);

  const handleJoinEvent = (event) => {
    if (event.attendees >= event.maxAttendees) {
      alert("Event is full!");
      return;
    }
    if (registeredIds.has(event.id))  {
      alert("You are already registered for this event!");
      return;
    }
    setShowPayment(event);
  };

const handlePayment = (event) => {
  const success = Math.random() > 0.1;
  if (success) {
    // Mark as registered in-memory
    setRegisteredIds(prev => new Set(prev).add(event.id));

    // Add to My Activities
    setMyActivities(prev => ([
      ...prev,
      {
        id: event.id,
        name: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        status: "Registered",
      }
    ]));

    // Bump visible attendees counter
    setEvents(prev =>
      prev.map((e) =>
        e.id === event.id ? { ...e, attendees: (e.attendees || 0) + 1 } : e
      )
    );

    alert(
      "Payment successful! Email confirmation sent. Event reminders will be sent closer to the date."
    );
  } else {
    alert("Payment failed! Please try again. Failure notification email sent.");
  }
  setShowPayment(null);
};


const handleCancelRegistration = (eventId) => {
  const ev = myActivities.find((e) => e.id === eventId);
  if (!ev) return;

  const eventDate = new Date(ev.date);
  const today = new Date();
  const daysDifference = Math.ceil(
    (eventDate - today) / (1000 * 60 * 60 * 24)
  );
  if (daysDifference < 3) {
    if (
      !window.confirm(
        "Cancelling less than 3 days before the event may result in no refund. Continue?"
      )
    ) {
      return;
    }
  }

  // Remove from My Activities
  setMyActivities(prev => prev.filter((e) => e.id !== eventId));

  // Drop from registered set
  setRegisteredIds(prev => {
    const next = new Set(prev);
    next.delete(eventId);
    return next;
  });

  // Decrement attendees on the browse card
  setEvents(prev =>
    prev.map((e) =>
      e.id === eventId ? { ...e, attendees: Math.max(0, (e.attendees || 0) - 1) } : e
    )
  );

  alert("Registration cancelled and email confirmation sent!");
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
      if (
        searchTerm &&
        !event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
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
                  <strong>Category:</strong> {event.category}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Attendees:</strong> {event.attendees}/{event.maxAttendees}
                </p>
              </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="btn btn-primary"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                  >
                    View Details
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinEvent(event);
                    }}
                    disabled={event.attendees >= event.maxAttendees || registeredIds.has(event.id)}
                    className={`btn ${
                      event.attendees >= event.maxAttendees || registeredIds.has(event.id)
                        ? "btn-secondary"
                        : "btn-success"
                    }`}
                    style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                  >
                    {registeredIds.has(event.id)
                      ? "Registered"
                      : event.attendees >= event.maxAttendees
                      ? "Full"
                      : "Join Event"}
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
                  key={event.id}
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
                    <p style={{ margin: "4px 0" }}>
                      <strong>Location:</strong> {event.location}
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!isPast && (
                      <button
                        onClick={() => handleCancelRegistration(event.id)}
                        className="btn btn-danger"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", flex: 1 }}
                      >
                        Cancel Registration
                      </button>
                    )}
                    {isPast && !event.rating && (
                      <button
                        onClick={() => setShowRating(event.id)}
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
              <div style={{ marginBottom: "1rem" }}>
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
                  <strong>Category:</strong> {selectedEvent.category}
                </p>
                <p>
                  <strong>Attendees:</strong> {selectedEvent.attendees}/{selectedEvent.maxAttendees}
                </p>
              </div>
              <div>
                <strong>Description:</strong>
                <p style={{ marginTop: "0.5rem", color: "#495057" }}>{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Payment for {showPayment.name}</h4>
              <button className="modal-close" onClick={() => setShowPayment(null)}>
                ×
              </button>
            </div>
            <div>
              <p>
                <strong>Amount:</strong> ${showPayment.price}
              </p>
              <p>
                <strong>Event Date:</strong> {showPayment.date}
              </p>

              <div style={{ marginTop: 16, padding: 16, background: "#f0f0f0", borderRadius: 8 }}>
                <p>
                  <strong>Stripe Payment Simulation</strong>
                </p>
                <p>Card Number: 4242 4242 4242 4242</p>
                <p>Expiry: 12/25 | CVC: 123</p>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowPayment(null)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={() => handlePayment(showPayment)}>
                  Pay Now
                </button>
              </div>
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

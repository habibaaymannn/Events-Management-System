import React, { useState, useEffect, useMemo } from "react";
import { getAllEvents } from "../../api/eventApi";
import { getBookingsByAttendeeId } from "../../api/bookingApi";
import { keycloakSettings } from "../../config/keycloakConfig";

const SEGMENTS = ["Past", "Current", "Upcoming"];

const EventAttendeeDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  const [showPayment, setShowPayment] = useState(null);
  const [activeSeg, setActiveSeg] = useState("Current"); // Past | Current | Upcoming

  // --- rating state ----------------------------------------------------------
  const [showRating, setShowRating] = useState(null); // eventId currently being rated
  const [rating, setRating] = useState(0);            // temp rating while choosing
  const [hovered, setHovered] = useState(0);          // hover preview
  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ea_ratings") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("ea_ratings", JSON.stringify(ratings));
  }, [ratings]);

  const handleRateEvent = (eventId, value) => {
    setRatings((prev) => ({
      ...prev,
      [eventId]: { rating: value, ratedDate: new Date().toISOString() },
    }));
    setShowRating(null);
    setRating(0);
    alert("Thank you for rating this event!");
  };

  // --- data loading ----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const apiEvents = await getAllEvents(0, 50);
        const mapped = apiEvents.map((ev) => {
          const start = ev.startTime ? new Date(ev.startTime) : null;
          const desc =
            ev.description ??
            (Array.isArray(ev.services) && ev.services.length
              ? `Includes: ${ev.services
                  .map((s) => (typeof s === "string" ? s : s?.name ?? ""))
                  .filter(Boolean)
                  .join(", ")}`
              : "No description provided.");

          return {
            id: ev.id,
            name: ev.name ?? ev.title ?? "Untitled Event",
            date: start ? start.toISOString().slice(0, 10) : "TBD",
            time: start
              ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            startDateObj: start,
            location: ev.location ?? ev.venue ?? "TBD",
            price:
              typeof ev.price === "number"
                ? ev.price > 10000
                  ? Math.round(ev.price / 100)
                  : ev.price
                : ev.retailPrice ?? 0,
            category: ev.type ?? ev.category ?? "General",
            attendees: ev.attendeesCount ?? ev.registeredAttendees ?? 0,
            maxAttendees: ev.capacity ?? ev.maxAttendees ?? 100,
            status: ev.status ?? "Open",
            organizer: ev.organizer ?? "Event Organizer",
            description: desc,
          };
        });
        setEvents(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load events", e);
      }
    })();
  }, []);

  // Already-registered events by this attendee
  useEffect(() => {
    (async () => {
      try {
        const attendeeId = keycloakSettings?.tokenParsed?.sub;
        if (!attendeeId) return;
        const bookings = await getBookingsByAttendeeId(attendeeId);
        const regs = new Set(
          bookings.map((b) => b.eventId ?? b.event?.id).filter(Boolean)
        );
        setRegisteredIds(regs);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load attendee bookings", e);
      }
    })();
  }, []);

  // --- utilities -------------------------------------------------------------
  const isSameDay = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const segmentFor = (ev) => {
    if (!ev.startDateObj) return "Upcoming"; // unknown -> treat as future
    const today = new Date();
    const start = ev.startDateObj;
    if (isSameDay(start, today)) return "Current";
    return start < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      ? "Past"
      : "Upcoming";
  };

  // --- search / filter / sort ------------------------------------------------
  const baseFiltered = useMemo(() => {
    const arr = events
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
        if (sortBy === "date") {
          const ad = a.startDateObj ? a.startDateObj.getTime() : Infinity;
          const bd = b.startDateObj ? b.startDateObj.getTime() : Infinity;
          return ad - bd;
        }
        if (sortBy === "price") return (a.price ?? 0) - (b.price ?? 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
    return arr;
  }, [events, filter, searchTerm, sortBy]);

  // Split by segment AFTER base filters
  const segmented = useMemo(() => {
    const buckets = { Past: [], Current: [], Upcoming: [] };
    baseFiltered.forEach((ev) => buckets[segmentFor(ev)].push(ev));
    return buckets;
  }, [baseFiltered]);

  const counts = {
    Past: segmented.Past.length,
    Current: segmented.Current.length,
    Upcoming: segmented.Upcoming.length,
  };

  const activeList = segmented[activeSeg];

  // --- actions ---------------------------------------------------------------
  const handleJoinEvent = (event) => {
    if (event.attendees >= event.maxAttendees) {
      alert("Event is full!");
      return;
    }
    if (registeredIds.has(event.id)) {
      alert("You are already registered for this event!");
      return;
    }
    setShowPayment(event);
  };

  const handlePayment = (event) => {
    const success = Math.random() > 0.1;
    if (success) {
      setRegisteredIds((prev) => new Set(prev).add(event.id));
      setEvents((prev) =>
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

  const goLeft = () => {
    const idx = SEGMENTS.indexOf(activeSeg);
    setActiveSeg(SEGMENTS[(idx + SEGMENTS.length - 1) % SEGMENTS.length]);
  };
  const goRight = () => {
    const idx = SEGMENTS.indexOf(activeSeg);
    setActiveSeg(SEGMENTS[(idx + 1) % SEGMENTS.length]);
  };

  // --- star renderer ---------------------------------------------------------
  const Star = ({ filled, onClick, onEnter, onLeave }) => (
    <button
      type="button"
      aria-label={filled ? "filled star" : "empty star"}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        margin: "0 3px",
        cursor: "pointer",
        fontSize: 28,
        lineHeight: 1,
        transform: filled ? "scale(1.05)" : "scale(1.0)",
        transition: "transform 120ms ease, filter 120ms ease",
        filter: filled ? "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" : "none",
      }}
    >
      <span style={{ color: filled ? "#f5b301" : "#d3d3d3" }}>★</span>
    </button>
  );

  const StarRow = ({ value, setValue }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: 5 }, (_, i) => {
        const idx = i + 1;
        const showFill = hovered ? idx <= hovered : idx <= value;
        return (
          <Star
            key={idx}
            filled={showFill}
            onClick={() => setValue(idx)}
            onEnter={() => setHovered(idx)}
            onLeave={() => setHovered(0)}
          />
        );
      })}
    </div>
  );

  // --- UI -------------------------------------------------------------------
  return (
    <div style={{ width: "98vw", maxWidth: "98vw", margin: "10px auto", padding: "0 10px" }}>
      {/* tiny CSS helper for modal overlay if you didn't already have these classes */}
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: #fff; border-radius: 12px; padding: 18px; width: min(720px, 92vw);
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; }
        .modal-close { border: none; background: transparent; font-size: 20px; cursor: pointer; }
      `}</style>

      <h2
        style={{
          textAlign: "center",
          marginBottom: 24,
          color: "#2c3e50",
          fontSize: "2.5rem",
          fontWeight: 700,
        }}
      >
        Event Attendee Dashboard
      </h2>

      {/* Browse Events (with segment deck) */}
      <div className="card" style={{ marginBottom: 24, width: "100%", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: 10, color: "#2c3e50" }}>Browse Events</h3>

        {/* Segment deck */}
        <div style={{ position: "relative", margin: "10px 0 18px 0", height: 120 }}>
          {/* Left chevron */}
          <button
            aria-label="Previous segment"
            onClick={goLeft}
            className="btn btn-secondary"
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
            }}
          >
            ‹
          </button>

          {/* Past (left) */}
          <button
            onClick={() => setActiveSeg("Past")}
            className="card"
            style={{
              position: "absolute",
              left: "6%",
              top: 18,
              width: "30%",
              height: 84,
              borderRadius: 14,
              border: "1px solid #e9ecef",
              background:
                activeSeg === "Past" ? "#ffffff" : "linear-gradient(0deg, #f5f5f5, #fafafa)",
              transform: activeSeg === "Past" ? "scale(1.02)" : "scale(0.96) rotate(-1deg)",
              boxShadow:
                activeSeg === "Past"
                  ? "0 12px 28px rgba(0,0,0,0.15)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Past" ? 4 : 2,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#6c757d" }}>Past</div>
            <div style={{ fontSize: 12, color: "#6c757d" }}>{counts.Past} events</div>
            <div style={{ fontSize: 11, color: "#adb5bd", marginTop: 6 }}>
              Completed & archived
            </div>
          </button>

          {/* Current (center) */}
          <button
            onClick={() => setActiveSeg("Current")}
            className="card"
            style={{
              position: "absolute",
              left: "50%",
              top: 8,
              width: "36%",
              height: 100,
              borderRadius: 16,
              border: "1px solid #e9ecef",
              background:
                activeSeg === "Current"
                  ? "#ffffff"
                  : "linear-gradient(0deg, #f7f7f7, #fcfcfc)",
              transform:
                activeSeg === "Current"
                  ? "translateX(-50%) scale(1.06)"
                  : "translateX(-50%) scale(0.98)",
              boxShadow:
                activeSeg === "Current"
                  ? "0 16px 32px rgba(0,0,0,0.18)"
                  : "0 8px 18px rgba(0,0,0,0.1)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Current" ? 5 : 3,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#2c3e50" }}>Current</div>
            <div style={{ fontSize: 13, color: "#2c3e50" }}>{counts.Current} events</div>
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>
              Happening today
            </div>
          </button>

          {/* Upcoming (right) */}
          <button
            onClick={() => setActiveSeg("Upcoming")}
            className="card"
            style={{
              position: "absolute",
              right: "6%",
              top: 18,
              width: "30%",
              height: 84,
              borderRadius: 14,
              border: "1px solid #e9ecef",
              background:
                activeSeg === "Upcoming" ? "#ffffff" : "linear-gradient(0deg, #f5f5f5, #fafafa)",
              transform: activeSeg === "Upcoming" ? "scale(1.02)" : "scale(0.96) rotate(1deg)",
              boxShadow:
                activeSeg === "Upcoming"
                  ? "0 12px 28px rgba(0,0,0,0.15)"
                  : "0 6px 16px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Upcoming" ? 4 : 2,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#0d6efd" }}>Upcoming</div>
            <div style={{ fontSize: 12, color: "#0d6efd" }}>{counts.Upcoming} events</div>
            <div style={{ fontSize: 11, color: "#6ea8fe", marginTop: 6 }}>
              Registered & future
            </div>
          </button>

          {/* Right chevron */}
          <button
            aria-label="Next segment"
            onClick={goRight}
            className="btn btn-secondary"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 5,
            }}
          >
            ›
          </button>
        </div>

        {/* Search and Filters */}
        <div className="filter-controls" style={{ margin: "8px 0 20px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: 250 }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-control"
            style={{ minWidth: 150 }}
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="General">General</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ minWidth: 150 }}
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span
            className="badge"
            style={{
              background:
                activeSeg === "Past"
                  ? "#6c757d"
                  : activeSeg === "Current"
                  ? "#198754"
                  : "#0d6efd",
              color: "white",
              borderRadius: 12,
              padding: "6px 10px",
              fontWeight: 700,
            }}
          >
            {activeSeg}
          </span>
          <span style={{ color: "#6c757d", fontSize: 13 }}>
            {counts[activeSeg]} result{counts[activeSeg] === 1 ? "" : "s"}
          </span>
        </div>

        {/* Events Grid (for the active segment) */}
        {activeList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.2rem", color: "#6c757d" }}>
            <p style={{ fontSize: "1.05rem", margin: 0 }}>
              No {activeSeg.toLowerCase()} events match your filters.
            </p>
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
            {activeList.map((event) => {
              const stored = ratings[event.id];
              const canRate =
                activeSeg === "Past" && registeredIds.has(event.id);

              return (
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
                      <strong>Date:</strong> {event.date} {event.time && `at ${event.time}`}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Price:</strong>{" "}
                      <span style={{ fontWeight: 600 }}>${event.price}</span>
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Category:</strong> {event.category}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Attendees:</strong> {event.attendees}/{event.maxAttendees}
                    </p>
                  </div>

                  {/* Rating strip (Past & registered) */}
                  {canRate && (
                    <div
                      style={{
                        borderTop: "1px dashed #e0e0e0",
                        paddingTop: 12,
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {stored?.rating && showRating !== event.id ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ display: "flex" }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                style={{
                                  color: i < stored.rating ? "#f5b301" : "#d3d3d3",
                                  fontSize: 22,
                                  marginRight: 2,
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <small style={{ color: "#6c757d" }}>
                            Rated on {new Date(stored.ratedDate).toLocaleDateString()}
                          </small>
                          <button
                            className="btn btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRating(stored.rating);
                              setShowRating(event.id);
                            }}
                            style={{ padding: "4px 10px" }}
                          >
                            Edit rating
                          </button>
                        </div>
                      ) : showRating === event.id ? (
                        <div style={{ width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <StarRow value={rating} setValue={setRating} />
                            <span style={{ fontWeight: 600 }}>{rating || 0}/5</span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginTop: 10,
                              justifyContent: "flex-end",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              className="btn btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRating(null);
                                setRating(0);
                              }}
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-success"
                              disabled={rating === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateEvent(event.id, rating);
                              }}
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              Submit rating
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "#6c757d" }}>How was it?</span>
                          <button
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRating(event.id);
                              setRating(0);
                            }}
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Rate this event
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
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
                      disabled={
                        event.attendees >= event.maxAttendees || registeredIds.has(event.id)
                      }
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
                  <strong>Date:</strong> {selectedEvent.date}{" "}
                  {selectedEvent.time && `at ${selectedEvent.time}`}
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
                <p style={{ marginTop: "0.5rem", color: "#495057" }}>
                  {selectedEvent.description}
                </p>
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
    </div>
  );
};

export default EventAttendeeDashboard;

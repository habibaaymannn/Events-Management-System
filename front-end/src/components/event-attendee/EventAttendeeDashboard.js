import React, { useState, useEffect, useMemo, useRef } from "react";
import { getAllEvents, getEventById } from "../../api/eventApi";
import { getBookingsByAttendeeId, bookEvent , cancelEventBooking } from "../../api/bookingApi";

const SEGMENTS = ["Past", "Current", "Upcoming"];
export const ACTIVE_BOOKING_STATUSES = new Set(["BOOKED", "PAID", "CONFIRMED"]);
export const INACTIVE_BOOKING_STATUSES = new Set(["CANCELLED", "CANCELED", "REFUNDED"]);

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

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isPastEvent = (ev) => {
  if (!ev) return false;
  const now = new Date();

  const start = ev.startTime ? new Date(ev.startTime) : ev.startDateObj || null;
  const end = ev.endTime ? new Date(ev.endTime) : ev.endDateObj || null;

  if (end instanceof Date) return now > end;
  if (start instanceof Date) {
    if (now < start) return false;
    return !(
      now.getFullYear() === start.getFullYear() &&
      now.getMonth() === start.getMonth() &&
      now.getDate() === start.getDate()
    );
  }
  return false;
};

const segmentFor = (ev) => {
  const now = new Date();
  const start = ev.startDateObj;
  const end = ev.endDateObj;
  if (!start) return "Upcoming";

  if (end instanceof Date) {
    if (now < start) return "Upcoming";
    if (now > end) return "Past";
    return "Current";
  }

  if (now < start) return "Upcoming";
  if (isSameDay(start, now)) return "Current";
  return "Past";
};

// --- countdown helpers ---
const ms = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function formatRemaining(deltaMs) {
  if (deltaMs <= 0) return "00:00:00";
  const days = Math.floor(deltaMs / ms.d);
  const hours = Math.floor((deltaMs % ms.d) / ms.h);
  const minutes = Math.floor((deltaMs % ms.h) / ms.m);
  const seconds = Math.floor((deltaMs % ms.m) / ms.s);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function badgeColor(deltaMs) {
  if (deltaMs < ms.h) return "#dc3545";       // red < 1h
  if (deltaMs < 24 * ms.h) return "#ffc107";  // yellow 1h–24h
  return "#198754";                           // green ≥ 24h
}

const EventAttendeeDashboard = () => {
  // ---------- state ----------
  const attendeeId = window.keycloak?.tokenParsed?.sub;
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [selectedEvent, setSelectedEvent] = useState(null); // full event for modal
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSeg, setActiveSeg] = useState("Current"); // Past | Current | Upcoming (Browse)
  const [bookingMap, setBookingMap] = useState(new Map());
  const activeMeta = selectedEvent ? bookingMap.get(selectedEvent.id) : null;
  const hasActiveBooking = !!activeMeta && ACTIVE_BOOKING_STATUSES.has(activeMeta.status);
  const [showRating, setShowRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // segment dropdown for "My events"
  const [mySeg, setMySeg] = useState("Current");
  const userChangedMySeg = useRef(false);

  const [ratings, setRatings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ea_ratings") || "{}");
    } catch {
      return {};
    }
  });

  // ---------- side effects ----------
  useEffect(() => {
    localStorage.setItem("ea_ratings", JSON.stringify(ratings));
  }, [ratings]);

  // load events list (lightweight)
  useEffect(() => {
    (async () => {
      try {
        const apiEvents = await getAllEvents(0, 50);
        const mapped = apiEvents.map((ev) => {
          const start = ev.startTime ? new Date(ev.startTime) : null;
          const end   = ev.endTime   ? new Date(ev.endTime)   : null;
          const { date, time } = formatDateTime(ev.startTime);
          return {
            id: ev.id,
            name: ev.name,
            date: date,
            time: time,
            startDateObj: start,
            endDateObj: end,
            startTime: ev.startTime ?? null,
            endTime: ev.endTime ?? null,
            location: ev.venueLocation ?? "TBD",
            price: ev.retailPrice,
            category: ev.type,
            status: ev.status,
            organizer: ev.organizerName,
            description: ev.description,
          };
        });
        setEvents(mapped);
      } catch (e) {
        console.error("Failed to load events", e);
      }
    })();
  }, []);

  useEffect(() => {
    refreshRegisteredIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendeeId]);

  // load current registrations (to gate Pay button / rating)
  const refreshRegisteredIds = async () => {
    if (!attendeeId) return;
    try {
      const bookings = await getBookingsByAttendeeId(attendeeId);
      const regs = new Set();
      const map = new Map();

      bookings.forEach((b) => {
        const evId = b.eventId;
        if (!evId) return;
        const status = (b.status || "").toUpperCase();

        if (ACTIVE_BOOKING_STATUSES.has(status)) {
          regs.add(evId);
          map.set(evId, { bookingId: b.id, status });
        }
      });
      setRegisteredIds(regs);
      setBookingMap(map);
    } catch (e) {
      console.error("Failed to load attendee bookings", e);
    }
  };

  // 🔹 JUST-PAID OVERRIDE:
  // If we find a pendingEventBooking and that event is now in registeredIds,
  // switch both Browse and My events to "Current" once, then clear the flag.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pendingEventBooking");
      if (!raw) return;
      const pending = JSON.parse(raw);
      const evId = pending?.eventId;
      if (evId && registeredIds.has(evId)) {
        setActiveSeg("Current");
        setMySeg("Current");
        userChangedMySeg.current = true; // don't let auto-pick override this choice
        localStorage.removeItem("pendingEventBooking");
      }
    } catch {
      /* ignore parse errors */
    }
  }, [registeredIds]);

  // search / filter / sort for Browse
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

  // ---------- "My events" data ----------
  const myEventsAll = useMemo(
    () => events.filter((ev) => registeredIds.has(ev.id)),
    [events, registeredIds]
  );

  const mySegmented = useMemo(() => {
    const buckets = { Past: [], Current: [], Upcoming: [] };
    myEventsAll.forEach((ev) => buckets[segmentFor(ev)].push(ev));
    return buckets;
  }, [myEventsAll]);

  const myCounts = {
    Past: mySegmented.Past.length,
    Current: mySegmented.Current.length,
    Upcoming: mySegmented.Upcoming.length,
  };

  // NEW: auto-pick default "My events" segment by highest count
  useEffect(() => {
    if (userChangedMySeg.current) return; // don't override user choice
    const entries = Object.entries(myCounts); // [ ["Past", n], ["Current", n], ["Upcoming", n] ]
    const [bestSeg] =
      entries.reduce(
        (acc, cur) => (cur[1] > acc[1] ? cur : acc),
        ["Current", -1]
      );
    setMySeg(bestSeg);
  }, [myCounts.Past, myCounts.Current, myCounts.Upcoming]); // run when counts change

  const myActiveList = mySegmented[mySeg];

  // ---------- actions ----------
  const handleRateEvent = (eventId, value) => {
    setRatings((prev) => ({
      ...prev,
      [eventId]: { rating: value, ratedDate: new Date().toISOString() },
    }));
    setShowRating(null);
    setRating(0);
    alert("Thank you for rating this event!");
  };

  const handleCancelRegistration = async () => {
    if (!selectedEvent || isCancelling) return;
    const meta = bookingMap.get(selectedEvent.id);
    if (!meta?.bookingId) return;

    const reason = prompt("Please enter cancellation reason:");
    if (reason === null) return;

    setIsCancelling(true);
    try {
      await cancelEventBooking(meta.bookingId, reason);
      await refreshRegisteredIds();
      alert("Your registration was cancelled.");
      setSelectedEvent(null);
    } catch (e) {
      console.error(e);
      alert("Cancellation failed. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewDetails = async (eventLite) => {
    try {
      const full = await getEventById(eventLite.id);
      const { date, time } = formatDateTime(full.startTime);
      setSelectedEvent({
        ...eventLite,
        name: full.name,
        organizer: full.organizerName,
        location: full.venueLocation ?? "TBD",
        price: full.retailPrice,
        category: full.type,
        description: full.description,
        startTime: full.startTime ?? null,
        endTime: full.endTime ?? null,
        date: date,
        time: time,
      });
    } catch (e) {
      console.error("Failed to fetch event details", e);
      setSelectedEvent(eventLite);
    }
  };

  const handlePayment = async () => {
    if (!selectedEvent || !attendeeId || isPaying) return; // prevent double-clicks
    setIsPaying(true);

    try {
      const bookingData = {
        eventId: selectedEvent.id,
        attendeeId,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        amount: selectedEvent.price,
        currency: "USD",
        status: "BOOKED",
        isCaptured: false,
      };

      const result = await bookEvent(bookingData);

      if (result?.paymentUrl) {
        localStorage.setItem(
          "pendingEventBooking",
          JSON.stringify({
            eventId: selectedEvent.id,
            bookingId: result.id || result.stripePaymentId,
            bookingType: "EVENT",
          })
        );
        window.location.href = result.paymentUrl;
        return;
      }
      await refreshRegisteredIds();
      alert("Payment successful! Email confirmation sent. Event reminders will be sent closer to the date.");
      setSelectedEvent(null);
    } catch (error) {
      alert("Failed to book event. Please try again.");
      console.error(error);
    } finally {
      setIsPaying(false);
    }
  };

  const goLeft = () => {
    const idx = SEGMENTS.indexOf(activeSeg);
    setActiveSeg(SEGMENTS[(idx + SEGMENTS.length - 1) % SEGMENTS.length]);
  };
  const goRight = () => {
    const idx = SEGMENTS.indexOf(activeSeg);
    setActiveSeg(SEGMENTS[(idx + 1) % SEGMENTS.length]);
  };

  // ---------- stars ----------
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

  // ---------- Countdown badge (scoped ticker) ----------
  const CountdownBadge = ({ endDate }) => {
    const [delta, setDelta] = useState(() =>
      endDate instanceof Date ? endDate.getTime() - Date.now() : 0
    );

    useEffect(() => {
      if (!(endDate instanceof Date)) return;
      const t = setInterval(() => {
        setDelta(endDate.getTime() - Date.now());
      }, 1000);
      return () => clearInterval(t);
    }, [endDate]);

    if (!(endDate instanceof Date)) return null;
    const color = badgeColor(delta);

    return (
      <div
        title="Time remaining until this event ends"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: color,
          color: color === "#ffc107" ? "#111" : "#fff",
          borderRadius: 10,
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          pointerEvents: "none",
        }}
      >
        {formatRemaining(delta)}
      </div>
    );
  };

  // ---------- small reusable grid ----------
  const EventsGrid = ({ list }) => {
    return list.length === 0 ? (
      <div style={{ textAlign: "center", padding: "2.2rem", color: "#6c757d" }}>
        <p style={{ fontSize: "1.05rem", margin: 0 }}>No events match your filters.</p>
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
        {list.map((event) => {
          const stored = ratings[event.id];
          const canRate = segmentFor(event) === "Past" && registeredIds.has(event.id);

          return (
            <div
              key={event.id}
              className="card event-card"
              style={{
                position: "relative",
                border: "1px solid #e9ecef",
                borderRadius: 12,
                padding: 0,
                background: "#f9f9f9",
                cursor: "pointer",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className="event-card__inner"
                style={{
                  padding: 16,
                }}
              >
                {segmentFor(event) === "Current" && (
                  <CountdownBadge endDate={event.endDateObj} />
                )}

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
                    <strong>Category:</strong> {formatType(event.category)}
                  </p>
                </div>

                {/* rating strip */}
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
                          className="btn btn-warning"
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

                {/* actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
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
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- UI ----------
  return (
    <div style={{ width: "98vw", maxWidth: "98vw", margin: "10px auto", padding: "0 10px" }}>
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
      .processing-mask {
        position: absolute; inset: 0; background: rgba(255,255,255,0.6);
        display: flex; align-items: center; justify-content: center;
        border-radius: 12px; pointer-events: none; font-weight: 600;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Stop external keyframe animations (but keep CSS transitions alive) */
      .card.event-card, .card.event-card * { animation: none !important; }

      /* Base card shadow (steady when not hovered) */
      .card.event-card { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }

      /* Bounce/hover lift is applied to the inner wrapper so hitbox stays steady */
      .event-card__inner {
        transform: translateY(0);
        transition: transform 200ms cubic-bezier(.2,.8,.2,1), filter 200ms ease;
        will-change: transform;
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }
      .card.event-card:hover .event-card__inner {
        transform: translateY(-4px);
        filter: drop-shadow(0 8px 18px rgba(0,0,0,0.12));
      }

      @media (prefers-reduced-motion: reduce) {
        .event-card__inner { transition: none; }
        .card.event-card:hover .event-card__inner { transform: none; filter: none; }
      }
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

          {/* Past */}
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
              background: activeSeg === "Past" ? "#ffffff" : "linear-gradient(0deg, #f5f5f5, #fafafa)",
              transform: activeSeg === "Past" ? "scale(1.02)" : "scale(0.96) rotate(-1deg)",
              boxShadow: activeSeg === "Past" ? "0 12px 28px rgba(0,0,0,0.15)" : "0 6px 16px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Past" ? 4 : 2,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#6c757d" }}>Past</div>
            <div style={{ fontSize: 12, color: "#6c757d" }}>{counts.Past} events</div>
            <div style={{ fontSize: 11, color: "#adb5bd", marginTop: 6 }}>Completed & archived</div>
          </button>

          {/* Current */}
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
              background: activeSeg === "Current" ? "#ffffff" : "linear-gradient(0deg, #f7f7f7, #fcfcfc)",
              transform: activeSeg === "Current" ? "translateX(-50%) scale(1.06)" : "translateX(-50%) scale(0.98)",
              boxShadow: activeSeg === "Current" ? "0 16px 32px rgba(0,0,0,0.18)" : "0 8px 18px rgba(0,0,0,0.1)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Current" ? 5 : 3,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 800, color: "#2c3e50" }}>Current</div>
            <div style={{ fontSize: 13, color: "#2c3e50" }}>{counts.Current} events</div>
            <div style={{ fontSize: 12, color: "#6c757d", marginTop: 6 }}>Happening now</div>
          </button>

          {/* Upcoming */}
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
              background: activeSeg === "Upcoming" ? "#ffffff" : "linear-gradient(0deg, #f5f5f5, #fafafa)",
              transform: activeSeg === "Upcoming" ? "scale(1.02)" : "scale(0.96) rotate(1deg)",
              boxShadow: activeSeg === "Upcoming" ? "0 12px 28px rgba(0,0,0,0.15)" : "0 6px 16px rgba(0,0,0,0.08)",
              transition: "all 0.25s ease",
              cursor: "pointer",
              zIndex: activeSeg === "Upcoming" ? 4 : 2,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#0d6efd" }}>Upcoming</div>
            <div style={{ fontSize: 12, color: "#0d6efd" }}>{counts.Upcoming} events</div>
            <div style={{ fontSize: 11, color: "#6ea8fe", marginTop: 6 }}>Registered & future</div>
          </button>

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

        {/* Search + filters */}
        <div
          className="filter-controls"
          style={{ margin: "8px 0 20px 0", display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: 250 }}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-control" style={{ minWidth: 150 }}>
            <option value="All">All Categories</option>
            {Array.from(new Set(events.map((e) => e.category))).map((type) => (
              <option key={type} value={type}>
                {formatType(type)}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-control" style={{ minWidth: 150 }}>
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
              background: activeSeg === "Past" ? "#6c757d" : activeSeg === "Current" ? "#198754" : "#0d6efd",
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

        {/* Events Grid (current segment) */}
        <EventsGrid list={activeList} />
      </div>

      {/* NEW: My events */}
      <div className="card" style={{ marginBottom: 24, width: "100%", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: 10, color: "#2c3e50" }}>My events</h3>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <label htmlFor="my-seg" style={{ color: "#6c757d" }}>Filter:</label>
          <select
            id="my-seg"
            value={mySeg}
            onChange={(e) => { userChangedMySeg.current = true; setMySeg(e.target.value); }}
            className="form-control"
            style={{ minWidth: 180 }}
          >
            <option value="Past">Past</option>
            <option value="Current">Current</option>
            <option value="Upcoming">Upcoming</option>
          </select>

          <span style={{ color: "#6c757d", fontSize: 13, marginLeft: "auto" }}>
            {myCounts[mySeg]} result{myCounts[mySeg] === 1 ? "" : "s"}
          </span>
        </div>

        <EventsGrid list={myActiveList} />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => !(isPaying || isCancelling) && setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <div className="modal-header">
              <h4>{selectedEvent.name}</h4>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div>
              <div>
                <p>
                  <strong>Date:</strong> {selectedEvent.date} {selectedEvent.time && `at ${selectedEvent.time}`}
                </p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Organizer:</strong> {selectedEvent.organizer}</p>
                <p><strong>Price:</strong> ${selectedEvent.price}</p>
                <p><strong>Category:</strong> {formatType(selectedEvent.category)}</p>
              </div>
              <div>
                <p style={{ margin: "4px 0", color: "#495057" }}>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: 20, justifyContent: "flex-end" }}>
                {hasActiveBooking && !isPastEvent(selectedEvent) ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedEvent(null)}
                      disabled={isPaying || isCancelling}
                    >
                      Close
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancelRegistration}
                      disabled={isPaying || isCancelling}
                      aria-busy={isCancelling}
                      style={{
                        opacity: (isPaying || isCancelling) ? 0.7 : 1,
                        cursor: (isPaying || isCancelling) ? "not-allowed" : "pointer"
                      }}
                    >
                      {isCancelling ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 14, height: 14, borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.7)", borderTopColor: "transparent",
                              display: "inline-block", animation: "spin 0.9s linear infinite",
                            }}
                          />
                          Cancelling…
                        </span>
                      ) : (
                        "Cancel Registration"
                      )}
                    </button>
                  </>
                ) : hasActiveBooking ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedEvent(null)}
                      disabled={isPaying}
                    >
                      Close
                    </button>
                    <button className="btn btn-secondary" disabled>
                      Registered
                    </button>
                  </>
                ) : isPastEvent(selectedEvent) ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedEvent(null)}
                      disabled={isPaying}
                    >
                      Close
                    </button>
                    <button className="btn btn-secondary" disabled title="Event has ended">
                      Event Ended
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedEvent(null)}
                      disabled={isPaying}
                    >
                      Close
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={handlePayment}
                      disabled={isPaying}
                      aria-busy={isPaying}
                      style={{ opacity: isPaying ? 0.7 : 1, cursor: isPaying ? "not-allowed" : "pointer" }}
                    >
                      {isPaying ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 14, height: 14, borderRadius: "50%",
                              border: "2px solid rgba(255,255,255,0.7)", borderTopColor: "transparent",
                              display: "inline-block", animation: "spin 0.9s linear infinite",
                            }}
                          />
                          Processing…
                        </span>
                      ) : (
                        "Pay Now"
                      )}
                    </button>
                  </>
                )}
              </div>

              {(isPaying || isCancelling) && (
                <div className="processing-mask">
                  {isPaying ? "Processing…" : "Cancelling…"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAttendeeDashboard;

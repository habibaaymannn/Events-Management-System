import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookingsByAttendeeId } from "../../api/bookingApi";
import { getEventById } from "../../api/eventApi"; // hydrate event details when needed
import { keycloakSettings } from "../../config/keycloakConfig";

const dateSafe = (d) => (d ? new Date(d) : null);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "TBD");
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const isConfirmed = (s) =>
  ["ACCEPTED", "CONFIRMED", "APPROVED", "REGISTERED"].includes((s || "").toUpperCase());

export default function AttendeeActivities() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  // Derive attendee id: prefer Keycloak, then a localStorage fallback if you store it
  const attendeeId =
    keycloakSettings?.tokenParsed?.sub ||
    JSON.parse(localStorage.getItem("kcTokenParsed") || "{}")?.sub ||
    null;

  // Hydrate bookings with event details if missing
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!attendeeId) {
          setBookings([]);
          return;
        }

        const raw = await getBookingsByAttendeeId(attendeeId);

        // fetch any missing event objects in parallel
        const needsFetch = raw.filter((b) => !b.event && (b.eventId || b.event_id));
        const fetchedMap = new Map();
        await Promise.all(
          needsFetch.map(async (b) => {
            try {
              const id = b.eventId || b.event_id;
              if (!id || fetchedMap.has(id)) return;
              const ev = await getEventById(id);
              fetchedMap.set(id, ev);
            } catch (_e) {
              // ignore per-booking failures; we'll render partial data
            }
          })
        );

        // normalize unified shape used by UI
        const normalized = raw.map((b) => {
          const ev = b.event || fetchedMap.get(b.eventId || b.event_id) || {};
          const start = dateSafe(ev.startTime || b.startTime);
          const end = dateSafe(ev.endTime || b.endTime);
          return {
            bookingId: b.id,
            status: b.status || "PENDING",
            eventId: ev.id || b.eventId || b.event_id,
            name: ev.name || b.eventName || "Untitled Event",
            location: ev.location || ev.venue || "TBD",
            startTime: start,
            endTime: end,
          };
        });

        if (alive) setBookings(normalized);
      } catch (e) {
        console.error(e);
        if (alive) {
          setError("Failed to load your activities. Please try again.");
          setBookings([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [attendeeId]);

  // Segment into Previous / Current / Upcoming
  const now = new Date();
  const { previous, current, upcoming } = useMemo(() => {
    const prev = [];
    const cur = [];
    const up = [];

    bookings.forEach((b) => {
      const { startTime: s, endTime: e, status } = b;
      // If we have no times, don’t break—treat as upcoming when confirmed, else ignore
      if (!s && !e) {
        if (isConfirmed(status)) up.push(b);
        return;
      }
      // classify with safe guards
      if (e && e < now) {
        prev.push(b);
      } else if (s && e && s <= now && now <= e) {
        cur.push(b);
      } else if (s && s > now) {
        up.push(b);
      } else {
        // fallback: if confirmed but missing an end, treat as upcoming
        if (isConfirmed(status)) up.push(b);
      }
    });

    // sort: upcoming by soonest first; previous by newest first
    up.sort((a, b) => (a.startTime || Infinity) - (b.startTime || Infinity));
    prev.sort((a, b) => (b.endTime || -Infinity) - (a.endTime || -Infinity));

    // only one "current" highlighted (choose the one ending soonest)
    cur.sort((a, b) => (a.endTime || Infinity) - (b.endTime || Infinity));
    return { previous: prev, current: cur[0] || null, upcoming: up };
  }, [bookings]);

  const EventCard = ({ item }) => (
    <div className="card" style={{ borderRadius: 12, padding: 16 }}>
      <div className="booking-card-header" style={{ marginBottom: 8 }}>
        <h5 className="booking-card-title" style={{ margin: 0 }}>{item.name}</h5>
        <span className={`status-badge status-${String(item.status || "").toLowerCase()}`}>
          {item.status}
        </span>
      </div>
      <div className="booking-card-content">
        <p style={{ margin: "4px 0" }}>📅 {fmtDate(item.startTime)}</p>
        <p style={{ margin: "4px 0" }}>
          ⏰ {fmtTime(item.startTime)}{item.endTime ? ` – ${fmtTime(item.endTime)}` : ""}
        </p>
        <p style={{ margin: "4px 0" }}>📍 {item.location}</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {item.eventId ? (
          <button
            className="event-btn secondary"
            onClick={() => navigate(`/events/${item.eventId}`)}
          >
            View Details
          </button>
        ) : null}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="event-section">
        <h4 className="section-title">My Activities</h4>
        <div className="empty-state">
          <h5>Loading…</h5>
          <p>Fetching your events and bookings.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-section">
        <h4 className="section-title">My Activities</h4>
        <div className="empty-state">
          <h5>Couldn’t load activities</h5>
          <p>{error}</p>
          <button className="event-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-section">
      <div className="section-header">
        <h4 className="section-title">My Activities</h4>
      </div>

      {/* Current Event */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <h5 style={{ marginTop: 0, marginBottom: 12, color: "#2c3e50" }}>Current Event</h5>
        {!current ? (
          <div className="empty-state">
            <h5>No event is ongoing right now</h5>
            <p>Check your upcoming list or browse new events.</p>
            <button className="event-btn success" onClick={() => navigate("/events")}>
              Browse Events
            </button>
          </div>
        ) : (
          <EventCard item={current} />
        )}
      </div>

      {/* Upcoming */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div className="section-header" style={{ marginBottom: 8 }}>
          <h5 style={{ margin: 0, color: "#2c3e50" }}>Upcoming Events</h5>
          <button className="view-all-btn" onClick={() => navigate("/attendee/bookings")}>
            View All →
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <h5>No upcoming events</h5>
            <p>You haven’t booked any future events yet.</p>
            <button className="event-btn secondary" onClick={() => navigate("/events")}>
              Discover Events
            </button>
          </div>
        ) : (
          <div
            className="bookings-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}
          >
            {upcoming.map((u) => (
              <EventCard key={`${u.bookingId}-${u.eventId || u.name}`} item={u} />
            ))}
          </div>
        )}
      </div>

      {/* Previous */}
      <div className="card" style={{ padding: 16 }}>
        <h5 style={{ marginTop: 0, marginBottom: 12, color: "#2c3e50" }}>Previous Events</h5>
        {previous.length === 0 ? (
          <div className="empty-state">
            <h5>No past events yet</h5>
            <p>Your completed and expired events will appear here.</p>
          </div>
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}
          >
            {previous.map((p) => (
              <EventCard key={`${p.bookingId}-${p.eventId || p.name}`} item={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

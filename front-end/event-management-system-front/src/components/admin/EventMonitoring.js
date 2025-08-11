import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const EventMonitoring = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    // Load events from organizer events
    const organizerEvents = JSON.parse(localStorage.getItem("organizerEvents") || "[]");
    // Load events from attendee events  
    const attendeeEvents = JSON.parse(localStorage.getItem("myEvents") || "[]");
    
    // Combine all events
    const allEvents = [
      ...organizerEvents.map(e => ({ ...e, source: 'organizer' })),
      ...attendeeEvents.map(e => ({ ...e, source: 'attendee' }))
    ];
    
    setEvents(allEvents);
  };

  const handleFlagEvent = (eventId) => {
    const reason = prompt("Enter reason for flagging this event:");
    if (reason) {
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, flagged: true, flagReason: reason, flaggedBy: 'admin' }
          : event
      );
      setEvents(updatedEvents);
      
      // Update in localStorage
      const organizerEvents = updatedEvents.filter(e => e.source === 'organizer');
      const attendeeEvents = updatedEvents.filter(e => e.source === 'attendee');
      localStorage.setItem("organizerEvents", JSON.stringify(organizerEvents));
      localStorage.setItem("myEvents", JSON.stringify(attendeeEvents));
    }
  };

  const handleCancelEvent = (eventId) => {
    if (window.confirm("Are you sure you want to cancel this event?")) {
      const updatedEvents = events.map(event => 
        event.id === eventId 
          ? { ...event, status: "CANCELLED", cancelledBy: 'admin' }
          : event
      );
      setEvents(updatedEvents);
      
      // Update in localStorage
      const organizerEvents = updatedEvents.filter(e => e.source === 'organizer');
      const attendeeEvents = updatedEvents.filter(e => e.source === 'attendee');
      localStorage.setItem("organizerEvents", JSON.stringify(organizerEvents));
      localStorage.setItem("myEvents", JSON.stringify(attendeeEvents));
    }
  };

  const getApprovalStatus = (event) => {
    // Check booking requests for this event
    const bookingRequests = JSON.parse(localStorage.getItem("bookingRequests") || "[]");
    const eventRequests = bookingRequests.filter(req => req.eventId === event.id);
    
    if (eventRequests.length === 0) return "No bookings";
    
    const allConfirmed = eventRequests.every(req => req.status === 'confirmed');
    const anyRejected = eventRequests.some(req => req.status === 'rejected');
    const anyPending = eventRequests.some(req => req.status === 'pending');
    
    if (allConfirmed) return "Approved";
    if (anyRejected) return "Partially Rejected";
    if (anyPending) return "Pending Approval";
    
    return "Unknown";
  };

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    if (filter === "flagged") return event.flagged;
    if (filter === "cancelled") return event.status === "CANCELLED";
    if (filter === "pending") return getApprovalStatus(event) === "Pending Approval";
    return true;
  });

  const getEventStats = () => {
    const now = new Date();
    return {
      upcoming: events.filter(e => new Date(e.startTime) > now && e.status !== "CANCELLED").length,
      ongoing: events.filter(e => {
        const start = new Date(e.startTime);
        const end = new Date(e.endTime);
        return start <= now && end >= now && e.status !== "CANCELLED";
      }).length,
      completed: events.filter(e => new Date(e.endTime) < now && e.status !== "CANCELLED").length,
      cancelled: events.filter(e => e.status === "CANCELLED").length,
      flagged: events.filter(e => e.flagged).length,
      total: events.length
    };
  };

  const stats = getEventStats();

  return (
    <div className="admin-page">
      <div className="page-header">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary" 
          style={{ position: 'absolute', left: '2rem', top: '2rem' }}
        >
          ← Back to Dashboard
        </button>
        <h1 className="page-title">Event Monitoring</h1>
        <p className="page-subtitle">Monitor all events, ownership, and approval status</p>
      </div>

      {/* Event Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card text-center">
          <h3 className="text-primary">{stats.total}</h3>
          <p className="text-muted">Total Events</p>
        </div>
        <div className="card text-center">
          <h3 className="text-warning">{stats.upcoming}</h3>
          <p className="text-muted">Upcoming</p>
        </div>
        <div className="card text-center">
          <h3 className="text-success">{stats.ongoing}</h3>
          <p className="text-muted">Ongoing</p>
        </div>
        <div className="card text-center">
          <h3 className="text-muted">{stats.completed}</h3>
          <p className="text-muted">Completed</p>
        </div>
        <div className="card text-center">
          <h3 className="text-danger">{stats.cancelled}</h3>
          <p className="text-muted">Cancelled</p>
        </div>
        <div className="card text-center">
          <h3 className="text-warning">{stats.flagged}</h3>
          <p className="text-muted">Flagged</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls" style={{ marginBottom: '2rem' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
          style={{ width: '200px' }}
        >
          <option value="all">All Events</option>
          <option value="pending">Pending Approval</option>
          <option value="flagged">Flagged Events</option>
          <option value="cancelled">Cancelled Events</option>
        </select>
      </div>

      {/* Events List */}
      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>All Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="admin-table" style={{ minWidth: '1400px', width: '100%' }}>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Date/Time</th>
                <th>Status</th>
                <th>Approval Status</th>
                <th>Flagged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={`${event.id}-${event.source}`}>
                    <td style={{ fontWeight: 600 }}>{event.name}</td>
                    <td>{event.organizer || 'Event Organizer'}</td>
                    <td>{event.venue || event.location || 'TBD'}</td>
                    <td>
                      <div>
                        <div>{event.startTime ? new Date(event.startTime).toLocaleDateString() : event.date}</div>
                        <small style={{ color: '#6c757d' }}>
                          {event.startTime ? new Date(event.startTime).toLocaleTimeString() : event.time}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${(event.status || 'draft').toLowerCase()}`}>
                        {event.status || 'Draft'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        getApprovalStatus(event) === 'Approved' ? 'status-confirmed' :
                        getApprovalStatus(event) === 'Pending Approval' ? 'status-pending' :
                        getApprovalStatus(event) === 'Partially Rejected' ? 'status-cancelled' :
                        'status-draft'
                      }`}>
                        {getApprovalStatus(event)}
                      </span>
                    </td>
                    <td>
                      {event.flagged ? (
                        <div>
                          <span className="status-badge status-cancelled">Flagged</span>
                          {event.flagReason && (
                            <small style={{ display: 'block', color: '#dc3545', marginTop: '4px' }}>
                              {event.flagReason}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="status-badge status-confirmed">Normal</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: 'wrap' }}>
                        {!event.flagged && (
                          <button
                            onClick={() => handleFlagEvent(event.id)}
                            className="btn btn-warning"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Flag
                          </button>
                        )}
                        {event.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelEvent(event.id)}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventMonitoring;
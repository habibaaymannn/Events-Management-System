import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEvents, flagEvent, cancelEvent } from "../../api/adminApi";

const EventMonitoring = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAllEvents(0, 100); // adjust page/size as needed
      setEvents(response.content || []);
    } catch (error) {
      // Handle error
    }
  };

  const handleFlagEvent = async (eventId) => {
    const reason = prompt("Enter reason for flagging this event:");
    if (reason) {
      try {
        await flagEvent(eventId, reason);
        loadEvents();
      } catch (error) {
        // Handle error
      }
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to cancel this event?")) {
      try {
        await cancelEvent(eventId);
        loadEvents();
      } catch (error) {
        // Handle error
      }
    }
  };

  const getApprovalStatus = (event) => {
    // You may need to fetch booking requests via an endpoint if available
    // For now, return event.approvalStatus or similar property if present
    return event.approvalStatus || "Unknown";
  };

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary mb-3"
        >
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
          Event Monitoring
        </h2>
        <p style={{ color: "#6c757d", fontSize: "1.1rem", marginTop: "0.5rem" }}>
          Monitor all events, ownership, and approval status
        </p>
      </div>

      {/* Events List */}
      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>All Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1400px', width: '100%' }}>
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
              {events.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map(event => (
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
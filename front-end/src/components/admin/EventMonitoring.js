import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEvents, flagEvent, cancelEvent } from "../../api/adminApi";
import { getAdminBookingsByEventId,  getVenueBookingsByEventId,  getServiceBookingsByEventId} from "../../api/bookingApi";


const EventMonitoring = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventBookings, setEventBookings] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getAllEvents(0, 100); // adjust page/size as needed
      const list = Array.isArray(response)
    ? response
     : (response?.data?.content || response?.content || []);
   setEvents(list);
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

 const handleViewEventDetails = async (event) => {
   try {
     const [eventBs, venueBs, serviceBs] = await Promise.all([
       getAdminBookingsByEventId(event.id),     // EventBooking
       getVenueBookingsByEventId(event.id),     // VenueBooking
       getServiceBookingsByEventId(event.id),   // ServiceBooking
     ]);

     // Normalize so the UI can render one list with a 'type'
     const withType = [
       ...eventBs.map(b => ({ ...b, type: b.type || 'EVENT' })),
       ...venueBs.map(b => ({ ...b, type: 'VENUE' })),
       ...serviceBs.map(b => ({ ...b, type: 'SERVICE' })),
     ];

     setEventBookings(withType);
     setSelectedEvent(event);
   } catch (error) {
     console.error("Error fetching event bookings:", error);
     setEventBookings([]);
     setSelectedEvent(event);
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
                  <td colSpan="9" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={`${event.id}`}>
                    <td style={{ fontWeight: 600 }}>{event.name}</td>
                    <td>{event.organizerName || 'Event Organizer'}</td>
                    <td>{event.venueName || event.location || 'TBD'}</td>
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
                        <button
                          onClick={() => handleViewEventDetails(event)}
                          className="btn btn-info"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          View Details
                        </button>
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Event Details - {selectedEvent.name}</h4>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Event Information</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Name:</strong> {selectedEvent.name}</div>
                  <div><strong>Type:</strong> {selectedEvent.type}</div>
                  <div><strong>Status:</strong> {selectedEvent.status}</div>
                  <div><strong>Organizer:</strong> {selectedEvent.organizerName || 'N/A'}</div>
                  <div><strong>Start Time:</strong> {selectedEvent.startTime ? new Date(selectedEvent.startTime).toLocaleString() : 'N/A'}</div>
                  <div><strong>End Time:</strong> {selectedEvent.endTime ? new Date(selectedEvent.endTime).toLocaleString() : 'N/A'}</div>
                </div>
                {selectedEvent.description && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '0.5rem' }}>{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                  Event Bookings ({eventBookings.length})
                </h5>
                {eventBookings.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {eventBookings.map((booking, index) => (
                      <div key={index} style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold' }}>
                            {booking.type === 'VENUE' ? '🏢 Venue Booking' : '🛠️ Service Booking'}
                          </span>
                          <span className={`status-badge status-${(booking.status || 'UNKNOWN').toString().toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          <div><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</div>
                          <div><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</div>
                          {booking.venueId && <div><strong>Venue ID:</strong> {booking.venueId}</div>}
                          {booking.serviceId && <div><strong>Service ID:</strong> {booking.serviceId}</div>}
                          {booking.organizerBooker && (
                            <div><strong>Booked by:</strong> {booking.organizerBooker.firstName} {booking.organizerBooker.lastName}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    No bookings found for this event.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventMonitoring;
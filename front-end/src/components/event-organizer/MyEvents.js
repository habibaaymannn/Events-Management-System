import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cancelEvent, getEventsByOrganizer } from "../../api/eventApi";
import { getBookingById, getBookingsByEventId } from "../../api/bookingApi";

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [eventBookings, setEventBookings] = useState({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getEventsByOrganizer(0, 100); // adjust page/size as needed
      setEvents(response.content || []);
    } catch (error) {
      // Handle error
    }
  };

  const filteredEvents = filter === "All"
    ? events
    : events.filter(event => event.status === filter);

  const handleEditEvent = async (eventId) => {
    // Implement edit logic using updateEvent
    // Example: await updateEvent(eventId, updatedEventData); then reload
    // loadEvents();
  };

  const handleDeleteEvent = async (event) => {
    const confirmMessage = `Are you sure you want to delete this event? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await cancelEvent(event.id);
        loadEvents();
        alert(`Event "${event.name}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Failed to delete event: ${error.message || 'Please try again.'}`);
      }
    }
  };

  const handleViewDetails = async (event) => {
    try {
      // Load bookings for this specific event
      const bookings = await getBookingsByEventId(event.id);
      setEventBookings(prev => ({
        ...prev,
        [event.id]: bookings
      }));
      setSelectedEvent(event);
    } catch (error) {
      console.error("Error fetching event bookings:", error);
      setSelectedEvent(event);
    }
  };

  const handleViewBookingDetails = async (bookingId) => {
    try {
      const details = await getBookingById(bookingId);
      setSelectedBookingDetails(details);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      alert("Failed to load booking details");
    }
  };

  const isWithinFreeCancellation = (event) => {
    const today = new Date();
    const cancellationDeadline = new Date(event.cancellationDeadline);
    return today <= cancellationDeadline;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming": return "upcoming";
      case "Planning": return "planning";
      case "Completed": return "completed";
      case "Cancelled": return "cancelled";
      default: return "default";
    }
  };

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === "Upcoming").length,
    planning: events.filter(e => e.status === "Planning").length,
    completed: events.filter(e => e.status === "Completed").length,
    cancelled: events.filter(e => e.status === "Cancelled").length,
    totalRevenue: events.filter(e => e.status !== "Cancelled").reduce((sum, e) => sum + e.totalRevenue, 0),
    totalCosts: events.filter(e => e.status !== "Cancelled").reduce((sum, e) => sum + e.totalCost, 0)
  };

  return (
    <div className="event-page">
      <div className="event-page-header">
        <h3 className="event-page-title">My Events</h3>
        <p className="event-page-subtitle">Manage and track all your events</p>
      </div>

      {/* Event Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.total}</h3>
            <p className="stat-label">Total Events</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon upcoming-icon">🚀</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.upcoming}</h3>
            <p className="stat-label">Upcoming</p>
            <span className="stat-change positive">Ready to execute</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon planning-icon">📝</div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.planning}</h3>
            <p className="stat-label">In Planning</p>
            <span className="stat-change neutral">Needs attention</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-number">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="stat-label">Total Revenue</p>
            <span className="stat-change positive">
              ${(stats.totalRevenue - stats.totalCosts).toLocaleString()} profit
            </span>
          </div>
        </div>
      </div>

      <div className="event-section">
        <div className="section-header">
          <h4 className="section-title">Event Management</h4>
          <div className="header-actions">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="All">All Events</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Planning">Planning</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              className="event-btn success"
              onClick={() => navigate('/event-organizer/create-event')}
            >
              Create New Event
            </button>
          </div>
        </div>

        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <h5 className="event-card-title">{event.name}</h5>
                <span className={`status-badge status-${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="event-card-content">
                <div className="event-details">
                  <p className="event-type">🏷️ {event.type}</p>
                  <p className="event-date">📅 {event.date}</p>
                  <p className="event-time">⏰ {event.startTime} - {event.endTime}</p>
                  <p className="event-attendees">👥 {event.attendees} attendees</p>
                  {event.venue && <p className="event-venue">🏢 {event.venue.name}</p>}
                </div>

                <div className="event-financials">
                  <div className="financial-row">
                    <span className="financial-label">Revenue:</span>
                    <span className="financial-value revenue">${event.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="financial-row">
                    <span className="financial-label">Costs:</span>
                    <span className="financial-value cost">${event.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="financial-row">
                    <span className="financial-label">Profit:</span>
                    <span className="financial-value profit">
                      ${(event.totalRevenue - event.totalCost).toLocaleString()}
                    </span>
                  </div>
                </div>

                {event.status === "Cancelled" && event.cancellationReason && (
                  <div className="cancellation-info">
                    <p><strong>Cancelled:</strong> {event.cancellationReason}</p>
                    {event.cancellationFee > 0 && (
                      <p className="cancellation-fee">Penalty: ${event.cancellationFee}</p>
                    )}
                  </div>
                )}

                {event.status !== "Cancelled" && event.status !== "Completed" && (
                  <div className="cancellation-deadline">
                    <p className={`deadline-info ${isWithinFreeCancellation(event) ? 'free' : 'penalty'}`}>
                      {isWithinFreeCancellation(event)
                        ? `✅ Free cancellation until ${event.cancellationDeadline}`
                        : `⚠️ Cancellation penalty applies after ${event.cancellationDeadline}`
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="event-card-actions">
                <button
                  className="event-btn"
                  onClick={() => handleViewDetails(event)}
                >
                  View Details
                </button>
                {event.status !== "Completed" && event.status !== "Cancelled" && (
                  <>
                    <button
                      className="event-btn secondary"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="event-btn danger"
                      onClick={() => handleDeleteEvent(event)}
                    >
                      Delete Event
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Event Details</h4>
              <button
                className="modal-close"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h5>Event Information</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Name:</strong> {selectedEvent.name}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {selectedEvent.type}
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong> {selectedEvent.date}
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                  <div className="detail-item">
                    <strong>Attendees:</strong> {selectedEvent.attendees}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> {selectedEvent.status}
                  </div>
                  {selectedEvent.notes && (
                    <div className="detail-item full-width">
                      <strong>Notes:</strong>
                      <p>{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.venue && (
                <div className="detail-section">
                  <h5>Venue Information</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Venue:</strong> {selectedEvent.venue.name}
                    </div>
                    <div className="detail-item">
                      <strong>Location:</strong> {selectedEvent.venue.location}
                    </div>
                    <div className="detail-item">
                      <strong>Cost:</strong> ${selectedEvent.venue.cost}
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.services.length > 0 && (
                <div className="detail-section">
                  <h5>Services</h5>
                  <div className="services-list">
                    {selectedEvent.services.map((service, index) => (
                      <div key={index} className="service-detail">
                        <span className="service-name">{service.name}</span>
                        <span className="service-cost">${service.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {eventBookings[selectedEvent.id] && eventBookings[selectedEvent.id].length > 0 && (
                <div className="detail-section">
                  <h5>Event Bookings ({eventBookings[selectedEvent.id].length})</h5>
                  <div className="bookings-list">
                    {eventBookings[selectedEvent.id].map((booking, index) => (
                      <div key={index} className="booking-detail">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div>
                            <span className="booking-type">
                              {booking.type === 'VENUE' ? '🏢 Venue Booking' : '🛠️ Service Booking'}
                            </span>
                            <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          <button
                            className="event-btn secondary"
                            onClick={() => handleViewBookingDetails(booking.id)}
                          >
                            View Details
                          </button>
                        </div>
                        <div className="booking-info">
                          <p><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</p>
                          <p><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</p>
                          {booking.venueId && <p><strong>Venue ID:</strong> {booking.venueId}</p>}
                          {booking.serviceId && <p><strong>Service ID:</strong> {booking.serviceId}</p>}
                          {booking.currency && <p><strong>Currency:</strong> {booking.currency}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!eventBookings[selectedEvent.id] || eventBookings[selectedEvent.id].length === 0) && (
                <div className="detail-section">
                  <h5>Event Bookings</h5>
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                    No bookings found for this event.
                  </p>
                </div>
              )}

              <div className="detail-section">
                <h5>Financial Summary</h5>
                <div className="financial-summary">
                  <div className="summary-row">
                    <span>Total Revenue:</span>
                    <span className="revenue">${selectedEvent.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>Total Costs:</span>
                    <span className="cost">${selectedEvent.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span><strong>Net Profit:</strong></span>
                    <span className="profit"><strong>${(selectedEvent.totalRevenue - selectedEvent.totalCost).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBookingDetails && (
        <div className="modal-overlay" onClick={() => setSelectedBookingDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Booking Details</h4>
              <button
                className="modal-close"
                onClick={() => setSelectedBookingDetails(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h5>Booking Information</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Booking ID:</strong> {selectedBookingDetails.id}
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong> {selectedBookingDetails.type}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> {selectedBookingDetails.status}
                  </div>
                  <div className="detail-item">
                    <strong>Start Time:</strong> {new Date(selectedBookingDetails.startTime).toLocaleString()}
                  </div>
                  <div className="detail-item">
                    <strong>End Time:</strong> {new Date(selectedBookingDetails.endTime).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedBookingDetails.venueId && (
                <div className="detail-section">
                  <h5>Venue Information</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Venue ID:</strong> {selectedBookingDetails.venueId}
                    </div>
                  </div>
                </div>
              )}

              {selectedBookingDetails.serviceId && (
                <div className="detail-section">
                  <h5>Service Information</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Service ID:</strong> {selectedBookingDetails.serviceId}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyEvents;
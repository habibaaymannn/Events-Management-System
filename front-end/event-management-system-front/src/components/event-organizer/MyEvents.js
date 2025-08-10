import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    type: "Corporate",
    date: "2024-02-15",
    startTime: "09:00",
    endTime: "17:00",
    status: "Upcoming",
    attendees: 350,
    ticketPrice: 50,
    venue: {
      name: "Grand Ballroom",
      location: "Downtown Convention Center",
      cost: 2000
    },
    services: [
      { name: "Premium Catering", cost: 17500 },
      { name: "AV Equipment", cost: 800 }
    ],
    totalCost: 20300,
    totalRevenue: 17500,
    createdDate: "2024-01-10",
    cancellationDeadline: "2024-02-08",
    notes: "Annual tech conference with industry leaders"
  },
  {
    id: 2,
    name: "Summer Wedding",
    type: "Wedding",
    date: "2024-06-20",
    startTime: "18:00",
    endTime: "23:00",
    status: "Planning",
    attendees: 120,
    ticketPrice: 200,
    venue: {
      name: "Garden Pavilion",
      location: "City Park",
      cost: 1200
    },
    services: [
      { name: "Wedding Catering", cost: 6000 },
      { name: "Photography", cost: 1500 },
      { name: "Floral Decorations", cost: 900 }
    ],
    totalCost: 9600,
    totalRevenue: 24000,
    createdDate: "2024-01-20",
    cancellationDeadline: "2024-06-13",
    notes: "Elegant outdoor wedding ceremony and reception"
  },
  {
    id: 3,
    name: "Product Launch",
    type: "Corporate",
    date: "2024-01-15",
    startTime: "19:00",
    endTime: "22:00",
    status: "Completed",
    attendees: 200,
    ticketPrice: 75,
    venue: {
      name: "Rooftop Terrace",
      location: "Downtown Skyline",
      cost: 1800
    },
    services: [
      { name: "Cocktail Catering", cost: 4000 },
      { name: "Photography", cost: 1500 }
    ],
    totalCost: 7300,
    totalRevenue: 15000,
    createdDate: "2023-12-20",
    cancellationDeadline: "2024-01-08",
    notes: "Successful product launch with great turnout"
  },
  {
    id: 4,
    name: "Charity Gala",
    type: "Charity",
    date: "2024-03-10",
    startTime: "18:30",
    endTime: "23:30",
    status: "Upcoming",
    attendees: 400,
    ticketPrice: 100,
    venue: {
      name: "Grand Ballroom",
      location: "Downtown Convention Center",
      cost: 2000
    },
    services: [
      { name: "Gala Catering", cost: 20000 },
      { name: "Live Entertainment", cost: 3000 },
      { name: "Professional Photography", cost: 1500 }
    ],
    totalCost: 26500,
    totalRevenue: 40000,
    createdDate: "2024-01-05",
    cancellationDeadline: "2024-03-03",
    notes: "Annual charity fundraising event"
  },
  {
    id: 5,
    name: "Birthday Celebration",
    type: "Private",
    date: "2024-01-05",
    startTime: "20:00",
    endTime: "02:00",
    status: "Cancelled",
    attendees: 50,
    ticketPrice: 0,
    venue: null,
    services: [],
    totalCost: 500,
    totalRevenue: 0,
    createdDate: "2023-12-28",
    cancellationDeadline: "2023-12-29",
    notes: "Cancelled due to personal reasons",
    cancellationReason: "Personal emergency",
    cancellationFee: 100
  }
];

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(mockEvents);
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const filteredEvents = filter === "All"
    ? events
    : events.filter(event => event.status === filter);

  const handleEditEvent = (eventId) => {
    console.log("Edit event:", eventId);
    // Navigate to edit page or open edit modal
  };

  const handleCancelEvent = (event) => {
    setSelectedEvent(event);
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    if (!selectedEvent) return;

    const today = new Date();
    const eventDate = new Date(selectedEvent.date);
    const cancellationDeadline = new Date(selectedEvent.cancellationDeadline);

    let cancellationFee = 0;
    if (today > cancellationDeadline) {
      // Calculate penalty (e.g., 20% of total cost)
      cancellationFee = Math.round(selectedEvent.totalCost * 0.2);
    }

    setEvents(events.map(event =>
      event.id === selectedEvent.id
        ? {
          ...event,
          status: "Cancelled",
          cancellationReason: cancelReason,
          cancellationFee: cancellationFee
        }
        : event
    ));

    setShowCancelModal(false);
    setSelectedEvent(null);
    setCancelReason("");

    if (cancellationFee > 0) {
      alert(`Event cancelled with penalty fee: $${cancellationFee}`);
    } else {
      alert("Event cancelled successfully with no penalty.");
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
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
                      onClick={() => handleCancelEvent(event)}
                    >
                      Cancel Event
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && !showCancelModal && (
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

      {/* Cancellation Modal */}
      {showCancelModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content cancel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Cancel Event</h4>
              <button
                className="modal-close"
                onClick={() => setShowCancelModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="cancel-warning">
                <h5>⚠️ Cancel "{selectedEvent.name}"?</h5>
                <p>Are you sure you want to cancel this event?</p>

                {isWithinFreeCancellation(selectedEvent) ? (
                  <div className="free-cancellation">
                    <p className="success-message">
                      ✅ You can cancel this event without any penalty fees.
                    </p>
                  </div>
                ) : (
                  <div className="penalty-warning">
                    <p className="warning-message">
                      ⚠️ Cancelling after the deadline will incur a penalty fee.
                    </p>
                    <p className="penalty-amount">
                      Estimated penalty: ${Math.round(selectedEvent.totalCost * 0.2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder="Please provide a reason for cancellation"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Event
                </button>
                <button
                  className="event-btn danger"
                  onClick={confirmCancellation}
                  disabled={!cancelReason.trim()}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
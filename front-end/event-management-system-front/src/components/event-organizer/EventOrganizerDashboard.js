import React, { useState, useEffect } from "react";
import "./EventOrganizerDashboard.css";

// Enum values for EventType
const EVENT_TYPES = [
  "WEDDING", "ENGAGEMENT_PARTY", "BIRTHDAY_PARTY", "FAMILY_REUNION", "PRIVATE_DINNER", "RETREAT", "BACHELORETTE_PARTY", "BABY_SHOWER",
  "CONFERENCE", "WORKSHOP", "SEMINAR", "CORPORATE_DINNER", "NETWORKING_EVENT", "PRODUCT_LAUNCH", "AWARD_CEREMONY", "FASHION_SHOW", "BUSINESS_EXPO", "FUNDRAISER"
];
const EVENT_TYPE_LABELS = {
  WEDDING: "Wedding",
  ENGAGEMENT_PARTY: "Engagement Party",
  BIRTHDAY_PARTY: "Birthday Party",
  FAMILY_REUNION: "Family Reunion",
  PRIVATE_DINNER: "Private Dinner",
  RETREAT: "Retreat",
  BACHELORETTE_PARTY: "Bachelorette Party",
  BABY_SHOWER: "Baby Shower",
  CONFERENCE: "Conference",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  CORPORATE_DINNER: "Corporate Dinner",
  NETWORKING_EVENT: "Networking Event",
  PRODUCT_LAUNCH: "Product Launch",
  AWARD_CEREMONY: "Award Ceremony",
  FASHION_SHOW: "Fashion Show",
  BUSINESS_EXPO: "Business Expo",
  FUNDRAISER: "Fundraiser"
};

const SERVICE_DESCRIPTIONS = {
  CATERING_SERVICES: "Catering Services",
  DECOR_AND_STYLING: "Decor and Styling",
  AUDIO_VISUAL_SERVICES: "Audio Visual Services",
  FURNITURE_EQUIPMENT_RENTAL: "Furniture & Equipment Rental"
};

const formatVenueType = (type) => {
  switch (type) {
    case "VILLA": return "Villa";
    case "CHALET": return "Chalet";
    case "SCHOOL_HALL": return "School Hall";
    default: return type;
  }
};

const initialEvents = [];

const EventOrganizerDashboard = () => {
  // Load data from localStorage
  const [venues, setVenues] = useState(() => {
    const stored = localStorage.getItem("venues");
    return stored ? JSON.parse(stored) : [];
  });
  const [services, setServices] = useState(() => {
    const stored = localStorage.getItem("services");
    return stored ? JSON.parse(stored) : [];
  });
  const [bookingRequests, setBookingRequests] = useState(() => {
    const stored = localStorage.getItem("bookingRequests");
    return stored ? JSON.parse(stored) : [];
  });

  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("organizerEvents");
    return stored ? JSON.parse(stored) : initialEvents;
  });

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("organizerEvents", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  const [showAdd, setShowAdd] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [formEvent, setFormEvent] = useState({
    name: "",
    description: "",
    type: "",
    startTime: "",
    endTime: "",
    venueId: "",
    serviceIds: [],
    retailPrice: "",
    status: "DRAFT"
  });
  const [alerts, setAlerts] = useState([]);

  // Helper: get available venues for selected date
  const getAvailableVenues = (dateStr) => {
    if (!dateStr) return [];
    return venues.filter(v => 
      v.availability && v.availability.includes(dateStr) &&
      !v.bookings.some(b => b.date === dateStr) &&
      !bookingRequests.some(req => 
        req.type === 'venue' && 
        req.itemId === v.id && 
        req.date === dateStr && 
        req.status === 'pending'
      )
    );
  };

  // Helper: get available services
  const getAvailableServices = () => {
    return services.filter(s => s.availability === "AVAILABLE");
  };

  // Helper: format venue display
  const formatVenueDisplay = (venue) => {
    return `${venue.name} (${venue.location}) - ${formatVenueType(venue.type)} - Capacity: ${venue.capacity_minimum}-${venue.capacity_maximum} - $${venue.price}`;
  };

  // Helper: format service display
  const formatServiceDisplay = (service) => {
    return `${service.name} - ${SERVICE_DESCRIPTIONS[service.description] || service.description} - $${service.price} (${service.location})`;
  };

  // Create booking request
  const createBookingRequest = (type, itemId, eventData, date) => {
    const request = {
      id: Date.now() + Math.random(),
      type, // 'venue' or 'service'
      itemId,
      eventId: eventData.id,
      eventName: eventData.name,
      organizerEmail: "organizer@demo.com", // Current user email
      date,
      status: 'pending', // pending, confirmed, rejected
      createdAt: new Date().toISOString(),
      eventDetails: eventData
    };
    
    setBookingRequests(prev => [...prev, request]);
    return request;
  };

  // Add or Edit Event
  const handleEventFormSubmit = (e) => {
    e.preventDefault();
    const dateStr = formEvent.startTime.split("T")[0];
    
    const newEvent = {
      ...formEvent,
      id: editEventId || Date.now(),
      venueBookingStatus: formEvent.venueId ? 'pending' : null,
      serviceBookingStatuses: formEvent.serviceIds.length > 0 ? 
        formEvent.serviceIds.reduce((acc, serviceId) => {
          acc[serviceId] = 'pending';
          return acc;
        }, {}) : {},
      createdAt: new Date().toISOString()
    };

    // Create booking requests
    const requests = [];
    
    // Venue booking request
    if (formEvent.venueId) {
      const venueRequest = createBookingRequest('venue', formEvent.venueId, newEvent, dateStr);
      requests.push(venueRequest);
    }

    // Service booking requests
    formEvent.serviceIds.forEach(serviceId => {
      const serviceRequest = createBookingRequest('service', serviceId, newEvent, dateStr);
      requests.push(serviceRequest);
    });

    if (editEventId) {
      setEvents(events.map(ev => ev.id === editEventId ? newEvent : ev));
    } else {
      setEvents([...events, newEvent]);
    }

    // Show confirmation message
    const requestCount = requests.length;
    setAlerts([...alerts, {
      id: Date.now(),
      type: 'info',
      message: `Event created successfully! ${requestCount} booking request(s) sent. Waiting for provider confirmations.`,
      timestamp: new Date().toISOString()
    }]);

    // Reset form
    setFormEvent({
      name: "",
      description: "",
      type: "",
      startTime: "",
      endTime: "",
      venueId: "",
      serviceIds: [],
      retailPrice: "",
      status: "DRAFT"
    });
    setShowAdd(false);
    setEditEventId(null);
  };

  // Edit Event
  const handleEditEvent = (event) => {
    setEditEventId(event.id);
    setFormEvent({
      name: event.name,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      venueId: event.venueId || "",
      serviceIds: event.serviceIds || [],
      retailPrice: event.retailPrice,
      status: event.status
    });
    setShowAdd(true);
  };

  // Cancel Event with penalty logic
  const handleCancelEvent = (event) => {
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const freeDeadline = new Date(eventStart);
    freeDeadline.setDate(freeDeadline.getDate() - 7); // 7 days before is free cancellation
    
    const penalty = now > freeDeadline;
    const penaltyAmount = penalty ? event.retailPrice * 0.1 : 0; // 10% penalty
    
    const confirmMessage = penalty 
      ? `Are you sure you want to cancel this event? A penalty of $${penaltyAmount.toFixed(2)} (10%) will apply.`
      : `Are you sure you want to cancel this event? No penalty will apply.`;
    
    if (window.confirm(confirmMessage)) {
      const updatedEvent = {
        ...event,
        status: "CANCELLED",
        penaltyApplied: penalty,
        penaltyAmount: penaltyAmount,
        cancelledAt: new Date().toISOString()
      };
      
      setEvents(events.map(ev => ev.id === event.id ? updatedEvent : ev));
      
      setAlerts([...alerts, {
        id: Date.now(),
        type: penalty ? 'warning' : 'success',
        message: `Event "${event.name}" cancelled successfully.${penalty ? ` Penalty: $${penaltyAmount.toFixed(2)}` : ' No penalty applied.'}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Check for booking status updates (simulate real-time updates)
  useEffect(() => {
    const checkBookingUpdates = () => {
      const updatedRequests = bookingRequests.map(req => {
        // Simulate random confirmations/rejections for demo
        if (req.status === 'pending' && Math.random() < 0.1) {
          const newStatus = Math.random() < 0.8 ? 'confirmed' : 'rejected';
          
          setAlerts(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: newStatus === 'confirmed' ? 'success' : 'danger',
            message: `Your ${req.type} booking for "${req.eventName}" has been ${newStatus}!`,
            timestamp: new Date().toISOString()
          }]);
          
          return { ...req, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return req;
      });
      
      if (JSON.stringify(updatedRequests) !== JSON.stringify(bookingRequests)) {
        setBookingRequests(updatedRequests);
      }
    };

    const interval = setInterval(checkBookingUpdates, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [bookingRequests, alerts]);

  // Update event status based on booking confirmations
  useEffect(() => {
    const updatedEvents = events.map(event => {
      const eventRequests = bookingRequests.filter(req => req.eventId === event.id);
      
      if (eventRequests.length === 0) return event;
      
      const allConfirmed = eventRequests.every(req => req.status === 'confirmed');
      const anyRejected = eventRequests.some(req => req.status === 'rejected');
      const anyPending = eventRequests.some(req => req.status === 'pending');
      
      let newStatus = event.status;
      if (anyRejected) {
        newStatus = 'PLANNING'; // Need to find alternatives
      } else if (allConfirmed) {
        newStatus = 'CONFIRMED';
      } else if (anyPending) {
        newStatus = 'PLANNING';
      }
      
      return { ...event, status: newStatus };
    });
    
    if (JSON.stringify(updatedEvents) !== JSON.stringify(events)) {
      setEvents(updatedEvents);
    }
  }, [bookingRequests]);

  // Categorize events
  const now = new Date();
  const currentEvents = events.filter(ev => {
    const start = new Date(ev.startTime);
    const end = new Date(ev.endTime);
    return start <= now && end >= now && ev.status !== "CANCELLED";
  });
  const upcomingEvents = events.filter(ev => {
    const start = new Date(ev.startTime);
    return start > now && ev.status !== "CANCELLED";
  });
  const pastEvents = events.filter(ev => {
    const end = new Date(ev.endTime);
    return end < now || ev.status === "CANCELLED";
  });

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
        Event Organizer Dashboard
      </h2>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.slice(-3).map(alert => (
            <div key={alert.id} className={`notification notification-${alert.type}`} style={{
              position: 'relative',
              top: 'auto',
              right: 'auto',
              marginBottom: 10,
              cursor: 'pointer'
            }}
            onClick={() => dismissAlert(alert.id)}>
              {alert.message}
              <span style={{ float: 'right', marginLeft: 10 }}>×</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setShowAdd(!showAdd);
          setEditEventId(null);
          setFormEvent({
            name: "",
            description: "",
            type: "",
            startTime: "",
            endTime: "",
            venueId: "",
            serviceIds: [],
            retailPrice: "",
            status: "DRAFT"
          });
        }}
        className="btn btn-primary"
        style={{ marginBottom: 24 }}
      >
        {showAdd ? "Cancel" : "Create New Event"}
      </button>

      {showAdd && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
            {editEventId ? "Edit Event" : "Create New Event"}
          </h3>
          <form onSubmit={handleEventFormSubmit}>
            <div className="form-group">
              <input
                required
                placeholder="Event Name"
                value={formEvent.name}
                onChange={(e) => setFormEvent({ ...formEvent, name: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <textarea
                required
                placeholder="Event Description"
                value={formEvent.description}
                onChange={(e) => setFormEvent({ ...formEvent, description: e.target.value })}
                className="form-control"
                rows={2}
              />
            </div>
            <div className="form-group">
              <select
                required
                value={formEvent.type}
                onChange={(e) => setFormEvent({ ...formEvent, type: e.target.value })}
                className="form-control"
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  required
                  type="datetime-local"
                  value={formEvent.startTime}
                  onChange={(e) => setFormEvent({ ...formEvent, startTime: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  required
                  type="datetime-local"
                  value={formEvent.endTime}
                  onChange={(e) => setFormEvent({ ...formEvent, endTime: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
            
            {/* Venue selection */}
            <div className="form-group">
              <label className="form-label">Select Venue (optional - only one venue allowed)</label>
              <select
                value={formEvent.venueId}
                onChange={(e) => setFormEvent({ ...formEvent, venueId: e.target.value })}
                className="form-control"
              >
                <option value="">No Venue</option>
                {formEvent.startTime &&
                  getAvailableVenues(formEvent.startTime.split("T")[0]).map(v => (
                    <option key={v.id} value={v.id}>
                      {formatVenueDisplay(v)}
                    </option>
                  ))}
              </select>
              {formEvent.startTime && getAvailableVenues(formEvent.startTime.split("T")[0]).length === 0 && (
                <small style={{ color: '#dc3545' }}>No venues available for the selected date</small>
              )}
            </div>
            
            {/* Service selection */}
            <div className="form-group">
              <label className="form-label">Select Services (optional, multiple allowed)</label>
              <div style={{ border: '2px solid #e9ecef', borderRadius: 8, padding: 10, maxHeight: 200, overflowY: 'auto' }}>
                {getAvailableServices().length === 0 ? (
                  <p style={{ color: '#6c757d', margin: 0 }}>No services available</p>
                ) : (
                  getAvailableServices().map(s => (
                    <label key={s.id} style={{ display: 'block', padding: '8px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formEvent.serviceIds.includes(String(s.id))}
                        onChange={(e) => {
                          const serviceId = String(s.id);
                          if (e.target.checked) {
                            setFormEvent({ ...formEvent, serviceIds: [...formEvent.serviceIds, serviceId] });
                          } else {
                            setFormEvent({ ...formEvent, serviceIds: formEvent.serviceIds.filter(id => id !== serviceId) });
                          }
                        }}
                        style={{ marginRight: 8 }}
                      />
                      {formatServiceDisplay(s)}
                    </label>
                  ))
                )}
              </div>
            </div>
            
            <div className="form-group">
              <input
                required
                type="number"
                placeholder="Retail Price (What attendees will pay)"
                value={formEvent.retailPrice}
                onChange={(e) => setFormEvent({ ...formEvent, retailPrice: e.target.value })}
                min={0}
                step="0.01"
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-success">
              {editEventId ? "Update Event" : "Create Event & Send Booking Requests"}
            </button>
          </form>
        </div>
      )}

      {/* Current Events */}
      <div className="card" style={{ width: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Current Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1400px', width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Venue Status</th>
                <th>Services Status</th>
                <th>Retail Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No current events.
                  </td>
                </tr>
              ) : (
                currentEvents.map(ev => {
                  const eventRequests = bookingRequests.filter(req => req.eventId === ev.id);
                  const venueRequest = eventRequests.find(req => req.type === 'venue');
                  const serviceRequests = eventRequests.filter(req => req.type === 'service');
                  
                  return (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 600 }}>{ev.name}</td>
                      <td>{EVENT_TYPE_LABELS[ev.type] || ev.type}</td>
                      <td>{ev.startTime ? new Date(ev.startTime).toLocaleString() : ""}</td>
                      <td>{ev.endTime ? new Date(ev.endTime).toLocaleString() : ""}</td>
                      <td>
                        {venueRequest ? (
                          <span className={`status-badge status-${venueRequest.status}`}>
                            {venueRequest.status}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>No venue</span>
                        )}
                      </td>
                      <td>
                        {serviceRequests.length > 0 ? (
                          <div>
                            {serviceRequests.map(req => (
                              <span key={req.id} className={`status-badge status-${req.status}`} style={{ marginRight: 4, display: 'inline-block', marginBottom: 2 }}>
                                Service {req.status}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#6c757d' }}>No services</span>
                        )}
                      </td>
                      <td>${ev.retailPrice}</td>
                      <td>
                        <span className={`status-badge status-${ev.status.toLowerCase()}`}>{ev.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => handleEditEvent(ev)}
                            className="btn btn-warning"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancelEvent(ev)}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card" style={{ width: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Upcoming Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1400px', width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Venue Status</th>
                <th>Services Status</th>
                <th>Retail Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No upcoming events.
                  </td>
                </tr>
              ) : (
                upcomingEvents.map(ev => {
                  const eventRequests = bookingRequests.filter(req => req.eventId === ev.id);
                  const venueRequest = eventRequests.find(req => req.type === 'venue');
                  const serviceRequests = eventRequests.filter(req => req.type === 'service');
                  
                  return (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 600 }}>{ev.name}</td>
                      <td>{EVENT_TYPE_LABELS[ev.type] || ev.type}</td>
                      <td>{ev.startTime ? new Date(ev.startTime).toLocaleString() : ""}</td>
                      <td>{ev.endTime ? new Date(ev.endTime).toLocaleString() : ""}</td>
                      <td>
                        {venueRequest ? (
                          <span className={`status-badge status-${venueRequest.status}`}>
                            {venueRequest.status}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>No venue</span>
                        )}
                      </td>
                      <td>
                        {serviceRequests.length > 0 ? (
                          <div>
                            {serviceRequests.map(req => (
                              <span key={req.id} className={`status-badge status-${req.status}`} style={{ marginRight: 4, display: 'inline-block', marginBottom: 2 }}>
                                Service {req.status}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#6c757d' }}>No services</span>
                        )}
                      </td>
                      <td>${ev.retailPrice}</td>
                      <td>
                        <span className={`status-badge status-${ev.status.toLowerCase()}`}>{ev.status}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => handleEditEvent(ev)}
                            className="btn btn-warning"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancelEvent(ev)}
                            className="btn btn-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Events */}
      <div className="card" style={{ width: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Past Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1200px', width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Retail Price</th>
                <th>Status</th>
                <th>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {pastEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No past events.
                  </td>
                </tr>
              ) : (
                pastEvents.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>{ev.name}</td>
                    <td>{EVENT_TYPE_LABELS[ev.type] || ev.type}</td>
                    <td>{ev.startTime ? new Date(ev.startTime).toLocaleString() : ""}</td>
                    <td>{ev.endTime ? new Date(ev.endTime).toLocaleString() : ""}</td>
                    <td>${ev.retailPrice}</td>
                    <td>
                      <span className={`status-badge status-${ev.status.toLowerCase()}`}>{ev.status}</span>
                    </td>
                    <td>
                      {ev.penaltyApplied ? (
                        <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                          ${ev.penaltyAmount?.toFixed(2) || '0.00'}
                        </span>
                      ) : (
                        <span style={{ color: '#28a745' }}>None</span>
                      )}
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

export default EventOrganizerDashboard;
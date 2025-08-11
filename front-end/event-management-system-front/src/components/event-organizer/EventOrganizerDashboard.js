import React, { useState, useEffect } from "react";
import "./EventOrganizerDashboard.css";
import { initializeAllDummyData } from "../../utils/initializeDummyData";

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
  // Initialize all dummy data when component mounts
  useEffect(() => {
    const { users, events } = initializeAllDummyData();
    
    // If events were just initialized, update the state
    if (events && events.length > 0 && (!events.length || events.length !== JSON.parse(localStorage.getItem("organizerEvents") || "[]").length)) {
      setEvents(events);
    }
  }, []);

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
  const [filter, setFilter] = useState("current");

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("organizerEvents", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
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

  // Helper: get venue name by ID
  const getVenueName = (venueId) => {
    if (!venueId) return "No venue";
    const venue = venues.find(v => v.id === parseInt(venueId) || v.id === venueId);
    return venue ? venue.name : "No venue";
  };

  // Helper: get service names by IDs
  const getServiceNames = (serviceIds) => {
    if (!serviceIds || serviceIds.length === 0) return "No services";
    const serviceNames = serviceIds.map(id => {
      const service = services.find(s => s.id === parseInt(id) || s.id === id);
      return service ? service.name : null;
    }).filter(name => name);
    return serviceNames.length > 0 ? serviceNames.join(", ") : "No services";
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
    setShowEdit(true);
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

  // Filter events based on selected status
  const filteredEvents = events.filter(event => {
    const now = new Date();
    if (filter === "current") {
      return new Date(event.startTime) <= now && new Date(event.endTime) >= now && event.status !== "CANCELLED";
    } else if (filter === "upcoming") {
      return new Date(event.startTime) > now && event.status !== "CANCELLED";
    } else if (filter === "past") {
      return new Date(event.endTime) < now || event.status === "CANCELLED";
    }
    return true;
  });

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // Save edited event
  const handleSaveEvent = (e) => {
    e.preventDefault();
    setEvents(events.map(ev => ev.id === editEventId ? { ...formEvent, id: editEventId } : ev));
    setShowEdit(false);
    setEditEventId(null);
    setFormEvent({
      name: "",
      type: "",
      startTime: "",
      endTime: "",
      venue: "",
      servicesStatus: "",
      retailPrice: "",
      status: ""
    });
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
              <div style={{ position: 'relative' }}>
                <select 
                  className="form-control"
                  style={{ 
                    appearance: 'none',
                    background: 'white',
                    cursor: 'pointer',
                    paddingRight: '30px'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    const dropdown = e.target.nextElementSibling;
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                  }}
                  readOnly
                  value=""
                >
                  <option value="">
                    {formEvent.serviceIds.length === 0 
                      ? "Select Services" 
                      : `${formEvent.serviceIds.length} service(s) selected`
                    }
                  </option>
                </select>
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  display: 'none'
                }}>
                  {getAvailableServices().length === 0 ? (
                    <div style={{ padding: '10px', color: '#6c757d' }}>No services available</div>
                  ) : (
                    getAvailableServices().map(s => (
                      <label key={s.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}>
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
                        <span style={{ fontSize: '14px' }}>{formatServiceDisplay(s)}</span>
                      </label>
                    ))
                  )}
                </div>
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '12px'
                }}>▼</span>
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
      {/* Filter Dropdown */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <label htmlFor="event-filter" style={{ fontWeight: 600, color: "#2c3e50" }}>Show:</label>
        <select
          id="event-filter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="form-control"
          style={{ width: "200px" }}
        >
          <option value="current">Current Events</option>
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <table className="table" style={{ minWidth: '1200px', width: '100%' }}>
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
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                  No events found for this filter.
                </td>
              </tr>
            ) : (
              filteredEvents.map(event => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{EVENT_TYPE_LABELS[event.type] || event.type}</td>
                  <td>{event.startTime ? new Date(event.startTime).toLocaleString() : event.date}</td>
                  <td>{event.endTime ? new Date(event.endTime).toLocaleString() : event.date}</td>
                  <td>{getVenueName(event.venueId)}</td>
                  <td>{getServiceNames(event.serviceIds)}</td>
                  <td>${event.retailPrice}</td>
                  <td>
                    <span className={`status-badge status-${(event.status || "planning").toLowerCase()}`}>
                      {event.status || "PLANNING"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 8 }}
                      onClick={() => handleEditEvent(event)}
                    >
                      EDIT
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleCancelEvent(event)}
                    >
                      CANCEL
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Event Modal */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Edit Event</h4>
              <button className="modal-close" onClick={() => setShowEdit(false)}>×</button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="form-group">
                <input
                  required
                  placeholder="Event Name"
                  value={formEvent.name}
                  onChange={e => setFormEvent({ ...formEvent, name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <select
                  required
                  value={formEvent.type}
                  onChange={e => setFormEvent({ ...formEvent, type: e.target.value })}
                  className="form-control"
                >
                  <option value="">Select Event Type</option>
                  <option value="BIRTHDAY_PARTY">Birthday Party</option>
                  <option value="WEDDING">Wedding</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="MEETING">Meeting</option>
                  <option value="GALA">Gala</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  required
                  type="datetime-local"
                  placeholder="Start Time"
                  value={formEvent.startTime}
                  onChange={e => setFormEvent({ ...formEvent, startTime: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <input
                  required
                  type="datetime-local"
                  placeholder="End Time"
                  value={formEvent.endTime}
                  onChange={e => setFormEvent({ ...formEvent, endTime: e.target.value })}
                  className="form-control"
                />
              </div>
              {/* Venue selection */}
              <div className="form-group">
                <select
                  value={formEvent.venueId}
                  onChange={e => setFormEvent({ ...formEvent, venueId: e.target.value })}
                  className="form-control"
                >
                  <option value="">Select Venue</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              {/* Services selection */}
              <div className="form-group">
                <label className="form-label">Services</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="form-control"
                    style={{ 
                      appearance: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      paddingRight: '30px'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      const dropdown = e.target.nextElementSibling;
                      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }}
                    readOnly
                    value=""
                  >
                    <option value="">
                      {formEvent.serviceIds.length === 0 
                        ? "Select Services" 
                        : `${formEvent.serviceIds.length} service(s) selected`
                      }
                    </option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    display: 'none'
                  }}>
                    {services.length === 0 ? (
                      <div style={{ padding: '10px', color: '#6c757d' }}>No services available</div>
                    ) : (
                      services.map(service => (
                        <label key={service.id} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0'
                        }}>
                          <input
                            type="checkbox"
                            checked={formEvent.serviceIds.includes(String(service.id))}
                            onChange={(e) => {
                              const serviceId = String(service.id);
                              if (e.target.checked) {
                                setFormEvent({ ...formEvent, serviceIds: [...formEvent.serviceIds, serviceId] });
                              } else {
                                setFormEvent({ ...formEvent, serviceIds: formEvent.serviceIds.filter(id => id !== serviceId) });
                              }
                            }}
                            style={{ marginRight: 8 }}
                          />
                          <span style={{ fontSize: '14px' }}>{formatServiceDisplay(service)}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <span style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    fontSize: '12px'
                  }}>▼</span>
                </div>
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Retail Price"
                  value={formEvent.retailPrice}
                  onChange={e => setFormEvent({ ...formEvent, retailPrice: e.target.value })}
                  className="form-control"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventOrganizerDashboard;
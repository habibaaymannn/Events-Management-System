import React, { useState, useEffect } from "react";
import "./EventOrganizerDashboard.css";

const initialEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    date: "2024-03-15",
    time: "09:00",
    venue: "Grand Ballroom",
    services: ["Audio-visual Equipment", "Food Catering"],
    retailPrice: "150",
    status: "Upcoming",
    bookings: []
  },
  {
    id: 2,
    name: "Corporate Workshop",
    date: "2024-03-20",
    time: "14:00",
    venue: "",
    services: ["Photography/Videography"],
    retailPrice: "75",
    status: "Upcoming",
    bookings: []
  },
  {
    id: 3,
    name: "Product Launch Event",
    date: "2024-02-10",
    time: "18:00",
    venue: "Convention Center",
    services: ["Decorations", "Food Catering"],
    retailPrice: "200",
    status: "Past",
    bookings: []
  }
];

const EventOrganizerDashboard = () => {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("events");
    return stored ? JSON.parse(stored) : initialEvents;
  });
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const [showAdd, setShowAdd] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [formEvent, setFormEvent] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    services: [],
    retailPrice: "",
    status: "Upcoming",
    bookings: [],
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState("All");

  // Mock data for venues and services (would come from localStorage in real app)
  const [venues] = useState(() => {
    const storedVenues = localStorage.getItem("venues");
    return storedVenues ? JSON.parse(storedVenues) : [];
  });
  const [services] = useState(() => {
    const storedServices = localStorage.getItem("services");
    return storedServices ? JSON.parse(storedServices) : [];
  });

  // Book venue when creating event
  const bookVenue = (venueName, eventDate) => {
    const storedVenues = localStorage.getItem("venues");
    if (storedVenues) {
      const venuesData = JSON.parse(storedVenues);
      const updatedVenues = venuesData.map(v => {
        if (v.name === venueName && v.availability.includes(eventDate)) {
          return {
            ...v,
            bookings: [...v.bookings, { date: eventDate, user: "Event Organizer", eventName: formEvent.name }]
          };
        }
        return v;
      });
      localStorage.setItem("venues", JSON.stringify(updatedVenues));
    }
  };

  // Book services when creating event
  const bookServices = (selectedServices, eventDate) => {
    const storedServices = localStorage.getItem("services");
    if (storedServices) {
      const servicesData = JSON.parse(storedServices);
      const updatedServices = servicesData.map(s => {
        if (selectedServices.includes(s.name) && s.availability.includes(eventDate)) {
          return {
            ...s,
            bookings: [...s.bookings, { date: eventDate, user: "Event Organizer", eventName: formEvent.name }]
          };
        }
        return s;
      });
      localStorage.setItem("services", JSON.stringify(updatedServices));
    }
  };

  // Add or Edit Event
  const handleEventFormSubmit = (e) => {
    e.preventDefault();
    
    // Book venue and services
    if (formEvent.venue) {
      bookVenue(formEvent.venue, formEvent.date);
    }
    if (formEvent.services.length > 0) {
      bookServices(formEvent.services, formEvent.date);
    }

    if (editEventId) {
      setEvents(events.map(event => event.id === editEventId ? { ...formEvent, id: editEventId } : event));
      setEditEventId(null);
    } else {
      setEvents([...events, { ...formEvent, id: Date.now() }]);
    }
    
    // Reset form
    setFormEvent({
      name: "",
      date: "",
      time: "",
      venue: "",
      services: [],
      retailPrice: "",
      status: "Upcoming",
      bookings: [],
    });
    setShowAdd(false);
    alert("Event saved and confirmation sent! Venue and services have been booked.");
  };

  // Remove Event
  const handleCancelEvent = (id) => {
    const event = events.find(e => e.id === id);
    const eventDate = new Date(event.date);
    const today = new Date();
    const daysDifference = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    let penalty = "";
    if (daysDifference < 7) {
      penalty = " (Penalty applied - less than 7 days notice)";
    } else {
      penalty = " (No penalty - cancelled within free period)";
    }
    
    setEvents(events.filter(e => e.id !== id));
    alert(`Event cancelled and notifications sent!${penalty}`);
  };

  // Edit Event
  const handleEditEvent = (event) => {
    setEditEventId(event.id);
    setFormEvent({ ...event });
    setShowAdd(true);
  };

  // Update Event Status
  const handleUpdateStatus = (eventId, newStatus) => {
    setEvents(events.map(event =>
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
    alert("Event status updated and notifications sent!");
  };

  // Filter events
  const filteredEvents = filter === "All" 
    ? events 
    : events.filter(event => event.status === filter);

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
        Event Organizer Dashboard
      </h2>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button
          onClick={() => {
            setShowAdd(!showAdd);
            setEditEventId(null);
            setFormEvent({
              name: "",
              date: "",
              time: "",
              venue: "",
              services: [],
              retailPrice: "",
              status: "Upcoming",
              bookings: [],
            });
          }}
          className="btn btn-primary"
        >
          {showAdd ? "Cancel" : "Create New Event"}
        </button>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: "200px" }}
        >
          <option value="All">All Events</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Current">Current</option>
          <option value="Past">Past</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

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
                onChange={e => setFormEvent({ ...formEvent, name: e.target.value })}
                className="form-control"
              />
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <input
                  required
                  type="date"
                  placeholder="Event Date"
                  value={formEvent.date}
                  onChange={e => setFormEvent({ ...formEvent, date: e.target.value })}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <input
                  required
                  type="time"
                  placeholder="Event Time"
                  value={formEvent.time}
                  onChange={e => setFormEvent({ ...formEvent, time: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <select
                value={formEvent.venue}
                onChange={e => setFormEvent({ ...formEvent, venue: e.target.value })}
                className="form-control"
              >
                <option value="">Select Venue (Optional)</option>
                {venues.filter(venue => venue.availability.includes(formEvent.date)).map(venue => (
                  <option key={venue.id} value={venue.name}>
                    {venue.name} - ${venue.price} ({venue.priceType}) - {venue.location}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Select Services (Optional):</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
                {services.filter(service => service.availability.includes(formEvent.date)).map(service => (
                  <label key={service.id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "0.5rem", 
                    background: "#f8f9fa", 
                    borderRadius: "6px", 
                    border: "1px solid #e9ecef" 
                  }}>
                    <input
                      type="checkbox"
                      checked={formEvent.services.includes(service.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormEvent({ 
                            ...formEvent, 
                            services: [...formEvent.services, service.name] 
                          });
                        } else {
                          setFormEvent({ 
                            ...formEvent, 
                            services: formEvent.services.filter(s => s !== service.name) 
                          });
                        }
                      }}
                      style={{ marginRight: 8 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{service.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                        ${service.price} - {service.serviceArea}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <input
                required
                type="number"
                placeholder="Retail Price (what attendees will pay)"
                value={formEvent.retailPrice}
                onChange={e => setFormEvent({ ...formEvent, retailPrice: e.target.value })}
                min={1}
                className="form-control"
              />
            </div>
            
            <button type="submit" className="btn btn-success">
              {editEventId ? "Update Event" : "Create Event"}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Your Events</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1300px', width: '100%' }}>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Services</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    {filter === "All" ? "No events created yet. Click 'Create New Event' to get started." : `No ${filter.toLowerCase()} events found.`}
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 600, minWidth: "180px" }}>{event.name}</td>
                    <td style={{ minWidth: "140px" }}>
                      <div style={{ lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 600 }}>{event.date}</div>
                        <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>{event.time}</div>
                      </div>
                    </td>
                    <td style={{ minWidth: "120px" }}>{event.venue || "TBD"}</td>
                    <td style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                      {event.services.length > 0 ? (
                        <div style={{ fontSize: "0.85rem" }}>
                          {event.services.slice(0, 2).map((service, idx) => (
                            <span key={idx} style={{ 
                              display: "inline-block",
                              padding: "2px 6px",
                              background: "#e3f2fd",
                              borderRadius: "8px",
                              margin: "1px",
                              fontSize: "0.75rem"
                            }}>
                              {service}
                            </span>
                          ))}
                          {event.services.length > 2 && (
                            <span style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                              +{event.services.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#6c757d", fontSize: "0.85rem" }}>No services</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: "#28a745", minWidth: "80px" }}>${event.retailPrice}</td>
                    <td style={{ minWidth: "120px" }}>
                      <select
                        value={event.status}
                        onChange={(e) => handleUpdateStatus(event.id, e.target.value)}
                        className="form-control"
                        style={{ 
                          minWidth: "100px", 
                          padding: "4px 8px", 
                          fontSize: "0.85rem"
                        }}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Current">Current</option>
                        <option value="Past">Past</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ minWidth: "150px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="btn btn-warning"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancelEvent(event.id)}
                          className="btn btn-danger"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        >
                          Cancel
                        </button>
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
              <h4>{selectedEvent.name}</h4>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                ×
              </button>
            </div>
            <div>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Venue:</strong> {selectedEvent.venue || "None"}</p>
              <p><strong>Services:</strong> {selectedEvent.services.join(", ") || "None"}</p>
              <p><strong>Price:</strong> ${selectedEvent.retailPrice}</p>
              <p><strong>Status:</strong> {selectedEvent.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventOrganizerDashboard;
import React, { useState, useEffect } from "react";
import "./EventOrganizerDashboard.css";
import { initializeAllDummyData } from "../../utils/initializeDummyData";
import { bookVenue, bookService } from "../../api/bookingApi";
import { getMyServices } from "../../api/serviceApi";
import { getAllVenues } from "../../api/venueApi";

// Import new components
import EventForm from "./components/EventForm";
import EventsTable from "./components/EventsTable";
import EditEventModal from "./components/EditEventModal";
import AlertsSection from "./components/AlertsSection";

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
  // Venues / Services (now API-driven; localStorage fallback kept)
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

  // Add missing monthlyData for charts
  const monthlyData = [
    { month: "Jan", revenue: 15000, bookings: 12, profit: 3000 },
    { month: "Feb", revenue: 18000, bookings: 15, profit: 4000 },
    { month: "Mar", revenue: 22000, bookings: 18, profit: 5000 },
    { month: "Apr", revenue: 25000, bookings: 20, profit: 6000 },
    { month: "May", revenue: 28000, bookings: 25, profit: 7000 },
    { month: "Jun", revenue: 32000, bookings: 30, profit: 8000 },
  ];

  // Add missing recentActivity for the overview
  const recentActivity = [
    {
      id: 1,
      type: "event",
      action: "Created new event",
      event: "Corporate Annual Meeting",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "venue",
      action: "Venue booking confirmed",
      event: "Wedding Reception",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "service",
      action: "Service provider hired",
      event: "Birthday Party",
      timestamp: "1 day ago"
    }
  ];

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
    return `${service.name} - ${SERVICE_DESCRIPTIONS[service.description] || service.description || "Service"} - $${(service.price ?? service.pricePerHour ?? service.cost ?? 0)}${service.location ? ` (${service.location})` : ""}`;
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

  // Create booking request using API
  const createVenueBookingRequest = async (venueId, eventData, startTime, endTime) => {
    try {
      const bookingData = {
        startTime: startTime,
        endTime: endTime,
        venueId: parseInt(venueId),
        organizerId: "current-organizer-id", // Get from auth context
        eventId: eventData.id || null
      };
      
      const result = await bookVenue(bookingData);
      return result;
    } catch (error) {
      console.error("Error creating venue booking:", error);
      throw error;
    }
  };

  // Create service booking request using API
  const createServiceBookingRequest = async (serviceId, eventData, startTime, endTime) => {
    try {
      const bookingData = {
        startTime: startTime,
        endTime: endTime,
        currency: "USD",
        serviceId: parseInt(serviceId),
        organizerId: "current-organizer-id", // Get from auth context
        eventId: eventData.id || null
      };
      
      const result = await bookService(bookingData);
      return result;
    } catch (error) {
      console.error("Error creating service booking:", error);
      throw error;
    }
  };

    useEffect(() => {
    (async () => {
      try {
        const [v, s] = await Promise.all([getAllVenues(), getMyServices()]);
        // our APIs return arrays already; if a Page object ever comes back, unwrap its content
        const vv = Array.isArray(v) ? v : (v?.content ?? []);
        const ss = Array.isArray(s) ? s : (s?.content ?? []);
        setVenues(vv);
        setServices(ss);
        localStorage.setItem("venues", JSON.stringify(vv));
        localStorage.setItem("services", JSON.stringify(ss));
      } catch (e) {
        console.error("Failed to load venues/services from API", e);
      }
    })();
  }, []);
 // Add or Edit Event
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    
    const newEvent = {
      ...formEvent,
      id: editEventId || Date.now(),
      createdAt: new Date().toISOString()
    };

    try {
      // Create booking requests
      const requests = [];
      
      // Use combined booking if both venue and services are selected
      // Venue booking (optional)
      if (formEvent.venueId) {
        const startTime = `${formEvent.startTime}:00.000Z`;
        const endTime = `${formEvent.endTime}:00.000Z`;
        const venueBooking = await createVenueBookingRequest(
          formEvent.venueId,
          newEvent,
          startTime,
          endTime
        );
        requests.push(venueBooking);
      }
      // Service bookings (optional)
      if (formEvent.serviceIds && formEvent.serviceIds.length > 0) {
        const startTime = `${formEvent.startTime}:00.000Z`;
        const endTime = `${formEvent.endTime}:00.000Z`;
        for (const serviceId of formEvent.serviceIds) {
          try {
            const serviceBooking = await createServiceBookingRequest(
              serviceId,
              newEvent,
              startTime,
              endTime
            );
            requests.push(serviceBooking);
          } catch (error) {
            console.error(`Error booking service ${serviceId}:`, error);
          }
        }
      }

      if (editEventId) {
        setEvents(events.map(ev => ev.id === editEventId ? newEvent : ev));
      } else {
        setEvents([...events, newEvent]);
      }

      // Show confirmation message
      const requestCount = requests.length;
      const bookingType = (formEvent.venueId && formEvent.serviceIds && formEvent.serviceIds.length > 0)
        ? "multi-resource"
        : "individual";
      
      setAlerts([...alerts, {
        id: Date.now(),
        type: 'success',
        message: `Event created successfully! ${requestCount} ${bookingType} booking request(s) submitted through API.`,
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
    } catch (error) {
      console.error("Error submitting event:", error);
      setAlerts([...alerts, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to create booking requests. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    }
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
  }, [bookingRequests]); // Remove events from dependency to prevent infinite loop

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

  // Save edited event - fix form field name mismatch
  const handleSaveEvent = (e) => {
    e.preventDefault();
    setEvents(events.map(ev => ev.id === editEventId ? { 
      ...formEvent, 
      id: editEventId,
      venueId: formEvent.venueId,
      serviceIds: formEvent.serviceIds
    } : ev));
    setShowEdit(false);
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
  };

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
        Event Organizer Dashboard
      </h2>

      {/* Alerts Section */}
      <AlertsSection 
        alerts={alerts} 
        onDismissAlert={dismissAlert} 
      />

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

      {/* Event Form */}
      {showAdd && (
        <EventForm
          formEvent={formEvent}
          setFormEvent={setFormEvent}
          editEventId={editEventId}
          onSubmit={handleEventFormSubmit}
          onCancel={() => setShowAdd(false)}
          venues={venues}
          services={services}
          getAvailableVenues={getAvailableVenues}
          getAvailableServices={getAvailableServices}
          formatVenueDisplay={formatVenueDisplay}
          formatServiceDisplay={formatServiceDisplay}
          EVENT_TYPES={EVENT_TYPES}
          EVENT_TYPE_LABELS={EVENT_TYPE_LABELS}
        />
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
      <EventsTable
        filteredEvents={filteredEvents}
        EVENT_TYPE_LABELS={EVENT_TYPE_LABELS}
        getVenueName={getVenueName}
        getServiceNames={getServiceNames}
        onEditEvent={handleEditEvent}
        onCancelEvent={handleCancelEvent}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        showEdit={showEdit}
        formEvent={formEvent}
        setFormEvent={setFormEvent}
        venues={venues}
        services={services}
        onSave={handleSaveEvent}
        onClose={() => setShowEdit(false)}
        formatServiceDisplay={formatServiceDisplay}
      />
    </div>
  );
};

export default EventOrganizerDashboard;
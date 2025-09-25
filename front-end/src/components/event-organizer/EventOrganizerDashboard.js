import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./EventOrganizerDashboard.css";
import { initializeAllDummyData } from "../../utils/initializeDummyData";
import { createEvent, updateEvent, cancelEvent, getAllEvents, getEventsByOrganizer } from "../../api/eventApi";
import {
  bookVenue,
  bookService,
  confirmPayment,
  getVenueBookingsByEventId,
  getServiceBookingsByEventId,
  cancelVenueBooking,
  cancelServiceBooking
} from "../../api/bookingApi";
import { getAllVenues } from "../../api/venueApi";
import { getAllAvailableServices } from "../../api/serviceApi";

// Import new components
import EventForm from "./components/EventForm";
import EventsTable from "./components/EventsTable";
import EditEventModal from "./components/EditEventModal";
import AlertsSection from "./components/AlertsSection";
import CreateEvent from "./CreateEvent";
import MyEvents from "./MyEvents";
import BookVenues from "./BookVenues";
import BookServices from "./BookServices";
import EventOverview from "./EventOverview";

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


const initialEvents = [];

const EventOrganizerDashboard = () => {
  const location = useLocation();
  
  // Initialize all dummy data when component mounts
  useEffect(() => {
    const { events } = initializeAllDummyData();
    
    // If events were just initialized, update the state
    if (events && events.length > 0 && (!events.length || events.length !== JSON.parse(localStorage.getItem("organizerEvents") || "[]").length)) {
      setEvents(events);
    }
  }, []);

  // Load data from localStorage

  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("organizerEvents");
    return stored ? JSON.parse(stored) : initialEvents;
  });
  const [filter, setFilter] = useState("upcoming");

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("organizerEvents", JSON.stringify(events));
  }, [events]);

  // Load events from backend on mount
  useEffect(() => {
    const loadEventsFromApi = async () => {
      try {
        const data = await getEventsByOrganizer(0, 100);
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.data?.content ?? []);
        if (list && list.length >= 0) {
          setEvents(list);
        }
      } catch (error) {
        console.error("Error loading organizer events:", error);
      }
    };
    loadEventsFromApi();
  }, []);

  useEffect(() => {
    const loadVenuesAndServices = async () => {
      try {
        const [venuesData, servicesData] = await Promise.all([
          getAllVenues(),
          getAllAvailableServices()
        ]);
        
        console.log("Loaded venues:", venuesData);
        console.log("Loaded services:", servicesData);
        
        const venues = Array.isArray(venuesData) ? venuesData : (venuesData?.content ?? []);
        const services = Array.isArray(servicesData) ? servicesData : (servicesData?.content ?? []);
        
        const mockVenues = venues.length === 0 ? [
          {
            id: 1,
            name: "Grand Ballroom",
            location: "Downtown Convention Center",
            capacity: { minCapacity: 100, maxCapacity: 500 },
            pricing: { perEvent: 2000 },
            price: 2000
          },
          {
            id: 2,
            name: "Garden Pavilion",
            location: "City Park",
            capacity: { minCapacity: 50, maxCapacity: 200 },
            pricing: { perEvent: 1200 },
            price: 1200
          }
        ] : venues;
        
        const mockServices = services.length === 0 ? [
          {
            id: 1,
            name: "Premium Catering",
            type: "CATERING",
            price: 1000,
            servicesAreas: ["Downtown", "City Center"]
          },
          {
            id: 2,
            name: "Professional Photography",
            type: "PHOTOGRAPHY", 
            price: 800,
            servicesAreas: ["All Areas"]
          }
        ] : services;
        
        setAvailableVenues(mockVenues);
        setAvailableServices(mockServices);
      } catch (error) {
        console.error("Error loading venues and services:", error);

        setAvailableVenues([
          {
            id: 1,
            name: "Grand Ballroom",
            location: "Downtown Convention Center", 
            capacity: { minCapacity: 100, maxCapacity: 500 },
            pricing: { perEvent: 2000 },
            price: 2000
          },
          {
            id: 2,
            name: "Garden Pavilion",
            location: "City Park",
            capacity: { minCapacity: 50, maxCapacity: 200 },
            pricing: { perEvent: 1200 },
            price: 1200
          }
        ]);
        setAvailableServices([
          {
            id: 1,
            name: "Premium Catering",
            type: "CATERING",
            price: 1000,
            servicesAreas: ["Downtown", "City Center"]
          },
          {
            id: 2,
            name: "Professional Photography",
            type: "PHOTOGRAPHY",
            price: 800,
            servicesAreas: ["All Areas"]
          }
        ]);
      }
    };
    loadVenuesAndServices();
  }, []);

  useEffect(() => {
    const loadEventBookings = async () => {
      const bookingsMap = {};
      for (const event of events) {
        try {
          const [venueBookings, serviceBookings] = await Promise.all([
            getVenueBookingsByEventId(event.id).catch(() => []),
            getServiceBookingsByEventId(event.id).catch(() => [])
          ]);
          
          bookingsMap[event.id] = {
            venue: venueBookings || [],
            service: serviceBookings || []
          };
        } catch (error) {
          console.error(`Error loading bookings for event ${event.id}:`, error);
          bookingsMap[event.id] = {
            venue: [],
            service: []
          };
        }
      }
      setEventBookings(bookingsMap);
    };

    if (events.length > 0) {
      loadEventBookings();
    }
  }, [events]);

  useEffect(() => {
    const handleStripeReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const bookingType = urlParams.get('booking_type');  
      const canceled = urlParams.get('canceled') === 'true';
      
      if (sessionId && bookingType) {
        const pendingVenueBooking = localStorage.getItem('pendingVenueBooking');
        const pendingServiceBooking = localStorage.getItem('pendingServiceBooking');
        
        try {
          let eventId = '';
          
          if (bookingType === 'VENUE' && pendingVenueBooking) {
            const bookingInfo = JSON.parse(pendingVenueBooking);
            eventId = bookingInfo.eventId;
            localStorage.removeItem('pendingVenueBooking');
          } else if (bookingType === 'SERVICE' && pendingServiceBooking) {
            const bookingInfo = JSON.parse(pendingServiceBooking);
            eventId = bookingInfo.eventId;
            localStorage.removeItem('pendingServiceBooking');
          }
          
          if (eventId) {
            await confirmPayment(bookingType, sessionId, canceled);
            
            if (canceled) {
              setAlerts(prev => [...prev, {
                id: Date.now(),
                type: 'warning',
                message: `${bookingType.toLowerCase()} booking was canceled.`,
                timestamp: new Date().toISOString()
              }]);
            } else {
              setAlerts(prev => [...prev, {
                id: Date.now(),
                type: 'success',
                message: `${bookingType.toLowerCase()} booking completed successfully!`,
                timestamp: new Date().toISOString()
              }]);
            }
            
            try {
              const [venueBookings, serviceBookings] = await Promise.all([
                getVenueBookingsByEventId(eventId).catch(() => []),
                getServiceBookingsByEventId(eventId).catch(() => [])
              ]);
              
              setEventBookings(prev => ({
                ...prev,
                [eventId]: {
                  venue: venueBookings || [],
                  service: serviceBookings || []
                }
              }));
            } catch (error) {
              console.error("Error reloading bookings:", error);
            }
          }
        } catch (error) {
          console.error("Error confirming payment:", error);
          setAlerts(prev => [...prev, {
            id: Date.now(),
            type: 'error',
            message: 'Error processing payment confirmation. Please check your bookings.',
            timestamp: new Date().toISOString()
          }]);
        }
        
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleStripeReturn();
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [formEvent, setFormEvent] = useState({
    name: "",
    description: "",
    type: "",
    startTime: "",
    endTime: "",
    retailPrice: "",
    status: "DRAFT"
  });
  const [alerts, setAlerts] = useState([]);

  const [showVenueBookingModal, setShowVenueBookingModal] = useState(false);
  const [showServiceBookingModal, setShowServiceBookingModal] = useState(false);
  const [showEditVenueModal, setShowEditVenueModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);
  const [selectedVenueBooking, setSelectedVenueBooking] = useState(null);
  const [selectedServiceBookings, setSelectedServiceBookings] = useState([]);
  const [availableVenues, setAvailableVenues] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [eventBookings, setEventBookings] = useState({}); // Track bookings by event ID
  const [cancellationReason, setCancellationReason] = useState("requested_by_customer");
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationType, setCancellationType] = useState(null); // 'venue' or 'service'

 // Add or Edit Event
  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editEventId) {
        // Update existing event
        const updatedEvent = {
          ...formEvent,
          id: editEventId
        };
        await updateEvent(editEventId, formEvent);
        setEvents(events.map(ev => ev.id === editEventId ? updatedEvent : ev));
        
        setAlerts([...alerts, {
          id: Date.now(),
          type: 'success',
          message: `Event ${formEvent.name} updated successfully!`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        // Create new event
        const createdEvent = await createEvent(formEvent);
        const newEvent = {
          ...createdEvent,
          createdAt: new Date().toISOString()
        };
        setEvents([...events, newEvent]);
      
      setAlerts([...alerts, {
        id: Date.now(),
        type: 'success',
          message: `Event ${formEvent.name} created successfully!`,
        timestamp: new Date().toISOString()
      }]);
      }

      // Reset form
      setFormEvent({
        name: "",
        description: "",
        type: "",
        startTime: "",
        endTime: "",
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
        message: 'Failed to save event. Please try again.',
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
      retailPrice: event.retailPrice,
      status: event.status
    });
    setShowEdit(true);
  };

  // Delete Event
  const handleDeleteEvent = async (event) => {
    const confirmMessage = `Are you sure you want to delete this event? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await cancelEvent(event.id);

        // Remove event from local state
        setEvents(events.filter(ev => ev.id !== event.id));

        setAlerts([...alerts, {
          id: Date.now(),
          type: 'success',
          message: `Event "${event.name}" deleted successfully.`,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error("Error deleting event:", error);
        setAlerts([...alerts, {
          id: Date.now(),
          type: 'error',
          message: `Failed to delete event: ${error.message || 'Please try again.'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    }
  };

  // Handle venue booking
  const handleBookVenue = (event) => {
    // Check if venue is already booked (only check for non-cancelled bookings)
    const bookings = eventBookings[event.id] || { venue: [], service: [] };
    const activeVenueBookings = bookings.venue?.filter(booking =>
      booking.status !== 'CANCELLED' && booking.status !== 'CANCELLED_BY_CUSTOMER' && booking.status !== 'CANCELLED_BY_PROVIDER'
    ) || [];

    if (activeVenueBookings.length > 0) {
      alert("This event already has an active venue booking. Only one active venue per event is allowed. Please cancel the existing venue booking first.");
      return;
    }
    
    setSelectedEventForBooking(event);
    setShowVenueBookingModal(true);
  };

  // Handle service booking
  const handleBookService = (event) => {
    setSelectedEventForBooking(event);
    setShowServiceBookingModal(true);
  };

  // Handle edit venue booking
  const handleEditVenueBooking = (event, venueBooking) => {
    setSelectedEventForBooking(event);
    // Get all venue bookings for this event
    const allVenueBookings = eventBookings[event.id]?.venue || [];
    setSelectedVenueBooking(allVenueBookings);
    setShowEditVenueModal(true);
  };

  // Handle edit service bookings
  const handleEditServiceBookings = (event, serviceBookings) => {
    setSelectedEventForBooking(event);
    setSelectedServiceBookings(serviceBookings);
    setShowEditServiceModal(true);
  };

  const handleCancelWithReason = (booking, type) => {
    setBookingToCancel(booking);
    setCancellationType(type);
    setCancellationReason("requested_by_customer");
    setShowCancellationModal(true);
  };

  const confirmCancellation = async () => {
    if (!bookingToCancel || !cancellationType) return;

    const bookingId = bookingToCancel.id || bookingToCancel.bookingId || bookingToCancel.bookingID;

    try {
      if (cancellationType === 'venue') {
        await handleCancelVenueBooking(bookingId, cancellationReason);
      } else if (cancellationType === 'service') {
        await handleCancelServiceBooking(bookingId, cancellationReason);
      }

      setShowCancellationModal(false);
      setBookingToCancel(null);
      setCancellationType(null);
    } catch (error) {
      console.error("Error confirming cancellation:", error);
    }
  };

  // Handle venue booking cancellation
  const handleCancelVenueBooking = async (bookingId, reason = "requested_by_customer") => {
    try {
      if (!bookingId) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          message: 'Cannot cancel venue booking: missing booking ID.',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      console.log('Cancelling venue booking with ID:', bookingId, 'Reason:', reason);
      await cancelVenueBooking(bookingId, reason);
      
      // Reload bookings from server to get updated status
      try {
        const [venueBookings, serviceBookings] = await Promise.all([
          getVenueBookingsByEventId(selectedEventForBooking.id).catch(() => []),
          getServiceBookingsByEventId(selectedEventForBooking.id).catch(() => [])
        ]);

        setEventBookings(prev => ({
          ...prev,
          [selectedEventForBooking.id]: {
            venue: venueBookings || [],
            service: serviceBookings || []
          }
        }));

        setSelectedVenueBooking(venueBookings || []);
      } catch (reloadError) {
        console.error("Error reloading bookings after cancellation:", reloadError);
      }

      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Venue booking cancelled successfully! You can now book a new venue.',
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error("Error cancelling venue booking:", error);
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to cancel venue booking: ${error.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle venue booking deletion (frontend only - hide from display)
  const handleDeleteVenueBooking = (bookingId) => {
    if (!bookingId) {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Cannot delete venue booking: missing booking ID.',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    console.log('Hiding venue booking with ID:', bookingId, 'from frontend display');

    // Remove the booking from the frontend state (hide from display)
    setEventBookings(prev => ({
      ...prev,
      [selectedEventForBooking.id]: {
        ...prev[selectedEventForBooking.id],
        venue: prev[selectedEventForBooking.id]?.venue?.filter(booking =>
          booking.id !== bookingId && booking.bookingId !== bookingId && booking.bookingID !== bookingId
        ) || []
      }
    }));

    // Also update the selectedVenueBooking array to remove the hidden booking
    setSelectedVenueBooking(prev => {
      if (Array.isArray(prev)) {
        return prev.filter(booking =>
          booking.id !== bookingId && booking.bookingId !== bookingId && booking.bookingID !== bookingId
        );
      }
      return prev;
    });

    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Venue booking hidden from display! You can now book a new venue.',
      timestamp: new Date().toISOString()
    }]);
  };

  // Handle service booking cancellation
  const handleCancelServiceBooking = async (bookingId, reason = "requested_by_customer") => {
    try {
      if (!bookingId) {
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          message: 'Cannot cancel service booking: missing booking ID.',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      console.log('Cancelling service booking with ID:', bookingId, 'Reason:', reason);
      await cancelServiceBooking(bookingId, reason);
      
      // Reload bookings from server to get updated status
      try {
        const [venueBookings, serviceBookings] = await Promise.all([
          getVenueBookingsByEventId(selectedEventForBooking.id).catch(() => []),
          getServiceBookingsByEventId(selectedEventForBooking.id).catch(() => [])
        ]);

        setEventBookings(prev => ({
          ...prev,
          [selectedEventForBooking.id]: {
            venue: venueBookings || [],
            service: serviceBookings || []
          }
        }));

        // Update selected service bookings with fresh data
        const updatedServiceBookings = serviceBookings?.filter(booking =>
          selectedServiceBookings.some(selected =>
            selected.id === booking.id || selected.bookingId === booking.bookingId || selected.bookingID === booking.bookingID
          )
        ) || [];
        setSelectedServiceBookings(updatedServiceBookings);
      } catch (reloadError) {
        console.error("Error reloading bookings after cancellation:", reloadError);
      }

      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Service booking cancelled successfully!',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Error cancelling service booking:", error);
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: `Failed to cancel service booking: ${error.message || 'Please try again.'}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Handle service booking deletion (frontend only - hide from display)
  const handleDeleteServiceBooking = (bookingId) => {
    if (!bookingId) {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Cannot hide service booking: missing booking ID.',
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    console.log('Hiding service booking with ID:', bookingId, 'from frontend display');

    // Remove the booking from the frontend state (hide from display)
    setEventBookings(prev => ({
      ...prev,
      [selectedEventForBooking.id]: {
        ...prev[selectedEventForBooking.id],
        service: prev[selectedEventForBooking.id]?.service?.filter(booking =>
          booking.id !== bookingId && booking.bookingId !== bookingId && booking.bookingID !== bookingId
        ) || []
      }
    }));

    // Update selected service bookings to remove hidden one
    setSelectedServiceBookings(prev => prev.filter(booking =>
      booking.id !== bookingId && booking.bookingId !== bookingId && booking.bookingID !== bookingId
    ));

    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Service booking hidden from display!',
      timestamp: new Date().toISOString()
    }]);
  };

  // Handle venue selection and booking
  const handleVenueSelection = async (venue) => {
    if (!selectedEventForBooking) return;
    
    try {
      const bookingData = {
        startTime: selectedEventForBooking.startTime,
        endTime: selectedEventForBooking.endTime,
        currency: "USD",
        amount: venue.pricing?.perEvent || venue.price || 1000, // Use venue pricing
        isCaptured: false, // Reserve now, pay later workflow
        venueId: venue.id,
        eventId: selectedEventForBooking.id
      };

      const result = await bookVenue(bookingData);
      
      // Redirect to Stripe payment URL
      if (result.paymentUrl) {
        // Store the booking info for when user returns from Stripe
        localStorage.setItem('pendingVenueBooking', JSON.stringify({
          eventId: selectedEventForBooking.id,
          venueId: venue.id,
          bookingId: result.id || result.stripePaymentId,
          bookingType: 'VENUE'
        }));
        window.location.href = result.paymentUrl;
      } else {
        alert("Venue booking created successfully!");
        setShowVenueBookingModal(false);
        setSelectedEventForBooking(null);
        // Reload bookings
        const [venueBookings, serviceBookings] = await Promise.all([
          getVenueBookingsByEventId(selectedEventForBooking.id).catch(() => []),
          getServiceBookingsByEventId(selectedEventForBooking.id).catch(() => [])
        ]);
        
        setEventBookings(prev => ({
          ...prev,
          [selectedEventForBooking.id]: {
            venue: venueBookings || [],
            service: serviceBookings || []
          }
        }));
      }
    } catch (error) {
      console.error("Error booking venue:", error);
      alert("Failed to book venue. Please try again.");
    }
  };

  // Handle service selection and booking
  const handleServiceSelection = async (service) => {
    if (!selectedEventForBooking) return;

    try {
      const bookingData = {
        startTime: selectedEventForBooking.startTime,
        endTime: selectedEventForBooking.endTime,
        currency: "USD",
        amount: service.price || 500, // Use service pricing
        isCaptured: false, // Reserve now, pay later workflow
        serviceId: service.id,
        eventId: selectedEventForBooking.id
      };

      const result = await bookService(bookingData);

      // Redirect to Stripe payment URL
      if (result.paymentUrl) {
        // Store the booking info for when user returns from Stripe
        localStorage.setItem('pendingServiceBooking', JSON.stringify({
          eventId: selectedEventForBooking.id,
          serviceId: service.id,
          bookingId: result.id || result.stripePaymentId,
          bookingType: 'SERVICE'
        }));
        window.location.href = result.paymentUrl;
      } else {
        alert("Service booking created successfully!");
        setShowServiceBookingModal(false);
        setSelectedEventForBooking(null);
        // Reload bookings
        const [venueBookings, serviceBookings] = await Promise.all([
          getVenueBookingsByEventId(selectedEventForBooking.id).catch(() => []),
          getServiceBookingsByEventId(selectedEventForBooking.id).catch(() => [])
        ]);

        setEventBookings(prev => ({
          ...prev,
          [selectedEventForBooking.id]: {
            venue: venueBookings || [],
            service: serviceBookings || []
          }
        }));
      }
    } catch (error) {
      console.error("Error booking service:", error);
      alert("Failed to book service. Please try again.");
    }
  };

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
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      await updateEvent(editEventId, formEvent);
      const updatedEvent = { ...formEvent, id: editEventId };
      setEvents(events.map(ev => ev.id === editEventId ? updatedEvent : ev));
      
      setAlerts([...alerts, {
        id: Date.now(),
        type: 'success',
        message: `Event "${formEvent.name}" updated successfully!`,
        timestamp: new Date().toISOString()
      }]);
      
    setShowEdit(false);
    setEditEventId(null);
    setFormEvent({
      name: "",
      description: "",
      type: "",
      startTime: "",
      endTime: "",
      retailPrice: "",
      status: "DRAFT"
    });
    } catch (error) {
      console.error("Error updating event:", error);
      setAlerts([...alerts, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to update event. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const isMainDashboard = location.pathname === '/organizer' || location.pathname === '/organizer/';

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      {/* Show main dashboard content only on root organizer path */}
      {isMainDashboard && (
        <>
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
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onBookVenue={handleBookVenue}
            onBookService={handleBookService}
            onEditVenueBooking={handleEditVenueBooking}
            onEditServiceBookings={handleEditServiceBookings}
            eventBookings={eventBookings}
          />

      {/* Edit Event Modal */}
      <EditEventModal
        showEdit={showEdit}
        formEvent={formEvent}
        setFormEvent={setFormEvent}
        onSave={handleSaveEvent}
        onClose={() => setShowEdit(false)}
          />
        </>
      )}

      {/* Venue Booking Modal */}
      {showVenueBookingModal && selectedEventForBooking && (
        <div className="modal-overlay" onClick={() => setShowVenueBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Book Venue for: {selectedEventForBooking.name}</h4>
              <button className="modal-close" onClick={() => setShowVenueBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h5>Event Details</h5>
                <p><strong>Event:</strong> {selectedEventForBooking.name}</p>
                <p><strong>Start:</strong> {new Date(selectedEventForBooking.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(selectedEventForBooking.endTime).toLocaleString()}</p>
              </div>
              
              <div>
                <h5>Select a Venue</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0 }}>
                    Found {availableVenues.length} venues
                  </p>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    onClick={async () => {
                      try {
                        const venuesData = await getAllVenues();
                        const venues = Array.isArray(venuesData) ? venuesData : (venuesData?.content ?? []);
                        setAvailableVenues(venues.length > 0 ? venues : [
                          {
                            id: 1,
                            name: "Grand Ballroom",
                            location: "Downtown Convention Center",
                            capacity: { minCapacity: 100, maxCapacity: 500 },
                            pricing: { perEvent: 2000 },
                            price: 2000
                          },
                          {
                            id: 2,
                            name: "Garden Pavilion", 
                            location: "City Park",
                            capacity: { minCapacity: 50, maxCapacity: 200 },
                            pricing: { perEvent: 1200 },
                            price: 1200
                          }
                        ]);
                      } catch (error) {
                        console.error("Error refreshing venues:", error);
                      }
                    }}
                  >
                    Refresh
                  </button>
                </div>
                {availableVenues.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ color: '#6c757d', fontStyle: 'italic', marginBottom: '1rem' }}>No venues available</p>
                    <p style={{ fontSize: '0.9rem', color: '#495057' }}>
                      To book venues, you need venues created by venue providers.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.open('/venue-provider', '_blank')}
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      Create Venues (Venue Provider)
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {availableVenues.map(venue => (
                      <div key={venue.id} className="card" style={{ padding: '1rem', cursor: 'pointer', border: selectedVenue?.id === venue.id ? '2px solid #3b82f6' : '1px solid #e9ecef' }}
                           onClick={() => setSelectedVenue(venue)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h6 style={{ margin: 0, color: '#2c3e50' }}>{venue.name}</h6>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>📍 {venue.location}</p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              👥 Capacity: {venue.capacity?.minCapacity || 0}-{venue.capacity?.maxCapacity || 0}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold' }}>
                              ${venue.pricing?.perEvent || venue.price || 1000}
                            </p>
                            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.8rem' }}>per event</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  className="event-btn success"
                  onClick={() => handleVenueSelection(selectedVenue)}
                  disabled={!selectedVenue}
                >
                  Proceed to Payment
                </button>
                <button
                  className="event-btn secondary"
                  onClick={() => {
                    setShowVenueBookingModal(false);
                    setSelectedVenue(null);
                    setSelectedEventForBooking(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Booking Modal */}
      {showServiceBookingModal && selectedEventForBooking && (
        <div className="modal-overlay" onClick={() => setShowServiceBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Book Service for: {selectedEventForBooking.name}</h4>
              <button className="modal-close" onClick={() => setShowServiceBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h5>Event Details</h5>
                <p><strong>Event:</strong> {selectedEventForBooking.name}</p>
                <p><strong>Start:</strong> {new Date(selectedEventForBooking.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(selectedEventForBooking.endTime).toLocaleString()}</p>
              </div>
              
              <div>
                <h5>Select a Service</h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0 }}>
                    Found {availableServices.length} services
                  </p>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    onClick={async () => {
                      try {
                        const servicesData = await getAllAvailableServices();
                        const services = Array.isArray(servicesData) ? servicesData : (servicesData?.content ?? []);
                        setAvailableServices(services.length > 0 ? services : [
                          {
                            id: 1,
                            name: "Premium Catering",
                            type: "CATERING",
                            price: 1000,
                            servicesAreas: ["Downtown", "City Center"]
                          },
                          {
                            id: 2,
                            name: "Professional Photography",
                            type: "PHOTOGRAPHY", 
                            price: 800,
                            servicesAreas: ["All Areas"]
                          }
                        ]);
                      } catch (error) {
                        console.error("Error refreshing services:", error);
                      }
                    }}
                  >
                    Refresh
                  </button>
                </div>
                {availableServices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ color: '#6c757d', fontStyle: 'italic', marginBottom: '1rem' }}>No services available</p>
                    <p style={{ fontSize: '0.9rem', color: '#495057' }}>
                      To book services, you need services created by service providers.
                    </p>
                    <button 
                      className="btn btn-success"
                      onClick={() => window.open('/service-provider', '_blank')}
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      Create Services (Service Provider)
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                    {availableServices.map(service => (
                      <div key={service.id} className="card" style={{ padding: '1rem', cursor: 'pointer', border: selectedService?.id === service.id ? '2px solid #28a745' : '1px solid #e9ecef' }}
                           onClick={() => setSelectedService(service)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h6 style={{ margin: 0, color: '#2c3e50' }}>{service.name}</h6>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              🏷️ {service.type || 'Service'}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              📍 {Array.isArray(service.servicesAreas) ? service.servicesAreas.join(', ') : service.location || 'Multiple locations'}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold' }}>
                              ${service.price || 500}
                            </p>
                            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.8rem' }}>per service</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  className="event-btn success"
                  onClick={() => handleServiceSelection(selectedService)}
                  disabled={!selectedService}
                >
                  Proceed to Payment
                </button>
                <button
                  className="event-btn secondary"
                  onClick={() => {
                    setShowServiceBookingModal(false);
                    setSelectedService(null);
                    setSelectedEventForBooking(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Venue Booking Modal */}
      {showEditVenueModal && selectedEventForBooking && selectedVenueBooking && Array.isArray(selectedVenueBooking) && (
        <div className="modal-overlay" onClick={() => setShowEditVenueModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Manage Venue Bookings for: {selectedEventForBooking.name}</h4>
              <button className="modal-close" onClick={() => setShowEditVenueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5>All Venue Bookings ({selectedVenueBooking.length})</h5>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowEditVenueModal(false);
                      handleBookVenue(selectedEventForBooking);
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Add New Venue
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedVenueBooking.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <p style={{ color: '#6c757d', fontStyle: 'italic', marginBottom: '1rem' }}>No venue bookings found</p>
                      <p style={{ fontSize: '0.9rem', color: '#495057' }}>
                        Click "Add New Venue" to book a venue for this event.
                      </p>
                    </div>
                  ) : (
                    selectedVenueBooking.map((booking, index) => (
                      <div key={booking.id || booking.bookingId || booking.bookingID || index} className="card" style={{ padding: '1rem', border: '1px solid #e9ecef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h6 style={{ margin: 0, color: '#2c3e50' }}>Venue ID: {booking.venueId}</h6>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              <strong>Booking ID:</strong> {booking.id || booking.bookingId || booking.bookingID || 'Not found'}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              Status: <span className={`status-badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              Amount: ${booking.amount}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              Start: {new Date(booking.startTime).toLocaleString()}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              End: {new Date(booking.endTime).toLocaleString()}
                            </p>
                            {booking.stripePaymentId && (
                              <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.8rem' }}>
                                Payment ID: {booking.stripePaymentId}
                              </p>
                            )}
                          </div>
                          <div>
                            {(() => {
                              const isCancelled = booking.status === 'CANCELLED' ||
                                                booking.status === 'CANCELLED_BY_CUSTOMER' ||
                                                booking.status === 'CANCELLED_BY_PROVIDER';

                              if (isCancelled) {
                                // Show Hide button for cancelled bookings
                                return (
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to hide this cancelled venue booking from the display? This action cannot be undone.')) {
                                        const bid = booking?.id ?? booking?.bookingId ?? booking?.bookingID;
                                        if (bid) {
                                          handleDeleteVenueBooking(bid);
                                        } else {
                                          alert('Cannot hide booking: missing booking ID');
                                        }
                                      }
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                  >
                                    Hide
                                  </button>
                                );
                              } else {
                                // Show Cancel button for active bookings
                                return (
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleCancelWithReason(booking, 'venue')}
                                    style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                  >
                                    Cancel
                                  </button>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => {
                    setShowEditVenueModal(false);
                    setSelectedVenueBooking(null);
                    setSelectedEventForBooking(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Bookings Modal */}
      {showEditServiceModal && selectedEventForBooking && selectedServiceBookings.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowEditServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Manage Service Bookings for: {selectedEventForBooking.name}</h4>
              <button className="modal-close" onClick={() => setShowEditServiceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h5>Current Service Bookings ({selectedServiceBookings.length})</h5>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowEditServiceModal(false);
                      handleBookService(selectedEventForBooking);
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Add New Service
                  </button>
                </div>
                
                <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {selectedServiceBookings.map(booking => (
                      <div key={booking.id} className="card" style={{ padding: '1rem', border: '1px solid #e9ecef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h6 style={{ margin: 0, color: '#2c3e50' }}>Service ID: {booking.serviceId}</h6>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              <strong>Booking ID:</strong> {booking.id || booking.bookingId || booking.bookingID || 'Not found'}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              Status: <span className={`status-badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                              Amount: ${booking.amount}
                            </p>
                            {booking.stripePaymentId && (
                              <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.8rem' }}>
                                Payment ID: {booking.stripePaymentId}
                              </p>
                            )}
                          </div>
                        <div>
                          {(() => {
                            const isCancelled = booking.status === 'CANCELLED' ||
                                              booking.status === 'CANCELLED_BY_CUSTOMER' ||
                                              booking.status === 'CANCELLED_BY_PROVIDER';

                            if (isCancelled) {
                              // Show Hide button for cancelled bookings
                              return (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to hide this cancelled service booking from the display? This action cannot be undone.')) {
                                      const bid = booking?.id ?? booking?.bookingId ?? booking?.bookingID;
                                      if (bid) {
                                        handleDeleteServiceBooking(bid);
                                      } else {
                                        alert('Cannot hide booking: missing booking ID');
                                      }
                                    }
                                  }}
                                  style={{ padding: '4px 8px', fontSize: '0.7rem', backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                >
                                  Hide
                                </button>
                              );
                            } else {
                              // Show Cancel button for active bookings
                              return (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleCancelWithReason(booking, 'service')}
                                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                >
                                  Cancel
                                </button>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => {
                    setShowEditServiceModal(false);
                    setSelectedServiceBookings([]);
                    setSelectedEventForBooking(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {showCancellationModal && bookingToCancel && (
        <div className="modal-overlay" onClick={() => setShowCancellationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Cancel {cancellationType === 'venue' ? 'Venue' : 'Service'} Booking</h4>
              <button className="modal-close" onClick={() => setShowCancellationModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <h5>Booking Details</h5>
                <p><strong>Booking ID:</strong> {bookingToCancel.id || bookingToCancel.bookingId || bookingToCancel.bookingID || 'Not found'}</p>
                {cancellationType === 'venue' ? (
                  <p><strong>Venue ID:</strong> {bookingToCancel.venueId}</p>
                ) : (
                  <p><strong>Service ID:</strong> {bookingToCancel.serviceId}</p>
                )}
                <p><strong>Amount:</strong> ${bookingToCancel.amount}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Cancellation Reason *</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="requested_by_customer">Requested by Customer</option>
                  <option value="duplicate">Duplicate Booking</option>
                  <option value="fraudulent">Fraudulent Booking</option>
                </select>
              </div>

              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                <h6 style={{ margin: '0 0 0.5rem 0', color: '#dc3545' }}>⚠️ Warning</h6>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>
                  This action cannot be undone. The booking will be permanently cancelled and you will be able to book a new {cancellationType === 'venue' ? 'venue' : 'service'}.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="event-btn danger"
                onClick={confirmCancellation}
              >
                Confirm Cancellation
              </button>
              <button
                className="event-btn secondary"
                onClick={() => setShowCancellationModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routes for sub-components */}
      <Routes>
        <Route path="/" element={<EventOverview />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="my-events" element={<MyEvents />} />
        <Route path="book-venues" element={<BookVenues />} />
        <Route path="book-services" element={<BookServices />} />
      </Routes>
    </div>
  );
};

export default EventOrganizerDashboard;
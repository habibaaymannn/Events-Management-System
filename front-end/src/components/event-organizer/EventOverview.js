import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEventsByOrganizer } from "../../api/eventApi";
import { getBookingsByEventId } from "../../api/bookingApi";
import "./EventOverview.css";

const EventOverview = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookingsStats, setBookingsStats] = useState({
    totalBookings: 0,
    venueBookings: 0,
    serviceBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0
  });


  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getEventsByOrganizer(0, 100);
      const eventsData = response.content || [];
      setEvents(eventsData);
      
      // Load booking statistics for all events
      await loadBookingsStats(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadBookingsStats = async (eventsData) => {
    try {
      let totalBookings = 0;
      let venueBookings = 0;
      let serviceBookings = 0;
      let pendingBookings = 0;
      let confirmedBookings = 0;

      for (const event of eventsData) {
        try {
          const bookings = await getBookingsByEventId(event.id);
          totalBookings += bookings.length;
          
          bookings.forEach(booking => {
            if (booking.type === 'VENUE') venueBookings++;
            if (booking.type === 'SERVICE') serviceBookings++;
            if (booking.status === 'PENDING') pendingBookings++;
            if (booking.status === 'ACCEPTED' || booking.status === 'CONFIRMED') confirmedBookings++;
          });
        } catch (error) {
          console.error(`Error loading bookings for event ${event.id}:`, error);
        }
      }

      setBookingsStats({
        totalBookings,
        venueBookings,
        serviceBookings,
        pendingBookings,
        confirmedBookings
      });
    } catch (error) {
      console.error("Error loading bookings stats:", error);
    }
  };

  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === "Upcoming").length;
  const completedEvents = events.filter(e => e.status === "Completed").length;
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const totalExpenses = events.reduce((sum, e) => sum + e.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const statusData = [
    { name: "Upcoming", value: upcomingEvents, color: "#667eea" },
    { name: "Completed", value: completedEvents, color: "#28a745" },
    { name: "Planning", value: events.filter(e => e.status === "Planning").length, color: "#ffc107" },
    { name: "Cancelled", value: events.filter(e => e.status === "Cancelled").length, color: "#dc3545" },
  ];

  const eventTypes = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});

  const handleCreateEvent = () => navigate('/event-organizer/create-event');
  const handleMyEvents = () => navigate('/event-organizer/my-events');
  const handleBookVenues = () => navigate('/event-organizer/book-venues');
  const handleBookServices = () => navigate('/event-organizer/book-services');

};

export default EventOverview;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEvents, getEventsByType, getEventsByOrganizer } from "../../api/eventApi";
import { getBookingsByEventId } from "../../api/bookingApi";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
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

  const monthlyData = [
    { month: "Jan", revenue: 15000, bookings: 12, profit: 3000 },
    { month: "Feb", revenue: 18000, bookings: 15, profit: 4000 },
    { month: "Mar", revenue: 22000, bookings: 18, profit: 5000 },
    { month: "Apr", revenue: 25000, bookings: 20, profit: 6000 },
    { month: "May", revenue: 28000, bookings: 25, profit: 7000 },
    { month: "Jun", revenue: 32000, bookings: 30, profit: 8000 },
  ];

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

  return (
    <div className="event-overview">
      {/* Header */}
      <div className="overview-header">
        <h2 className="overview-title">Event Organizer Dashboard</h2>
        <p className="overview-subtitle">Plan, manage, and execute successful events</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card clickable-stat" onClick={handleMyEvents}>
          <div className="stat-icon events-icon">📅</div>
          <div className="stat-content">
            <h3 className="stat-number">{totalEvents}</h3>
            <p className="stat-label">Total Events</p>
            <span className="stat-link">Manage Events →</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon upcoming-icon">🚀</div>
          <div className="stat-content">
            <h3 className="stat-number">{upcomingEvents}</h3>
            <p className="stat-label">Upcoming Events</p>
            <span className="stat-change positive">Ready to execute</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-number">{bookingsStats.totalBookings}</h3>
            <p className="stat-label">Total Bookings</p>
            <span className="stat-change positive">{bookingsStats.confirmedBookings} confirmed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon profit-icon">📈</div>
          <div className="stat-content">
            <h3 className="stat-number">{Math.round((totalProfit / totalRevenue) * 100)}%</h3>
            <p className="stat-label">Profit Margin</p>
            <span className="stat-change positive">Strong performance</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Event Status Distribution */}
        <div className="chart-card">
          <h4 className="chart-title">Event Status Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Distribution */}
        <div className="chart-card">
          <h4 className="chart-title">Booking Status Overview</h4>
          <div className="booking-stats-grid">
            <div className="booking-stat">
              <div className="stat-number">{bookingsStats.venueBookings}</div>
              <div className="stat-label">Venue Bookings</div>
            </div>
            <div className="booking-stat">
              <div className="stat-number">{bookingsStats.serviceBookings}</div>
              <div className="stat-label">Service Bookings</div>
            </div>
            <div className="booking-stat">
              <div className="stat-number">{bookingsStats.pendingBookings}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="booking-stat">
              <div className="stat-number">{bookingsStats.confirmedBookings}</div>
              <div className="stat-label">Confirmed</div>
            </div>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="chart-card">
          <h4 className="chart-title">Monthly Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#667eea" name="Revenue ($)" />
              <Bar dataKey="profit" fill="#28a745" name="Profit ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="section-header">
          <h4 className="section-title">Recent Activity</h4>
          <button className="view-all-btn" onClick={handleMyEvents}>
            View All Events →
          </button>
        </div>

        <div className="activity-grid">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-icon">
                {activity.type === "venue" && "🏢"}
                {activity.type === "service" && "🛠️"}
                {activity.type === "event" && "🎉"}
              </div>
              <div className="activity-content">
                <h5 className="activity-title">{activity.action}</h5>
                <p className="activity-event">{activity.event}</p>
                <span className="activity-time">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Quick View */}
      <div className="upcoming-events-section">
        <h4 className="section-title">Upcoming Events</h4>
        <div className="events-grid">
          {events.filter(e => e.status === "Upcoming").map((event) => (
            <div key={event.id} className="event-quick-card">
              <div className="event-header">
                <h5 className="event-name">{event.name}</h5>
                <span className={`event-status ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </div>
              <div className="event-details">
                <p className="event-date">📅 {event.date}</p>
                <p className="event-type">🏷️ {event.type}</p>
                <p className="event-attendees">👥 {event.attendees} attendees</p>
              </div>
              <div className="event-financials">
                <div className="financial-item">
                  <span className="financial-label">Revenue</span>
                  <span className="financial-value">${event.revenue.toLocaleString()}</span>
                </div>
                <div className="financial-item">
                  <span className="financial-label">Profit</span>
                  <span className="financial-value profit">${(event.revenue - event.expenses).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h4 className="section-title">Quick Actions</h4>
        <div className="quick-actions-grid">
          <button className="action-card primary" onClick={handleCreateEvent}>
            <div className="action-icon">🎯</div>
            <div className="action-content">
              <h5>Create New Event</h5>
              <p>Start planning your next event</p>
            </div>
          </button>

          <button className="action-card" onClick={handleBookVenues}>
            <div className="action-icon">🏢</div>
            <div className="action-content">
              <h5>Book Venues</h5>
              <p>Find and reserve event venues</p>
            </div>
          </button>

          <button className="action-card" onClick={handleBookServices}>
            <div className="action-icon">🛠️</div>
            <div className="action-content">
              <h5>Book Services</h5>
              <p>Hire service providers</p>
            </div>
          </button>

          <button className="action-card" onClick={handleMyEvents}>
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h5>Event Analytics</h5>
              <p>View detailed reports</p>
            </div>
          </button>
        </div>
      </div>

      {/* Event Type Breakdown */}
      <div className="event-types-section">
        <h4 className="section-title">Event Categories</h4>
        <div className="event-types-grid">
          {Object.entries(eventTypes).map(([type, count]) => (
            <div key={type} className="event-type-card">
              <div className="event-type-icon">
                {type === "Corporate" && "💼"}
                {type === "Wedding" && "💒"}
                {type === "Charity" && "❤️"}
                {type === "Private" && "🎪"}
              </div>
              <div className="event-type-content">
                <h5>{type}</h5>
                <p>{count} events</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventOverview;
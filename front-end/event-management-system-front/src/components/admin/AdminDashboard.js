import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    users: {
      admins: 0,
      eventOrganizers: 0,
      eventAttendees: 0,
      serviceProviders: 0,
      venueProviders: 0
    },
    events: {
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0
    },
    venues: [],
    services: [],
    eventTypes: {},
    dailyStats: {
      bookings: 0,
      cancellations: 0
    },
    revenueByOrganizer: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load all data
    const venues = JSON.parse(localStorage.getItem("venues") || "[]");
    const services = JSON.parse(localStorage.getItem("services") || "[]");
    const organizerEvents = JSON.parse(localStorage.getItem("organizerEvents") || "[]");
    const attendeeEvents = JSON.parse(localStorage.getItem("myEvents") || "[]");
    const users = JSON.parse(localStorage.getItem("systemUsers") || "[]");
    const bookingRequests = JSON.parse(localStorage.getItem("bookingRequests") || "[]");

    // Combine all events
    const allEvents = [...organizerEvents, ...attendeeEvents];

    // Calculate event stats
    const now = new Date();
    const eventStats = {
      upcoming: allEvents.filter(e => new Date(e.startTime || e.date) > now && e.status !== "CANCELLED").length,
      ongoing: allEvents.filter(e => {
        const start = new Date(e.startTime || e.date);
        const end = new Date(e.endTime || e.date);
        return start <= now && end >= now && e.status !== "CANCELLED";
      }).length,
      completed: allEvents.filter(e => new Date(e.endTime || e.date) < now && e.status !== "CANCELLED").length,
      cancelled: allEvents.filter(e => e.status === "CANCELLED").length
    };

    // Calculate user stats
    const userStats = {
      admins: users.filter(u => u.role === 'admin').length || 1,
      eventOrganizers: users.filter(u => u.role === 'event-organizer').length,
      eventAttendees: users.filter(u => u.role === 'event-attendee').length,
      serviceProviders: users.filter(u => u.role === 'service-provider').length,
      venueProviders: users.filter(u => u.role === 'venue-provider').length
    };

    // Calculate event type distribution - fix null reference
    const eventTypes = {};
    allEvents.forEach(event => {
      if (event && event.type) {
        eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
      }
    });

    // Calculate daily stats (today)
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookingRequests.filter(req => 
      req.createdAt && req.createdAt.startsWith(today)
    ).length;
    const todayCancellations = allEvents.filter(e => 
      e.cancelledAt && e.cancelledAt.startsWith(today)
    ).length;

    // Calculate revenue by organizer - fix null reference
    const revenueByOrganizer = {};
    organizerEvents.forEach(event => {
      if (event && event.retailPrice) {
        const organizer = event.organizer || 'Event Organizer';
        revenueByOrganizer[organizer] = (revenueByOrganizer[organizer] || 0) + (parseFloat(event.retailPrice) || 0);
      }
    });

    setDashboardData({
      users: userStats,
      events: eventStats,
      venues,
      services,
      eventTypes,
      dailyStats: {
        bookings: todayBookings,
        cancellations: todayCancellations
      },
      revenueByOrganizer: Object.entries(revenueByOrganizer || {}).map(([name, revenue]) => ({
        name,
        revenue
      }))
    });
  };

  // Calculate utilization rates
  const venueUtilization = dashboardData.venues.length > 0 
    ? Math.round((dashboardData.venues.filter(v => v.bookings && v.bookings.length > 0).length / dashboardData.venues.length) * 100)
    : 0;
  
  const serviceUtilization = dashboardData.services.length > 0
    ? Math.round((dashboardData.services.filter(s => s.bookings && s.bookings.length > 0).length / dashboardData.services.length) * 100)
    : 0;

  // Prepare chart data
  const eventStatusData = [
    { name: "Upcoming", value: dashboardData.events.upcoming, color: "#ffc107" },
    { name: "Ongoing", value: dashboardData.events.ongoing, color: "#28a745" },
    { name: "Completed", value: dashboardData.events.completed, color: "#6c757d" },
    { name: "Cancelled", value: dashboardData.events.cancelled, color: "#dc3545" }
  ].filter(item => item.value > 0);

  const eventTypeData = Object.entries(dashboardData.eventTypes || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count
  }));

  // Check if we're on the main dashboard
  const isMainDashboard = location.pathname === '/' || location.pathname === '';

  return (
    <Routes>
      <Route path="user-management" element={<UserManagement />} />
      <Route path="event-monitoring" element={<EventMonitoring />} />
      <Route path="/" element={
        <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
          <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
            System Admin Dashboard
          </h2>
          <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
            Monitor and control the entire event management system
          </p>
          
          {/* Navigation Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div
              className="card text-center"
              style={{ cursor: 'pointer', border: '2px solid #3b82f6', transition: 'all 0.3s ease' }}
              onClick={() => navigate('/user-management')}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <h3 className="text-primary">{Object.values(dashboardData.users).reduce((a, b) => a + b, 0)}</h3>
              <p className="text-muted">Total Users</p>
              <small className="text-primary">Click to manage users →</small>
            </div>
            <div
              className="card text-center"
              style={{ cursor: 'pointer', border: '2px solid #28a745', transition: 'all 0.3s ease' }}
              onClick={() => navigate('/event-monitoring')}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <h3 className="text-success">{Object.values(dashboardData.events).reduce((a, b) => a + b, 0)}</h3>
              <p className="text-muted">Total Events</p>
              <small className="text-success">Click to manage events →</small>
            </div>
          </div>

          {/* Total Events by Status - Pie Chart */}
          <div className="card mb-4">
            <h4 className="mb-3">Total Events by Status</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'center' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                <div className="status-badge status-pending">
                  Upcoming: {dashboardData.events.upcoming}
                </div>
                <div className="status-badge status-confirmed">
                  Ongoing: {dashboardData.events.ongoing}
                </div>
                <div className="status-badge status-completed">
                  Completed: {dashboardData.events.completed}
                </div>
                <div className="status-badge status-cancelled">
                  Cancelled: {dashboardData.events.cancelled}
                </div>
              </div>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="card mb-4">
            <h4 className="mb-3">User Breakdown</h4>
            <table className="table">
              <tbody>
                <tr>
                  <td>Admins</td>
                  <td className="text-right fw-bold">{dashboardData.users.admins}</td>
                </tr>
                <tr>
                  <td>Event Organizers</td>
                  <td className="text-right fw-bold">{dashboardData.users.eventOrganizers}</td>
                </tr>
                <tr>
                  <td>Event Attendees</td>
                  <td className="text-right fw-bold">{dashboardData.users.eventAttendees}</td>
                </tr>
                <tr>
                  <td>Service Providers</td>
                  <td className="text-right fw-bold">{dashboardData.users.serviceProviders}</td>
                </tr>
                <tr>
                  <td>Venue Providers</td>
                  <td className="text-right fw-bold">{dashboardData.users.venueProviders}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Utilization Rates and statistics cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="card text-center">
              <h3 className="text-warning">{venueUtilization}%</h3>
              <p className="text-muted">Venue Utilization Rate</p>
              <small>({dashboardData.venues.filter(v => v.bookings && v.bookings.length > 0).length} of {dashboardData.venues.length} venues booked)</small>
            </div>
            <div className="card text-center">
              <h3 className="text-danger">{serviceUtilization}%</h3>
              <p className="text-muted">Service Providers Utilization Rate</p>
              <small>({dashboardData.services.filter(s => s.bookings && s.bookings.length > 0).length} of {dashboardData.services.length} services booked)</small>
            </div>
            {/* Event Type Distribution Statistic */}
            <div className="card text-center">
              <h3 className="text-primary">{eventTypeData.reduce((a, b) => a + b.count, 0)}</h3>
              <p className="text-muted">Event Type Distribution</p>
              <small>
                {eventTypeData.map(et => `${et.name}: ${et.count}`).join(', ') || 'No event types'}
              </small>
            </div>
            {/* Revenue per Organizer Statistic */}
            <div className="card text-center">
              <h3 className="text-success">
                ${dashboardData.revenueByOrganizer.reduce((a, b) => a + b.revenue, 0).toLocaleString()}
              </h3>
              <p className="text-muted">Total Revenue (Organizers)</p>
              <small>
                {dashboardData.revenueByOrganizer.map(ro => `${ro.name}: $${ro.revenue.toLocaleString()}`).join(', ') || 'No revenue'}
              </small>
            </div>
          </div>

          {/* Daily Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="card text-center">
              <h4 className="text-success">{dashboardData.dailyStats.bookings}</h4>
              <p className="text-muted">Daily Booking Count</p>
            </div>
            <div className="card text-center">
              <h4 className="text-danger">{dashboardData.dailyStats.cancellations}</h4>
              <p className="text-muted">Daily Cancellation Count</p>
            </div>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default AdminDashboard;
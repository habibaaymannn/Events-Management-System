import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import "./AdminDashboard.css";
import { getAdminDashboard } from "../../api/adminApi";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboard();
      
      
      setDashboardData({
        users: data.users || {
          admins: 0,
          eventOrganizers: 0,
          eventAttendees: 0,
          serviceProviders: 0,
          venueProviders: 0
        },
        events: data.events || {
          upcoming: 0,
          ongoing: 0,
          completed: 0,
          cancelled: 0
        },
        venues: Array.isArray(data.venues) ? data.venues : [],
        services: Array.isArray(data.services) ? data.services : [],
        eventTypes: data.eventTypes || {},
        dailyStats: data.dailyStats || {
          bookings: 0,
          cancellations: 0
        },
        revenueByOrganizer: Array.isArray(data.revenueByOrganizer) ? data.revenueByOrganizer : []
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
      // Keep default data structure on error
    } finally {
      setLoading(false);
    }
  };

  
  const venueUtilization = dashboardData.venues && dashboardData.venues.length > 0 
    ? Math.round((dashboardData.venues.filter(v => v.bookings && v.bookings.length > 0).length / dashboardData.venues.length) * 100)
    : 0;
  
  const serviceUtilization = dashboardData.services && dashboardData.services.length > 0
    ? Math.round((dashboardData.services.filter(s => s.bookings && s.bookings.length > 0).length / dashboardData.services.length) * 100)
    : 0;

 
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

  
  const isMainDashboard = location.pathname === '/' || location.pathname === '/admin' || location.pathname === '';

  
  useEffect(() => {
    if (isMainDashboard && location.pathname !== '/') {
      console.log("Redirecting to main admin dashboard");
    }
  }, [location.pathname, isMainDashboard]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error Loading Dashboard</h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            Unable to fetch dashboard data: {error}
          </p>
          <button 
            onClick={loadDashboardData} 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      {/* Only show this if we're not on a sub-route */}
      {isMainDashboard && (
        <>
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
              <small>
                ({dashboardData.venues ? dashboardData.venues.filter(v => v.bookings && v.bookings.length > 0).length : 0} of {dashboardData.venues ? dashboardData.venues.length : 0} venues booked)
              </small>
            </div>
            <div className="card text-center">
              <h3 className="text-danger">{serviceUtilization}%</h3>
              <p className="text-muted">Service Providers Utilization Rate</p>
              <small>
                ({dashboardData.services ? dashboardData.services.filter(s => s.bookings && s.bookings.length > 0).length : 0} of {dashboardData.services ? dashboardData.services.length : 0} services booked)
              </small>
            </div>
            {/* Event Type Distribution Statistic */}
            <div className="card text-center">
              <h3 className="text-primary">{eventTypeData.reduce((a, b) => a + (b.count || 0), 0)}</h3>
              <p className="text-muted">Event Type Distribution</p>
              <small>
                {eventTypeData.map(et => `${et.name}: ${et.count}`).join(', ') || 'No event types'}
              </small>
            </div>
            {/* Revenue per Organizer Statistic */}
            <div className="card text-center">
              <h3 className="text-success">
                ${dashboardData.revenueByOrganizer ? dashboardData.revenueByOrganizer.reduce((a, b) => a + (b.revenue || 0), 0).toLocaleString() : '0'}
              </h3>
              <p className="text-muted">Total Revenue (Organizers)</p>
              <small>
                {dashboardData.revenueByOrganizer && dashboardData.revenueByOrganizer.length > 0 
                  ? dashboardData.revenueByOrganizer.map(ro => `${ro.name}: $${(ro.revenue || 0).toLocaleString()}`).join(', ') 
                  : 'No revenue'}
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
        </>
      )}

      <Routes>
        <Route path="user-management" element={<UserManagement />} />
        <Route path="event-monitoring" element={<EventMonitoring />} />
        <Route path="/" element={
          <div>
            {/* Main dashboard content */}
            {/* This will only show when we're on the exact root path */}
          </div>
        } />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
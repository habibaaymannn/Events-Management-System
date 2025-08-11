import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import Analytics from "./Analytics";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    users: {
      admins: 1,
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
    events: [],
    dailyStats: {
      bookings: 0,
      cancellations: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load venues
    const venues = JSON.parse(localStorage.getItem("venues") || "[]");
    // Load services  
    const services = JSON.parse(localStorage.getItem("services") || "[]");
    // Load events
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    // Load attendee events
    const myEvents = JSON.parse(localStorage.getItem("myEvents") || "[]");

    // Calculate event stats
    const eventStats = {
      upcoming: events.filter(e => e.status === "Upcoming").length,
      ongoing: events.filter(e => e.status === "Current").length,
      completed: events.filter(e => e.status === "Past").length,
      cancelled: events.filter(e => e.status === "Cancelled").length
    };

    // Calculate user stats (simplified)
    const userStats = {
      admins: 1,
      eventOrganizers: events.length > 0 ? 1 : 0,
      eventAttendees: myEvents.length > 0 ? 1 : 0,
      serviceProviders: services.length > 0 ? 1 : 0,
      venueProviders: venues.length > 0 ? 1 : 0
    };

    setDashboardData({
      users: userStats,
      events: eventStats,
      venues,
      services,
      events,
      dailyStats: {
        bookings: venues.reduce((sum, v) => sum + v.bookings.length, 0) + 
                 services.reduce((sum, s) => sum + s.bookings.length, 0),
        cancellations: 0 // Could be calculated from event status changes
      }
    });
  };

  const totalEvents = Object.values(dashboardData.events).reduce((sum, count) => sum + count, 0);
  const totalUsers = Object.values(dashboardData.users).reduce((sum, count) => sum + count, 0);
  const venueUtilization = dashboardData.venues.length > 0 
    ? Math.round((dashboardData.venues.filter(v => v.bookings.length > 0).length / dashboardData.venues.length) * 100)
    : 0;
  const serviceUtilization = dashboardData.services.length > 0
    ? Math.round((dashboardData.services.filter(s => s.bookings.length > 0).length / dashboardData.services.length) * 100)
    : 0;

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <div className="card-header">
        <h2 className="card-title text-center">System Admin Dashboard</h2>
        <p className="text-center text-muted">Monitor and control the entire event management system</p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card text-center">
          <h3 className="text-primary">{totalUsers}</h3>
          <p className="text-muted">Total Users</p>
        </div>
        <div className="card text-center">
          <h3 className="text-success">{totalEvents}</h3>
          <p className="text-muted">Total Events</p>
        </div>
        <div className="card text-center">
          <h3 className="text-warning">{venueUtilization}%</h3>
          <p className="text-muted">Venue Utilization</p>
        </div>
        <div className="card text-center">
          <h3 className="text-danger">{serviceUtilization}%</h3>
          <p className="text-muted">Service Utilization</p>
        </div>
      </div>

      {/* Event Status Breakdown */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card">
          <h4 className="mb-3">Events by Status</h4>
          <div className="grid-2">
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

        <div className="card">
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
      </div>

      {/* Venues Management */}
      <div className="card mb-4" style={{ width: '100%', padding: '1.5rem' }}>
        <h4 className="mb-3">Venue Management</h4>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1200px', width: '100%' }}>
            <thead>
              <tr>
                <th>Venue Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.venues.map(venue => (
                <tr key={venue.id}>
                  <td className="fw-bold">{venue.name}</td>
                  <td>{venue.type}</td>
                  <td>{venue.location}</td>
                  <td>{venue.capacity_minimum} - {venue.capacity_maximum}</td>
                  <td>{venue.bookings?.length || 0}</td>
                  <td>
                    <span className={`status-badge ${venue.bookings?.length > 0 ? 'status-confirmed' : 'status-pending'}`}>
                      {venue.bookings?.length > 0 ? 'Active' : 'Available'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">Manage</button>
                  </td>
                </tr>
              ))}
              {dashboardData.venues.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No venues registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Management */}
      <div className="card mb-4" style={{ width: '100%', padding: '1.5rem' }}>
        <h4 className="mb-3">Service Management</h4>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1100px', width: '100%' }}>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Price</th>
                <th>Service Area</th>
                <th>Bookings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.services.map(service => (
                <tr key={service.id}>
                  <td className="fw-bold">{service.name}</td>
                  <td>${service.price}</td>
                  <td>{service.serviceArea}</td>
                  <td>{service.bookings?.length || 0}</td>
                  <td>
                    <span className={`status-badge ${service.bookings?.length > 0 ? 'status-confirmed' : 'status-pending'}`}>
                      {service.bookings?.length > 0 ? 'Active' : 'Available'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">Manage</button>
                  </td>
                </tr>
              ))}
              {dashboardData.services.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No services registered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events Management */}
      <div className="card mb-4" style={{ width: '100%', padding: '1.5rem' }}>
        <h4 className="mb-3">Event Management</h4>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1300px', width: '100%' }}>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Services</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.events.map(event => (
                <tr key={event.id}>
                  <td className="fw-bold">{event.name}</td>
                  <td>{event.date}</td>
                  <td>{event.venue || 'N/A'}</td>
                  <td>{event.services?.join(', ') || 'N/A'}</td>
                  <td>${event.retailPrice}</td>
                  <td>
                    <span className={`status-badge status-${event.status.toLowerCase()}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm me-1">Edit</button>
                    <button className="btn btn-danger btn-sm">Cancel</button>
                  </td>
                </tr>
              ))}
              {dashboardData.events.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No events created</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem'
      }}>
        <div className="card text-center">
          <h4 className="text-success">{dashboardData.dailyStats.bookings}</h4>
          <p className="text-muted">Daily Bookings</p>
        </div>
        <div className="card text-center">
          <h4 className="text-danger">{dashboardData.dailyStats.cancellations}</h4>
          <p className="text-muted">Daily Cancellations</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
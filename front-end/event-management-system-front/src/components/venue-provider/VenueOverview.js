import React from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import "./VenueOverview.css";

// Mock data
const venues = [
    { id: 1, name: "Grand Ballroom", capacity: 500, status: "Available", bookings: 15, revenue: 25000 },
    { id: 2, name: "Conference Center", capacity: 200, status: "Booked", bookings: 8, revenue: 12000 },
    { id: 3, name: "Garden Pavilion", capacity: 150, status: "Available", bookings: 12, revenue: 18000 },
    { id: 4, name: "Rooftop Terrace", capacity: 100, status: "Maintenance", bookings: 5, revenue: 7500 },
];

const bookings = [
    { id: 1, event: "Tech Conference 2024", venue: "Grand Ballroom", date: "2024-02-15", status: "Confirmed", revenue: 5000 },
    { id: 2, event: "Wedding Reception", venue: "Garden Pavilion", date: "2024-02-20", status: "Pending", revenue: 3500 },
    { id: 3, event: "Corporate Meeting", venue: "Conference Center", date: "2024-02-25", status: "Confirmed", revenue: 2000 },
];

const monthlyRevenue = [
    { month: "Jan", revenue: 45000, bookings: 25 },
    { month: "Feb", revenue: 38000, bookings: 20 },
    { month: "Mar", revenue: 52000, bookings: 28 },
    { month: "Apr", revenue: 48000, bookings: 24 },
    { month: "May", revenue: 55000, bookings: 30 },
    { month: "Jun", revenue: 62000, bookings: 35 },
];

const VenueOverview = () => {
    const navigate = useNavigate();

    const totalVenues = venues.length;
    const availableVenues = venues.filter(v => v.status === "Available").length;
    const bookedVenues = venues.filter(v => v.status === "Booked").length;
    const totalRevenue = venues.reduce((sum, v) => sum + v.revenue, 0);
    const totalBookings = venues.reduce((sum, v) => sum + v.bookings, 0);

    const venueStatusData = [
        { name: "Available", value: availableVenues, color: "#28a745" },
        { name: "Booked", value: bookedVenues, color: "#dc3545" },
        { name: "Maintenance", value: venues.filter(v => v.status === "Maintenance").length, color: "#ffc107" },
    ];

    const handleVenuesClick = () => navigate('/venue-provider/venues');
    const handleBookingsClick = () => navigate('/venue-provider/bookings');
    const handleRevenueClick = () => navigate('/venue-provider/revenue');

    return (
        <div className="venue-overview">
            {/* Header */}
            <div className="overview-header">
                <h2 className="overview-title">Venue Provider Dashboard</h2>
                <p className="overview-subtitle">Manage your venues, bookings, and revenue efficiently</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card clickable-stat" onClick={handleVenuesClick}>
                    <div className="stat-icon venues-icon">🏢</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{totalVenues}</h3>
                        <p className="stat-label">Total Venues</p>
                        <span className="stat-link">View Details →</span>
                    </div>
                </div>

                <div className="stat-card clickable-stat" onClick={handleBookingsClick}>
                    <div className="stat-icon bookings-icon">📅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{totalBookings}</h3>
                        <p className="stat-label">Total Bookings</p>
                        <span className="stat-link">Manage Bookings →</span>
                    </div>
                </div>

                <div className="stat-card clickable-stat" onClick={handleRevenueClick}>
                    <div className="stat-icon revenue-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${totalRevenue.toLocaleString()}</h3>
                        <p className="stat-label">Total Revenue</p>
                        <span className="stat-link">View Analytics →</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon utilization-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{Math.round((bookedVenues / totalVenues) * 100)}%</h3>
                        <p className="stat-label">Utilization Rate</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Venue Status Pie Chart */}
                <div className="chart-card">
                    <h4 className="chart-title">Venue Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={venueStatusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {venueStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="chart-card">
                    <h4 className="chart-title">Monthly Revenue Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#667eea" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
                <div className="section-header">
                    <h4 className="section-title">Recent Bookings</h4>
                    <button className="view-all-btn" onClick={handleBookingsClick}>
                        View All →
                    </button>
                </div>

                <div className="activity-grid">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="activity-card">
                            <div className="activity-header">
                                <h5 className="activity-title">{booking.event}</h5>
                                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="activity-details">
                                <p><strong>Venue:</strong> {booking.venue}</p>
                                <p><strong>Date:</strong> {booking.date}</p>
                                <p><strong>Revenue:</strong> ${booking.revenue.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Venue Quick Access */}
            <div className="quick-access-section">
                <h4 className="section-title">Your Venues</h4>
                <div className="venues-grid">
                    {venues.map((venue) => (
                        <div key={venue.id} className="venue-quick-card">
                            <div className="venue-header">
                                <h5 className="venue-name">{venue.name}</h5>
                                <span className={`venue-status ${venue.status.toLowerCase()}`}>
                                    {venue.status}
                                </span>
                            </div>
                            <div className="venue-stats">
                                <div className="venue-stat">
                                    <span className="stat-value">{venue.capacity}</span>
                                    <span className="stat-name">Capacity</span>
                                </div>
                                <div className="venue-stat">
                                    <span className="stat-value">{venue.bookings}</span>
                                    <span className="stat-name">Bookings</span>
                                </div>
                                <div className="venue-stat">
                                    <span className="stat-value">${venue.revenue.toLocaleString()}</span>
                                    <span className="stat-name">Revenue</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VenueOverview;
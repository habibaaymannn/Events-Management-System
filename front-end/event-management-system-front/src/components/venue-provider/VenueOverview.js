import React from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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
        <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
            {/* Header */}
            <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
                Venue Provider Dashboard
            </h2>
            <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
                Manage your venues, bookings, and revenue efficiently
            </p>

            {/* Quick Stats */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="card text-center" style={{ cursor: 'pointer' }} onClick={handleVenuesClick}>
                    <h3 className="text-primary">{totalVenues}</h3>
                    <p className="text-muted">Total Venues</p>
                    <small className="text-primary">View Details →</small>
                </div>
                <div className="card text-center" style={{ cursor: 'pointer' }} onClick={handleBookingsClick}>
                    <h3 className="text-success">{totalBookings}</h3>
                    <p className="text-muted">Total Bookings</p>
                    <small className="text-success">Manage Bookings →</small>
                </div>
                <div className="card text-center" style={{ cursor: 'pointer' }} onClick={handleRevenueClick}>
                    <h3 className="text-warning">${totalRevenue.toLocaleString()}</h3>
                    <p className="text-muted">Total Revenue</p>
                    <small className="text-warning">View Analytics →</small>
                </div>
                <div className="card text-center">
                    <h3 className="text-danger">{Math.round((bookedVenues / totalVenues) * 100)}%</h3>
                    <p className="text-muted">Utilization Rate</p>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '2rem',
                marginBottom: '2rem'
            }}>
                {/* Venue Status Pie Chart */}
                <div className="card">
                    <h4 className="mb-3">Venue Status Distribution</h4>
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
                <div className="card">
                    <h4 className="mb-3">Monthly Revenue Trend</h4>
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
            <div className="card mb-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, color: "#2c3e50" }}>Recent Bookings</h4>
                    <button className="btn btn-primary" onClick={handleBookingsClick}>
                        View All →
                    </button>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '1.5rem'
                }}>
                    {bookings.map((booking) => (
                        <div key={booking.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h5 style={{ margin: 0, color: "#2c3e50" }}>{booking.event}</h5>
                                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                <p style={{ margin: '0.25rem 0' }}><strong>Venue:</strong> {booking.venue}</p>
                                <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {booking.date}</p>
                                <p style={{ margin: '0.25rem 0' }}><strong>Revenue:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>${booking.revenue.toLocaleString()}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Venue Quick Access */}
            <div className="card">
                <h4 style={{ marginBottom: '1.5rem', color: "#2c3e50" }}>Your Venues</h4>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '1.5rem'
                }}>
                    {venues.map((venue) => (
                        <div key={venue.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h5 style={{ margin: 0, color: "#2c3e50" }}>{venue.name}</h5>
                                <span className={`status-badge status-${venue.status.toLowerCase()}`}>
                                    {venue.status}
                                </span>
                            </div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '1rem',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>{venue.capacity}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Capacity</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>{venue.bookings}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Bookings</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>${venue.revenue.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Revenue</div>
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
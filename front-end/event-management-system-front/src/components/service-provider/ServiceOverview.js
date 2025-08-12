import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getMyServices, getServiceProviderBookings } from "../../api/serviceApi";
import "./ServiceOverview.css";

const ServiceOverview = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [servicesData, bookingsResponse] = await Promise.all([
                getMyServices(),
                getServiceProviderBookings(0, 10)
            ]);
            
            setServices(servicesData);
            
            // Map bookings to expected format
            const mappedBookings = (bookingsResponse || []).map(booking => ({
                id: booking.id,
                service: "Service", // You may need service name from another endpoint
                client: booking.organizerBooker?.fullName || booking.attendeeBooker?.fullName || "Unknown Client",
                date: new Date(booking.startTime).toLocaleDateString(),
                status: booking.status,
                revenue: 0 // Calculate if pricing info available
            }));
            
            setRecentBookings(mappedBookings);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === "Active").length;
    const totalBookings = services.reduce((sum, s) => sum + s.bookings, 0);
    const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);

    const serviceCategories = services.reduce((acc, service) => {
        acc[service.category] = (acc[service.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.entries(serviceCategories).map(([category, count]) => ({
        name: category,
        value: count,
        color: ["#667eea", "#764ba2", "#28a745", "#ffc107", "#dc3545"][Object.keys(serviceCategories).indexOf(category)]
    }));

    const handleServicesClick = () => navigate('/service-provider/services');
    const handleBookingsClick = () => navigate('/service-provider/bookings');
    const handleRevenueClick = () => navigate('/service-provider/revenue');

    return (
        <div className="service-overview">
            {/* Header */}
            <div className="overview-header">
                <h2 className="overview-title">Service Provider Dashboard</h2>
                <p className="overview-subtitle">Manage your services and grow your business</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card clickable-stat" onClick={handleServicesClick}>
                    <div className="stat-icon services-icon">🛠️</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{totalServices}</h3>
                        <p className="stat-label">Total Services</p>
                        <span className="stat-link">Manage Services →</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{activeServices}</h3>
                        <p className="stat-label">Active Services</p>
                        <span className="stat-change positive">
                            {Math.round((activeServices / totalServices) * 100)}% active
                        </span>
                    </div>
                </div>

                <div className="stat-card clickable-stat" onClick={handleBookingsClick}>
                    <div className="stat-icon bookings-icon">📅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{totalBookings}</h3>
                        <p className="stat-label">Total Bookings</p>
                        <span className="stat-link">View Bookings →</span>
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
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                {/* Service Categories */}
                <div className="chart-card">
                    <h4 className="chart-title">Service Categories</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}`}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
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
                            <Bar dataKey="bookings" fill="#28a745" name="Bookings" />
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
                    {recentBookings.map((booking) => (
                        <div key={booking.id} className="activity-card">
                            <div className="activity-header">
                                <h5 className="activity-title">{booking.service}</h5>
                                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="activity-details">
                                <p><strong>Client:</strong> {booking.client}</p>
                                <p><strong>Date:</strong> {booking.date}</p>
                                <p><strong>Revenue:</strong> ${booking.revenue.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Quick Access */}
            <div className="quick-access-section">
                <h4 className="section-title">Your Services</h4>
                <div className="services-grid">
                    {services.slice(0, 4).map((service) => (
                        <div key={service.id} className="service-quick-card">
                            <div className="service-header">
                                <h5 className="service-name">{service.name}</h5>
                                <span className={`service-status ${service.status.toLowerCase()}`}>
                                    {service.status}
                                </span>
                            </div>
                            <div className="service-details">
                                <p className="service-category">{service.category}</p>
                                <p className="service-price">${service.price} {service.unit}</p>
                            </div>
                            <div className="service-stats">
                                <div className="service-stat">
                                    <span className="stat-value">{service.bookings}</span>
                                    <span className="stat-name">Bookings</span>
                                </div>
                                <div className="service-stat">
                                    <span className="stat-value">${service.revenue.toLocaleString()}</span>
                                    <span className="stat-name">Revenue</span>
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
                    <button className="action-card" onClick={handleServicesClick}>
                        <div className="action-icon">➕</div>
                        <div className="action-content">
                            <h5>Add New Service</h5>
                            <p>Create and list a new service offering</p>
                        </div>
                    </button>

                    <button className="action-card" onClick={handleBookingsClick}>
                        <div className="action-icon">📋</div>
                        <div className="action-content">
                            <h5>Manage Bookings</h5>
                            <p>Review pending requests and confirmations</p>
                        </div>
                    </button>

                    <button className="action-card">
                        <div className="action-icon">🔔</div>
                        <div className="action-content">
                            <h5>Notifications</h5>
                            <p>Check recent booking notifications</p>
                        </div>
                    </button>

                    <button className="action-card" onClick={handleRevenueClick}>
                        <div className="action-icon">📊</div>
                        <div className="action-content">
                            <h5>View Reports</h5>
                            <p>Analyze performance and earnings</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceOverview;
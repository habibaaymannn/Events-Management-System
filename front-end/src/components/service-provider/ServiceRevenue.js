import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { getMyServices, getServiceProviderBookings } from "../../api/serviceApi";

const ServiceRevenue = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("6months");
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const serviceProviderId = window.keycloak?.tokenParsed?.sub;
            if (!serviceProviderId) {
                console.error("No service provider ID found");
                return;
            }

            const [servicesData, bookingsData] = await Promise.all([
                getMyServices(),
                getServiceProviderBookings(serviceProviderId)
            ]);
            
            setServices(Array.isArray(servicesData) ? servicesData : []);
            setBookings(bookingsData?.content || []);
        } catch (error) {
            console.error("Error loading revenue data:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = bookings.length;
    const totalExpenses = 0; 
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    const averageRevenuePerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    const serviceRevenueMap = bookings.reduce((acc, booking) => {
        const serviceId = booking.serviceId;
        if (!acc[serviceId]) {
            acc[serviceId] = { revenue: 0, bookings: 0 };
        }
        acc[serviceId].revenue += booking.amount || 0;
        acc[serviceId].bookings += 1;
        return acc;
    }, {});

    const serviceRevenueData = services.map(service => ({
        name: service.name,
        revenue: serviceRevenueMap[service.id]?.revenue || 0,
        bookings: serviceRevenueMap[service.id]?.bookings || 0,
        avgPrice: serviceRevenueMap[service.id]?.bookings > 0 
            ? Math.round(serviceRevenueMap[service.id].revenue / serviceRevenueMap[service.id].bookings)
            : 0
    })).filter(s => s.revenue > 0);

    const topPerformingService = serviceRevenueData.length > 0 
        ? serviceRevenueData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current)
        : { name: "N/A", revenue: 0 };

    if (loading) {
        return (
            <div className="service-page">
                <div className="service-page-header">
                    <h3 className="service-page-title">Revenue Analytics</h3>
                    <p className="service-page-subtitle">Loading revenue data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="service-page">
            <div className="service-page-header">
                <h3 className="service-page-title">Revenue Analytics</h3>
                <p className="service-page-subtitle">Track your business performance and profitability</p>
            </div>

            {/* Revenue Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${totalRevenue.toLocaleString()}</h3>
                        <p className="stat-label">Total Revenue</p>
                        <span className="stat-change neutral">Total from all bookings</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon profit-icon">📈</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${netProfit.toLocaleString()}</h3>
                        <p className="stat-label">Net Profit</p>
                        <span className="stat-change positive">+{profitMargin}% margin</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon expense-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${totalExpenses.toLocaleString()}</h3>
                        <p className="stat-label">Total Expenses</p>
                        <span className="stat-change neutral">{((totalExpenses / totalRevenue) * 100).toFixed(1)}% of revenue</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon booking-icon">🎯</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${averageRevenuePerBooking}</h3>
                        <p className="stat-label">Avg. Revenue/Booking</p>
                        <span className="stat-change neutral">Per booking average</span>
                    </div>
                </div>
            </div>

            {/* Performance Highlights */}
            <div className="highlights-section">
                <div className="highlight-card">
                    <div className="highlight-icon">🏆</div>
                    <div className="highlight-content">
                        <h5>Top Service</h5>
                        <p>{topPerformingService.name}</p>
                        <span className="highlight-value">${topPerformingService.revenue.toLocaleString()}</span>
                    </div>
                </div>

                <div className="highlight-card">
                    <div className="highlight-icon">📊</div>
                    <div className="highlight-content">
                        <h5>Total Services</h5>
                        <p>Active Services</p>
                        <span className="highlight-value">{services.length}</span>
                    </div>
                </div>

                <div className="highlight-card">
                    <div className="highlight-icon">📅</div>
                    <div className="highlight-content">
                        <h5>Total Bookings</h5>
                        <p>All Time</p>
                        <span className="highlight-value">{totalBookings}</span>
                    </div>
                </div>

                <div className="highlight-card">
                    <div className="highlight-icon">💰</div>
                    <div className="highlight-content">
                        <h5>Avg Per Booking</h5>
                        <p>Revenue Average</p>
                        <span className="highlight-value">${averageRevenuePerBooking.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Service Performance */}
            <div className="charts-grid">
                {serviceRevenueData.length > 0 && (
                  <div className="chart-card">
                      <h4 className="chart-title">Revenue by Service</h4>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={serviceRevenueData} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={100} />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                              <Bar dataKey="revenue" fill="#28a745" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                )}
            </div>

            {/* Detailed Revenue Table */}
            {serviceRevenueData.length > 0 ? (
              <div className="service-section">
                  <h4 className="section-title">Service Performance Details</h4>
                  <div className="revenue-table-container">
                      <table className="service-table">
                          <thead>
                              <tr>
                                  <th>Service Name</th>
                                  <th>Total Bookings</th>
                                  <th>Revenue</th>
                                  <th>Avg. Price</th>
                                  <th>Market Share</th>
                              </tr>
                          </thead>
                          <tbody>
                              {serviceRevenueData.map((service, index) => {
                                  const marketShare = totalRevenue > 0 ? ((service.revenue / totalRevenue) * 100).toFixed(1) : 0;

                                  return (
                                      <tr key={index}>
                                          <td>
                                              <div className="service-name-cell">
                                                  <strong>{service.name}</strong>
                                              </div>
                                          </td>
                                          <td>{service.bookings}</td>
                                          <td>
                                              <span className="revenue-amount">
                                                  ${service.revenue.toLocaleString()}
                                              </span>
                                          </td>
                                          <td>${service.avgPrice.toLocaleString()}</td>
                                          <td>
                                              <div className="market-share-bar">
                                                  <div
                                                      className="market-share-fill"
                                                      style={{ width: `${marketShare}%` }}
                                                  ></div>
                                                  <span className="market-share-text">{marketShare}%</span>
                                              </div>
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
            ) : (
              <div className="service-section">
                  <h4 className="section-title">Service Performance Details</h4>
                  <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                      No revenue data available yet. Start accepting bookings to see performance metrics.
                  </p>
              </div>
            )}
        </div>
    );
};

export default ServiceRevenue;
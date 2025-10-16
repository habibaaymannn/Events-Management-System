import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllVenuesByProvider, getBookingsByVenueProviderId } from "../../api/venueApi";

const Revenue = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("6months");
    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const venueProviderId = window.keycloak?.tokenParsed?.sub;
            if (!venueProviderId) {
                console.error("No venue provider ID found");
                return;
            }

            const [venuesData, bookingsData] = await Promise.all([
                getAllVenuesByProvider(),
                getBookingsByVenueProviderId(venueProviderId)
            ]);
            
            setVenues(Array.isArray(venuesData) ? venuesData : []);
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

    const venueRevenueMap = bookings.reduce((acc, booking) => {
        const venueId = booking.venueId;
        if (!acc[venueId]) {
            acc[venueId] = { revenue: 0, bookings: 0 };
        }
        acc[venueId].revenue += booking.amount || 0;
        acc[venueId].bookings += 1;
        return acc;
    }, {});

    const venueRevenueData = venues.map(venue => ({
        name: venue.name,
        revenue: venueRevenueMap[venue.id]?.revenue || 0,
        bookings: venueRevenueMap[venue.id]?.bookings || 0
    })).filter(v => v.revenue > 0);

    if (loading) {
        return (
            <div className="venue-page">
                <div className="venue-page-header">
                    <h3 className="venue-page-title">Revenue Analytics</h3>
                    <p className="venue-page-subtitle">Loading revenue data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="venue-page">
            <div className="venue-page-header">
                <h3 className="venue-page-title">Revenue Analytics</h3>
                <p className="venue-page-subtitle">Track your financial performance and profitability</p>
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
                        <span className="stat-change neutral">Operating costs</span>
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

            {/* Revenue by Venue */}
            <div className="charts-grid">
                {venueRevenueData.length > 0 && (
                  <div className="chart-card">
                      <h4 className="chart-title">Revenue by Venue</h4>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={venueRevenueData} layout="horizontal">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="name" type="category" width={120} />
                              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                              <Bar dataKey="revenue" fill="#28a745" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
                )}
            </div>

            {/* Detailed Revenue Table */}
            {venueRevenueData.length > 0 ? (
              <div className="venue-section">
                  <h4 className="section-title">Venue Performance Details</h4>
                  <div className="revenue-table-container">
                      <table className="venue-table">
                          <thead>
                              <tr>
                                  <th>Venue</th>
                                  <th>Total Bookings</th>
                                  <th>Revenue</th>
                                  <th>Avg. Revenue/Booking</th>
                              </tr>
                          </thead>
                          <tbody>
                              {venueRevenueData.map((venue, index) => {
                                  const avgRevenue = venue.bookings > 0 ? Math.round(venue.revenue / venue.bookings) : 0;

                                  return (
                                      <tr key={index}>
                                          <td>
                                              <div className="venue-name-cell">
                                                  <strong>{venue.name}</strong>
                                              </div>
                                          </td>
                                          <td>{venue.bookings}</td>
                                          <td>
                                              <span className="revenue-amount">
                                                  ${venue.revenue.toLocaleString()}
                                              </span>
                                          </td>
                                          <td>${avgRevenue.toLocaleString()}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
            ) : (
              <div className="venue-section">
                  <h4 className="section-title">Venue Performance Details</h4>
                  <p style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
                      No revenue data available yet. Start accepting bookings to see performance metrics.
                  </p>
              </div>
            )}
        </div>
    );
};

export default Revenue;
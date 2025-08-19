import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
    { month: "Jan", revenue: 15000, bookings: 18, expenses: 3000 },
    { month: "Feb", revenue: 22000, bookings: 25, expenses: 4000 },
    { month: "Mar", revenue: 28000, bookings: 32, expenses: 5000 },
    { month: "Apr", revenue: 25000, bookings: 28, expenses: 4500 },
    { month: "May", revenue: 35000, bookings: 38, expenses: 6000 },
    { month: "Jun", revenue: 42000, bookings: 45, expenses: 7000 },
];

const serviceRevenueData = [
    { name: "Food Catering", revenue: 65000, bookings: 35, avgPrice: 1857 },
    { name: "Photography", revenue: 48000, bookings: 24, avgPrice: 2000 },
    { name: "AV Equipment", revenue: 32000, bookings: 40, avgPrice: 800 },
    { name: "Decorations", revenue: 18000, bookings: 25, avgPrice: 720 },
    { name: "Furniture Rental", revenue: 15000, bookings: 60, avgPrice: 250 },
];

const expenseData = [
    { category: "Equipment & Supplies", amount: 12000, color: "#667eea" },
    { category: "Transportation", amount: 6000, color: "#764ba2" },
    { category: "Staff & Labor", amount: 8000, color: "#28a745" },
    { category: "Marketing", amount: 3000, color: "#ffc107" },
    { category: "Insurance & Permits", amount: 2500, color: "#dc3545" },
];

const clientData = [
    { name: "Corporate Events", revenue: 85000, percentage: 45 },
    { name: "Weddings", revenue: 65000, percentage: 35 },
    { name: "Private Parties", revenue: 25000, percentage: 13 },
    { name: "Charity Events", revenue: 13000, percentage: 7 },
];

const ServiceRevenue = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("6months");

    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

    const totalBookings = monthlyData.reduce((sum, month) => sum + month.bookings, 0);
    const averageRevenuePerBooking = Math.round(totalRevenue / totalBookings);

    const topPerformingService = serviceRevenueData.reduce((prev, current) =>
        (prev.revenue > current.revenue) ? prev : current
    );

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
                        <span className="stat-change positive">+18.5% from last period</span>
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
                        <span className="stat-change positive">+12.3% efficiency</span>
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
                    <div className="highlight-icon">📅</div>
                    <div className="highlight-content">
                        <h5>Best Month</h5>
                        <p>June 2024</p>
                        <span className="highlight-value">$42,000</span>
                    </div>
                </div>

                <div className="highlight-card">
                    <div className="highlight-icon">👥</div>
                    <div className="highlight-content">
                        <h5>Client Satisfaction</h5>
                        <p>Average Rating</p>
                        <span className="highlight-value">4.8/5.0</span>
                    </div>
                </div>

                <div className="highlight-card">
                    <div className="highlight-icon">📊</div>
                    <div className="highlight-content">
                        <h5>Growth Rate</h5>
                        <p>Monthly Growth</p>
                        <span className="highlight-value">+18.5%</span>
                    </div>
                </div>
            </div>

            {/* Revenue Trends Chart */}
            <div className="chart-section">
                <div className="chart-card large">
                    <div className="chart-header">
                        <h4 className="chart-title">Revenue & Expense Trends</h4>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="form-control"
                            style={{ width: "150px" }}
                        >
                            <option value="6months">Last 6 Months</option>
                            <option value="12months">Last 12 Months</option>
                            <option value="ytd">Year to Date</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#667eea" name="Revenue" />
                            <Bar dataKey="expenses" fill="#ff6b6b" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Service Performance and Client Breakdown */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h4 className="chart-title">Revenue by Service Category</h4>
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

                <div className="chart-card">
                    <h4 className="chart-title">Expense Breakdown</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expenseData}
                                dataKey="amount"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ category, percent }) =>
                                    `${category}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Revenue Table */}
            <div className="service-section">
                <h4 className="section-title">Service Performance Details</h4>
                <div className="revenue-table-container">
                    <table className="service-table">
                        <thead>
                            <tr>
                                <th>Service Category</th>
                                <th>Total Bookings</th>
                                <th>Revenue</th>
                                <th>Avg. Price</th>
                                <th>Market Share</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceRevenueData.map((service, index) => {
                                const marketShare = ((service.revenue / totalRevenue) * 100).toFixed(1);
                                const growth = (Math.random() * 30 - 5).toFixed(1); // Mock growth data

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
                                        <td>
                                            <span className={`growth-indicator ${growth >= 0 ? 'positive' : 'negative'}`}>
                                                {growth >= 0 ? '+' : ''}{growth}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Analysis */}
            <div className="service-section">
                <h4 className="section-title">Client Revenue Analysis</h4>
                <div className="client-analysis-grid">
                    {clientData.map((client, index) => (
                        <div key={index} className="client-card">
                            <div className="client-header">
                                <h5>{client.name}</h5>
                                <span className="client-percentage">{client.percentage}%</span>
                            </div>
                            <div className="client-revenue">
                                ${client.revenue.toLocaleString()}
                            </div>
                            <div className="client-bar">
                                <div
                                    className="client-bar-fill"
                                    style={{ width: `${client.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Business Insights */}
            <div className="insights-section">
                <h4 className="section-title">Business Insights</h4>
                <div className="insights-grid">
                    <div className="insight-card">
                        <div className="insight-icon">🎯</div>
                        <div className="insight-content">
                            <h5>Revenue Opportunity</h5>
                            <p>Food Catering shows highest revenue potential. Consider expanding menu options.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">📈</div>
                        <div className="insight-content">
                            <h5>Growth Strategy</h5>
                            <p>Corporate events generate 45% of revenue. Focus marketing on business sectors.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">💡</div>
                        <div className="insight-content">
                            <h5>Cost Optimization</h5>
                            <p>Equipment costs are 38% of expenses. Consider bulk purchasing or leasing options.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">🏆</div>
                        <div className="insight-content">
                            <h5>Premium Services</h5>
                            <p>Photography services have highest per-booking value. Promote premium packages.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRevenue;
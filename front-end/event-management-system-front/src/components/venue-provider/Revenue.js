import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
    { month: "Jan", revenue: 12000, bookings: 8, expenses: 2000 },
    { month: "Feb", revenue: 15000, bookings: 10, expenses: 2500 },
    { month: "Mar", revenue: 18000, bookings: 12, expenses: 3000 },
    { month: "Apr", revenue: 22000, bookings: 15, expenses: 3500 },
    { month: "May", revenue: 25000, bookings: 18, expenses: 4000 },
    { month: "Jun", revenue: 28000, bookings: 20, expenses: 4200 },
];

const venueRevenueData = [
    { name: "Grand Ballroom", revenue: 45000, bookings: 25 },
    { name: "Conference Center", revenue: 32000, bookings: 18 },
    { name: "Garden Pavilion", revenue: 28000, bookings: 20 },
    { name: "Rooftop Terrace", revenue: 22000, bookings: 15 },
];

const expenseData = [
    { category: "Maintenance", amount: 8000, color: "#ff6b6b" },
    { category: "Utilities", amount: 5000, color: "#4ecdc4" },
    { category: "Staff", amount: 12000, color: "#45b7d1" },
    { category: "Marketing", amount: 3000, color: "#96ceb4" },
    { category: "Insurance", amount: 4000, color: "#ffeaa7" },
];

const Revenue = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("6months");

    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

    const averageRevenuePerBooking = Math.round(
        monthlyData.reduce((sum, month) => sum + month.revenue, 0) /
        monthlyData.reduce((sum, month) => sum + month.bookings, 0)
    );

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
                        <span className="stat-change positive">+12.5% from last period</span>
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
                        <span className="stat-change positive">+8.2% efficiency</span>
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

            {/* Revenue by Venue and Expense Breakdown */}
            <div className="charts-grid">
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
                                <th>Utilization Rate</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {venueRevenueData.map((venue, index) => {
                                const avgRevenue = Math.round(venue.revenue / venue.bookings);
                                const utilizationRate = Math.round((venue.bookings / 30) * 100); // Assuming 30 possible booking days
                                const growth = (Math.random() * 20 - 10).toFixed(1); // Mock growth data

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
                                        <td>
                                            <div className="utilization-bar">
                                                <div
                                                    className="utilization-fill"
                                                    style={{ width: `${utilizationRate}%` }}
                                                ></div>
                                                <span className="utilization-text">{utilizationRate}%</span>
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

            {/* Revenue Insights */}
            <div className="insights-section">
                <h4 className="section-title">Revenue Insights</h4>
                <div className="insights-grid">
                    <div className="insight-card">
                        <div className="insight-icon">🏆</div>
                        <div className="insight-content">
                            <h5>Top Performer</h5>
                            <p>Grand Ballroom generated the highest revenue with $45,000 this period.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">📈</div>
                        <div className="insight-content">
                            <h5>Growth Opportunity</h5>
                            <p>Rooftop Terrace has potential for 30% more bookings with targeted marketing.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">💡</div>
                        <div className="insight-content">
                            <h5>Optimization Tip</h5>
                            <p>Consider dynamic pricing during peak seasons to maximize revenue potential.</p>
                        </div>
                    </div>

                    <div className="insight-card">
                        <div className="insight-icon">🎯</div>
                        <div className="insight-content">
                            <h5>Cost Management</h5>
                            <p>Staff expenses represent 38% of costs. Review staffing efficiency opportunities.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
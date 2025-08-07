import React from "react";
import "./Analytics.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// Mock data
const events = [
  { status: "Upcoming", type: "Conference", organizer: "Alice", revenue: 1000 },
  { status: "Ongoing", type: "Wedding", organizer: "Bob", revenue: 2000 },
  { status: "Completed", type: "Workshop", organizer: "Alice", revenue: 500 },
  { status: "Cancelled", type: "Concert", organizer: "Charlie", revenue: 0 },
  { status: "Upcoming", type: "Seminar", organizer: "Bob", revenue: 800 },
];

const users = [
  { role: "Admin" },
  { role: "Organizer" },
  { role: "Attendee" },
  { role: "Service Provider" },
  { role: "Venue Provider" },
  { role: "Organizer" },
  { role: "Attendee" },
];

const venues = [
  { id: 1, booked: true },
  { id: 2, booked: false },
  { id: 3, booked: true },
  { id: 4, booked: false },
];

const serviceProviders = [
  { id: 1, booked: true },
  { id: 2, booked: true },
  { id: 3, booked: false },
];

// Calculations
const eventStatusCount = events.reduce((acc, e) => {
  acc[e.status] = (acc[e.status] || 0) + 1;
  return acc;
}, {});

const userBreakdown = users.reduce((acc, u) => {
  acc[u.role] = (acc[u.role] || 0) + 1;
  return acc;
}, {});

const bookedVenues = venues.filter(v => v.booked).length;
const totalVenues = venues.length;
const venueUtilization = totalVenues === 0 ? 0 : Math.round((bookedVenues / totalVenues) * 100);

const bookedServices = serviceProviders.filter(s => s.booked).length;
const totalServices = serviceProviders.length;
const serviceUtilization = totalServices === 0 ? 0 : Math.round((bookedServices / totalServices) * 100);

const eventTypeDist = events.reduce((acc, e) => {
  acc[e.type] = (acc[e.type] || 0) + 1;
  return acc;
}, {});

const dailyCancellations = 1; // mock
const dailyBookings = 2; // mock

const revenuePerOrganizer = events.reduce((acc, e) => {
  acc[e.organizer] = (acc[e.organizer] || 0) + e.revenue;
  return acc;
}, {});

const pieData = [
  { name: "Upcoming", value: eventStatusCount.Upcoming || 0 },
  { name: "Ongoing", value: eventStatusCount.Ongoing || 0 },
  { name: "Completed", value: eventStatusCount.Completed || 0 },
  { name: "Cancelled", value: eventStatusCount.Cancelled || 0 },
];
const pieColors = ["#1976d2", "#43a047", "#757575", "#d32f2f"];

// For mini pies
const venuePie = [
  { name: "Booked", value: bookedVenues },
  { name: "Available", value: totalVenues - bookedVenues }
];
const servicePie = [
  { name: "Booked", value: bookedServices },
  { name: "Available", value: totalServices - bookedServices }
];
const utilColors = ["#1976d2", "#e0e0e0"];

// For bar charts
const userRoles = Object.entries(userBreakdown);
const eventTypes = Object.entries(eventTypeDist);
const maxUserCount = Math.max(...userRoles.map(([, count]) => count), 1);
const maxTypeCount = Math.max(...eventTypes.map(([, count]) => count), 1);

// Custom label for main pie
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index, value
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={18}
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

const Analytics = () => (
  <div className="analytics-dashboard">
    <h3>Analytics Dashboard</h3>
    <div className="analytics-grid">
      {/* Main Pie Chart */}
      <div className="analytics-card" style={{ minHeight: 400 }}>
        <h4>Total Events by Status</h4>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={renderCustomLabel}
              labelLine={false}
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={pieColors[idx]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* User Breakdown as bar chart */}
      <div className="analytics-card">
        <h4>User Breakdown</h4>
        <div className="bar-list">
          {userRoles.map(([role, count]) => (
            <div className="bar-row" key={role}>
              <span className="bar-label">{role}</span>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(count / maxUserCount) * 100}%`,
                    background: "#1976d2"
                  }}
                />
              </div>
              <span className="bar-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Venue Utilization as mini pie */}
      <div className="analytics-card">
        <h4>Venue Utilization Rate</h4>
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={venuePie}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              labelLine={false}
            >
              {venuePie.map((entry, idx) => (
                <Cell key={`cell-venue-${idx}`} fill={utilColors[idx]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="analytics-number">{venueUtilization}%</p>
        <p>
          {bookedVenues} booked / {totalVenues} total
        </p>
      </div>
      {/* Service Providers Utilization as mini pie */}
      <div className="analytics-card">
        <h4>Service Providers Utilization Rate</h4>
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={servicePie}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              labelLine={false}
            >
              {servicePie.map((entry, idx) => (
                <Cell key={`cell-service-${idx}`} fill={utilColors[idx]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p className="analytics-number">{serviceUtilization}%</p>
        <p>
          {bookedServices} booked / {totalServices} total
        </p>
      </div>
      {/* Event Type Distribution as bar chart */}
      <div className="analytics-card">
        <h4>Event Type Distribution</h4>
        <div className="bar-list">
          {eventTypes.map(([type, count]) => (
            <div className="bar-row" key={type}>
              <span className="bar-label">{type}</span>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(count / maxTypeCount) * 100}%`,
                    background: "#43a047"
                  }}
                />
              </div>
              <span className="bar-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Daily Cancellation Count */}
      <div className="analytics-card">
  <h4>Daily Cancellation Count</h4>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px" }}>
    <span className="analytics-number">{dailyCancellations}</span>
  </div>
  </div>
      {/* Daily Booking Count */}
      <div className="analytics-card">
      <h4>Daily Booking Count</h4>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100px" }}>
        <span className="analytics-number">{dailyBookings}</span>
      </div>
  </div>
      {/* Revenue per Organizer */}
      <div className="analytics-card">
        <h4>Revenue per Organizer</h4>
        <ul>
          {Object.entries(revenuePerOrganizer).map(([org, rev]) => (
            <li key={org}><strong>{org}:</strong> ${rev}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default Analytics;
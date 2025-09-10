import React, { useEffect, useState } from "react";
import "./Analytics.css";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import {
  getAdminDashboard,
  getEventTypeDistribution,
  getDailyBookings,
  getDailyCancellations,
} from "../../api/adminApi";

// Colors
const pieColors = ["#1976d2", "#43a047", "#757575", "#d32f2f"];
const utilColors = ["#1976d2", "#e0e0e0"];

// Custom label for main pie
const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, value }) => {
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

const Analytics = () => {
  const navigate = useNavigate();

  // Live state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Event status pie
  const [eventStatusCount, setEventStatusCount] = useState({
    Upcoming: 0,
    Ongoing: 0,
    Completed: 0,
    Cancelled: 0,
  });

  // Users breakdown
  const [userBreakdown, setUserBreakdown] = useState({
    Admin: 0,
    Organizer: 0,
    Attendee: 0,
    "Service Provider": 0,
    "Venue Provider": 0,
  });

  // Utilization
  const [venueUtilization, setVenueUtilization] = useState(0);    // %
  const [serviceUtilization, setServiceUtilization] = useState(0); // %

  // Event type distribution
  const [eventTypeDist, setEventTypeDist] = useState({}); // { WEDDING: 3, ... }

  // Daily stats (today)
  const [dailyBookings, setDailyBookings] = useState(0);
  const [dailyCancellations, setDailyCancellations] = useState(0);

  // Optional: revenue per organizer (if dashboard includes it)
  const [revenuePerOrganizer, setRevenuePerOrganizer] = useState({}); // { Alice: 1500, Bob: 900 }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const today = new Date().toISOString().slice(0, 10);

        const [dash, types, bookingsMap, cancelsMap] = await Promise.all([
          getAdminDashboard(),
          getEventTypeDistribution(),
          getDailyBookings(today, today),
          getDailyCancellations(today, today),
        ]);

        // Event status counts
        setEventStatusCount({
          Upcoming: dash?.totalUpcoming ?? 0,
          Ongoing: dash?.totalOngoing ?? 0,
          Completed: dash?.totalCompleted ?? 0,
          Cancelled: dash?.totalCancelled ?? 0,
        });

        // User breakdown
        setUserBreakdown({
          Admin: dash?.numAdmins ?? 0,
          Organizer: dash?.numOrganizers ?? 0,
          Attendee: dash?.numAttendees ?? 0,
          "Service Provider": dash?.numServiceProviders ?? 0,
          "Venue Provider": dash?.numVenueProviders ?? 0,
        });

        // Utilization (%)
        setVenueUtilization(
          typeof dash?.venueUtilizationRate === "number"
            ? Math.round(dash.venueUtilizationRate)
            : 0
        );
        setServiceUtilization(
          typeof dash?.serviceProviderUtilizationRate === "number"
            ? Math.round(dash.serviceProviderUtilizationRate)
            : 0
        );

        // Event types
        setEventTypeDist(types || {});

        // Daily stats (sum over map range; today == single key)
        const num = v => Number(v) || 0;
        setDailyBookings(bookingsMap ? Object.values(bookingsMap).map(num).reduce((a, b) => a + b, 0) : 0);
        setDailyCancellations(cancelsMap ? Object.values(cancelsMap).map(num).reduce((a, b) => a + b, 0) : 0);
        // Revenue per organizer (if present in dashboard payload)
        if (Array.isArray(dash?.revenueByOrganizer)) {
          const agg = {};
          dash.revenueByOrganizer.forEach(r => {
            agg[r.name] = (agg[r.name] || 0) + (r.revenue || 0);
          });
          setRevenuePerOrganizer(agg);
        } else {
          setRevenuePerOrganizer({});
        }
      } catch (e) {
        setError(e?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = [
    { name: "Upcoming", value: eventStatusCount.Upcoming || 0 },
    { name: "Ongoing", value: eventStatusCount.Ongoing || 0 },
    { name: "Completed", value: eventStatusCount.Completed || 0 },
    { name: "Cancelled", value: eventStatusCount.Cancelled || 0 },
  ];

  // Mini pies for utilization (percentages)
  const venuePie = [
    { name: "Utilized", value: venueUtilization },
    { name: "Available", value: Math.max(0, 100 - venueUtilization) },
  ];
  const servicePie = [
    { name: "Utilized", value: serviceUtilization },
    { name: "Available", value: Math.max(0, 100 - serviceUtilization) },
  ];

  const userRoles = Object.entries(userBreakdown);
  const eventTypes = Object.entries(eventTypeDist);
  const maxUserCount = Math.max(...userRoles.map(([, c]) => c), 1);
  const maxTypeCount = Math.max(...eventTypes.map(([, c]) => c), 1);

  const handleEventStatusClick = () => {
    // CHANGE: route to your actual page
    navigate("/admin/event-monitoring");
  };
  const handleUserBreakdownClick = () => {
    // CHANGE: route to your actual page
    navigate("/admin/user-management");
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="admin-header">
          <h2 className="admin-title">Admin Dashboard</h2>
          <p className="admin-subtitle">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="admin-header">
          <h2 className="admin-title">Admin Dashboard</h2>
          <p className="admin-subtitle" style={{ color: "#d32f2f" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <h2 className="admin-title">Admin Dashboard</h2>
        <p className="admin-subtitle">Monitor and manage your event management system</p>
      </div>

      <div className="analytics-grid">
        {/* Main Pie Chart */}
        <div className="analytics-card clickable-card" style={{ minHeight: 400 }} onClick={handleEventStatusClick}>
          <h4>Total Events by Status <span className="link-indicator">→</span></h4>
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

        {/* User Breakdown as bar list */}
        <div className="analytics-card clickable-card" onClick={handleUserBreakdownClick}>
          <h4>User Breakdown <span className="link-indicator">→</span></h4>
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
          <p>Server-calculated utilization</p>
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
          <p>Server-calculated utilization</p>
        </div>

        {/* Event Type Distribution as bar list */}
        <div className="analytics-card">
          <h4>Event Type Distribution</h4>
          <div className="bar-list">
            {eventTypes.map(([type, count]) => (
              <div className="bar-row" key={type}>
                <span className="bar-label">{type.replace(/_/g, " ")}</span>
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

        {/* Revenue per Organizer (if present) */}
        <div className="analytics-card">
          <h4>Revenue per Organizer</h4>
          {Object.keys(revenuePerOrganizer).length === 0 ? (
            <p className="text-muted">No revenue data</p>
          ) : (
            <ul>
              {Object.entries(revenuePerOrganizer).map(([org, rev]) => (
                <li key={org}><strong>{org}:</strong> ${Number(rev).toLocaleString()}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

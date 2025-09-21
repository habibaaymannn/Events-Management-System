import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import UserManagement from "./UserManagement";
import EventMonitoring from "./EventMonitoring";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import "./AdminDashboard.css";
import {
  getAdminDashboard,
  getEventTypeDistribution,
  getDailyBookings,
  getDailyCancellations,
} from "../../api/adminApi";

/** ---------- Shared chart card wrapper (keeps all charts same height) ---------- */
const ChartCard = ({ title, children, footer, pad = "1rem" }) => (
  <div
    className="card"
    style={{
      display: "flex",
      flexDirection: "column",
      height: 420,          // <- unified height for all 4 chart cards
      padding: pad,
      gap: "0.5rem",
    }}
  >
    {title && <h4 className="mb-1" style={{ marginBottom: 0 }}>{title}</h4>}
    <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    {footer && <small className="text-muted">{footer}</small>}
  </div>
);
/** --------------------------------------------------------------------------- */

/** ---------- Detailed Utilization panel (radial gauge + progress + numbers) -- */
const UtilizationPanel = ({
  valuePct,                // 0..100
  used,                    // number used/active
  total,                   // total capacity
  title,                   // heading
  color = "#3b82f6",       // main bar color
}) => {
  const pct = Math.max(0, Math.min(100, Number(valuePct) || 0));
  const free = Math.max(0, (Number(total) || 0) - (Number(used) || 0));

  // Banding for context (green/yellow/red)
  const bands = [
    { name: "Safe",     value: Math.min(pct, 60),        fill: "#22c55e" }, // 0-60%
    { name: "Warning",  value: Math.max(0, Math.min(pct - 60, 25)), fill: "#f59e0b" }, // 60-85%
    { name: "Critical", value: Math.max(0, pct - 85),    fill: "#ef4444" }, // 85-100%
  ].filter(d => d.value > 0);

  const series = [{ name: "Utilization", value: pct, fill: color }];

  return (
    <ChartCard
      title={title}
      footer={`Used ${used ?? 0} • Free ${free < 0 ? 0 : free} • Total ${total ?? 0}`}
    >
      {/* Top: radial band (background context) + foreground utilization needle */}
      <div style={{ width: "100%", height: "70%", marginTop: 44 }}>
        <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="56%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={[...bands, ...series]}
        >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            {/* Context bands */}
            {bands.length > 0 && (
              <RadialBar
                dataKey="value"
                clockWise
                stackId="bg"
                cornerRadius={8}
                fillOpacity={0.25}
              />
            )}
            {/* Foreground utilization */}
            <RadialBar
              dataKey="value"
              clockWise
              stackId="fg"
              cornerRadius={16}
              background
              label={{
                position: "center",
                formatter: () => `${Math.round(pct)}%`,
                fill: "#111827",
                fontSize: 24,
                fontWeight: 700,
              }}
            />
            <Tooltip
              formatter={(val, _name) => [`${Math.round(pct)}% (used ${used ?? 0}, free ${free < 0 ? 0 : free})`, "Utilization"]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom: compact horizontal progress with % text */}
      <div
        aria-label="utilization-progress"
        style={{
          height: 10,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
          marginTop: 8,
        }}
        title={`${Math.round(pct)}%`}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#6b7280",
          marginTop: 4,
        }}
      >
        <span>0%</span>
        <span>{Math.round(pct)}%</span>
        <span>100%</span>
      </div>
    </ChartCard>
  );
};
/** --------------------------------------------------------------------------- */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    users: { admins: 0, eventOrganizers: 0, eventAttendees: 0, serviceProviders: 0, venueProviders: 0 },
    events: { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 },
    venues: [],
    services: [],
    eventTypes: {},
    dailyStats: { bookings: 0, cancellations: 0 },
    revenueByOrganizer: [],
    venueUtilizationRate: null,
    serviceProviderUtilizationRate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const todayLocalISO = new Date().toLocaleDateString('en-CA');
      const [dash, types, dailyB, dailyC] = await Promise.all([
        getAdminDashboard(),
        getEventTypeDistribution(),
        getDailyBookings(todayLocalISO, todayLocalISO),
        getDailyCancellations(todayLocalISO, todayLocalISO)
      ]);

      const num = v => Number(v) || 0;
      const bookings = dailyB ? Object.values(dailyB).map(num).reduce((a, b) => a + b, 0) : 0;
      const cancellations = dailyC ? Object.values(dailyC).map(num).reduce((a, b) => a + b, 0) : 0;

      setDashboardData({
        users: {
          admins: dash?.numAdmins ?? 0,
          eventOrganizers: dash?.numOrganizers ?? 0,
          eventAttendees: dash?.numAttendees ?? 0,
          serviceProviders: dash?.numServiceProviders ?? 0,
          venueProviders: dash?.numVenueProviders ?? 0
        },
        events: {
          upcoming: dash?.totalUpcoming ?? 0,
          ongoing: dash?.totalOngoing ?? 0,
          completed: dash?.totalCompleted ?? 0,
          cancelled: dash?.totalCancelled ?? 0
        },
        venues: [],
        services: [],
        eventTypes: types || {},
        dailyStats: { bookings, cancellations },
        revenueByOrganizer: Array.isArray(dash?.revenueByOrganizer) ? dash.revenueByOrganizer : [],
        venueUtilizationRate: dash?.venueUtilizationRate != null ? Number(dash.venueUtilizationRate) : null,
        serviceProviderUtilizationRate: dash?.serviceProviderUtilizationRate != null ? Number(dash.serviceProviderUtilizationRate) : null,
        venueActiveNow: dash?.venueActiveNow ?? 0,
        venueTotal: dash?.venueTotal ?? 0,
        serviceActiveNow: dash?.serviceProvidersActiveNow ?? 0,
        serviceTotal: dash?.serviceProvidersTotal ?? 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const venueUtilization = typeof dashboardData.venueUtilizationRate === 'number'
    ? Math.round(dashboardData.venueUtilizationRate * 100)
    : (dashboardData.venues && dashboardData.venues.length > 0
        ? Math.round((dashboardData.venues.filter(v => v.bookings && v.bookings.length > 0).length / dashboardData.venues.length) * 100)
        : 0);

  const serviceUtilization = typeof dashboardData.serviceProviderUtilizationRate === 'number'
    ? Math.round(dashboardData.serviceProviderUtilizationRate * 100)
    : (dashboardData.services && dashboardData.services.length > 0
        ? Math.round((dashboardData.services.filter(s => s.bookings && s.bookings.length > 0).length / dashboardData.services.length) * 100)
        : 0);

  const eventTypeData = Object.entries(dashboardData.eventTypes || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count
  }));
  const eventTypeTotal = eventTypeData.reduce((sum, d) => sum + (d.count || 0), 0);
  const eventTypePieData = eventTypeData.map(d => ({ name: d.name, value: d.count }));

  const totalRevenue = dashboardData.revenueByOrganizer.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const PALETTE = ['#3b82f6', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#ec4899', '#6c757d'];

  const formatMoneyShort = (n) => {
    const v = Number(n) || 0;
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
    if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000)         return (v / 1_000).toFixed(1) + 'K';
    return v.toString();
  };

  const revenueChartData = dashboardData.revenueByOrganizer.map((r, i) => ({
    name: r.name,
    revenue: r.revenue || 0,
    pct: totalRevenue ? ((r.revenue || 0) / totalRevenue) * 100 : 0,
    fill: PALETTE[i % PALETTE.length],
  }));

  // Word wrap for outside labels
  const wrapWords = (text, maxPerLine = 12, maxLines = 2) => {
    const words = (text || "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const tryLine = line ? line + " " + w : w;
      if (tryLine.length <= maxPerLine) {
        line = tryLine;
      } else {
        if (line) lines.push(line);
        line = w;
        if (lines.length === maxLines - 1) break;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    const used = lines.join(" ").length;
    const leftover = (text || "").slice(used).trim();
    if (leftover.length > 0) {
      const last = lines.pop() || "";
      const trimmed = last.length > 1 ? last.slice(0, Math.max(1, maxPerLine - 1)) + "…" : last + "…";
      lines.push(trimmed);
    }
    return lines;
  };

  const LABEL_RADIUS_FACTOR = 1.30;
  const CLAMP_RADIUS_FACTOR = 1.50;
  const CHAR_WIDTH_FACTOR   = 0.62;

  const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const RAD = Math.PI / 180;
    const slices = eventTypePieData.length;
    const font = slices <= 4 ? 14 : slices <= 6 ? 12 : 10;
    const maxPerLine = slices <= 4 ? 14 : slices <= 6 ? 12 : 11;

    const r = outerRadius * LABEL_RADIUS_FACTOR;
    let x = cx + r * Math.cos(-midAngle * RAD);
    let y = cy + r * Math.sin(-midAngle * RAD);

    const maxR = outerRadius * CLAMP_RADIUS_FACTOR;
    const pad = 8;
    const minX = cx - maxR + pad;
    const maxX = cx + maxR - pad;
    const minY = cy - maxR + pad;
    const maxY = cy + maxR - pad;

    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));

    const anchor = x >= cx ? "start" : "end";
    const lines = wrapWords(name || "", maxPerLine, 2);
    const pctText = `• ${Math.round(percent * 100)}%`;

    const estWidth = (s) => s.length * font * CHAR_WIDTH_FACTOR;
    let last = lines[lines.length - 1] || "";
    if (estWidth(last + " " + pctText) > (maxR * 0.9)) {
      last = last.slice(0, Math.max(1, last.length - 3)) + "…";
    }

    return (
      <text x={x} y={y} textAnchor={anchor} dominantBaseline="central" fontSize={font} fill="#334155">
        {lines.slice(0, -1).map((ln, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : font + 2}>{ln}</tspan>
        ))}
        <tspan x={x} dy={lines.length > 1 ? font + 2 : 0}>
          {lines.length > 0 ? `${last} ${pctText}` : pctText}
        </tspan>
      </text>
    );
  };

  const isMainDashboard = location.pathname === '/' || location.pathname === '/admin' || location.pathname === '';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error Loading Dashboard</h3>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            Unable to fetch dashboard data: {error}
          </p>
          <button
            onClick={loadDashboardData}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      {isMainDashboard && (
        <>
          <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
            System Admin Dashboard
          </h2>
          <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
            Monitor and control the entire event management system
          </p>

          {/* Navigation Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div
              className="card text-center"
              style={{ cursor: 'pointer', border: '2px solid #3b82f6', transition: 'all 0.3s ease' }}
              onClick={() => navigate('/admin/user-management')}
            >
              <h3 className="text-primary">{Object.values(dashboardData.users).reduce((a, b) => a + b, 0)}</h3>
              <p className="text-muted">Total Users</p>
              <small className="text-primary">Click to manage users →</small>
            </div>
            <div
              className="card text-center"
              style={{ cursor: 'pointer', border: '2px solid #28a745', transition: 'all 0.3s ease' }}
              onClick={() => navigate('/admin/event-monitoring')}
            >
              <h3 className="text-success">{Object.values(dashboardData.events).reduce((a, b) => a + b, 0)}</h3>
              <p className="text-muted">Total Events</p>
              <small className="text-success">Click to manage events →</small>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="card mb-4">
            <h4 className="mb-3">User Breakdown</h4>
            <table className="table">
              <tbody>
                <tr><td>Admins</td><td className="text-right fw-bold">{dashboardData.users.admins}</td></tr>
                <tr><td>Event Organizers</td><td className="text-right fw-bold">{dashboardData.users.eventOrganizers}</td></tr>
                <tr><td>Event Attendees</td><td className="text-right fw-bold">{dashboardData.users.eventAttendees}</td></tr>
                <tr><td>Service Providers</td><td className="text-right fw-bold">{dashboardData.users.serviceProviders}</td></tr>
                <tr><td>Venue Providers</td><td className="text-right fw-bold">{dashboardData.users.venueProviders}</td></tr>
              </tbody>
            </table>
          </div>

          {/* === Four balanced chart cards === */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            <UtilizationPanel
              title="Venue Utilization"
              valuePct={venueUtilization}
              used={dashboardData.venueActiveNow}
              total={dashboardData.venueTotal}
              color="#f59e0b"
            />

            <UtilizationPanel
              title="Service Providers Utilization"
              valuePct={serviceUtilization}
              used={dashboardData.serviceActiveNow}
              total={dashboardData.serviceTotal}
              color="#ef4444"
            />

            <ChartCard
              title="Event Type Distribution"
              footer="Hover a slice for exact counts."
            >
              {eventTypeTotal > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: -6, right: 32, bottom: 16, left: 32 }}>
                    <Pie
                      data={eventTypePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={96}
                      label={renderOutsideLabel}
                      labelLine
                      cx="50%"
                      cy="52%"
                    >
                      {eventTypePieData.map((entry, i) => (
                        <Cell key={`slice-${i}`} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${((value / eventTypeTotal) * 100).toFixed(1)}% (${value})`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted" style={{ margin: '0.5rem 0 0.75rem' }}>No event types yet.</p>
              )}
            </ChartCard>

            <ChartCard
              title="Revenue per Organizer"
              footer="Bars are color-coded; hover to see exact amount and % of total."
              pad="1rem"
            >
              {revenueChartData.length > 0 ? (
                // add this wrapper ↓
                <div style={{ height: "100%", marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData} margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" interval={0} angle={-20} dy={12} height={60} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatMoneyShort} width={48} />
                      <Tooltip
                        formatter={(value, _name, props) => [
                          `$${Number(value).toLocaleString()} (${props?.payload?.pct?.toFixed(1)}%)`,
                          "Revenue",
                        ]}
                      />
                      {/* remove the Legend to hide the “revenue” label */}
                      {/* <Legend /> */}
                      <Bar dataKey="revenue" isAnimationActive>
                        {revenueChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted">No revenue data available</p>
              )}
            </ChartCard>

          </div>

          {/* Daily Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div className="card text-center">
              <h4 className="text-success">{dashboardData.dailyStats.bookings}</h4>
              <p className="text-muted">Daily Booking Count</p>
            </div>
            <div className="card text-center">
              <h4 className="text-danger">{dashboardData.dailyStats.cancellations}</h4>
              <p className="text-muted">Daily Cancellation Count</p>
            </div>
          </div>
        </>
      )}

      <Routes>
        <Route path="user-management" element={<UserManagement />} />
        <Route path="event-monitoring" element={<EventMonitoring />} />
        <Route path="/" element={<div />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;

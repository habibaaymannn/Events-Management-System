import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getAllVenuesByProvider, getBookingsByVenueProviderId } from "../../api/venueApi";

const VenueOverview = () => {
    const navigate = useNavigate();
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
            console.error("Error loading overview data:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalVenues = venues.length;
    const availableVenues = venues.filter(v => v.availability === "AVAILABLE").length;
    const unavailableVenues = venues.filter(v => v.availability === "UNAVAILABLE").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalBookings = bookings.length;

    const venueStatusData = [
        { name: "Available", value: availableVenues, color: "#28a745" },
        { name: "Unavailable", value: unavailableVenues, color: "#dc3545" },
    ].filter(v => v.value > 0);

    const handleVenuesClick = () => navigate('/venue-provider/venues');
    const handleBookingsClick = () => navigate('/venue-provider/bookings');
    const handleRevenueClick = () => navigate('/venue-provider/revenue');

    if (loading) {
        return (
            <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
                <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
                    Venue Provider Dashboard
                </h2>
                <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
                    Loading dashboard data...
                </p>
            </div>
        );
    }

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
                    <h3 className="text-info">{totalVenues > 0 ? Math.round((totalBookings / totalVenues)) : 0}</h3>
                    <p className="text-muted">Avg Bookings/Venue</p>
                </div>
            </div>

            {/* Charts Section */}
            {venueStatusData.length > 0 && (
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
              </div>
            )}

            {/* Recent Activity */}
            {bookings.length > 0 && (
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
                      {bookings.slice(0, 3).map((booking) => {
                          const venue = venues.find(v => v.id === booking.venueId);
                          return (
                              <div key={booking.id} className="card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                      <h5 style={{ margin: 0, color: "#2c3e50" }}>Event #{booking.eventId}</h5>
                                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                          {booking.status}
                                      </span>
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                      <p style={{ margin: '0.25rem 0' }}><strong>Venue:</strong> {venue?.name || 'Unknown'}</p>
                                      <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {new Date(booking.startTime).toLocaleDateString()}</p>
                                      <p style={{ margin: '0.25rem 0' }}><strong>Revenue:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>${(booking.amount || 0).toLocaleString()}</span></p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
            )}

            {/* Venue Quick Access */}
            {venues.length > 0 && (
              <div className="card">
                  <h4 style={{ marginBottom: '1.5rem', color: "#2c3e50" }}>Your Venues</h4>
                  <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                      gap: '1.5rem'
                  }}>
                      {venues.map((venue) => {
                          const venueBookings = bookings.filter(b => b.venueId === venue.id);
                          const venueRevenue = venueBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
                          
                          return (
                              <div key={venue.id} className="card">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                      <h5 style={{ margin: 0, color: "#2c3e50" }}>{venue.name}</h5>
                                      <span className={`status-badge status-${venue.availability === "AVAILABLE" ? "confirmed" : "cancelled"}`}>
                                          {venue.availability === "AVAILABLE" ? "Available" : "Unavailable"}
                                      </span>
                                  </div>
                                  <div style={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: 'repeat(3, 1fr)', 
                                      gap: '1rem',
                                      textAlign: 'center'
                                  }}>
                                      <div>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
                                              {venue.capacity?.maxCapacity || 0}
                                          </div>
                                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Capacity</div>
                                      </div>
                                      <div>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
                                              {venueBookings.length}
                                          </div>
                                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Bookings</div>
                                      </div>
                                      <div>
                                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>
                                              ${venueRevenue.toLocaleString()}
                                          </div>
                                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>Revenue</div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
            )}
        </div>
    );
};

export default VenueOverview;
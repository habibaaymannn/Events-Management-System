import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBookingsByAttendeeId } from "../../api/bookingApi";
import { getAllEvents } from "../../api/eventApi";

const AttendeeDashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [stats, setStats] = useState({
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        pendingBookings: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Get attendee ID from auth context
            const attendeeId = "current-attendee-id"; // Replace with actual attendee ID
            
            const [attendeeBookings, eventsResponse] = await Promise.all([
                getBookingsByAttendeeId(attendeeId),
                getAllEvents(0, 10) // Get recent events
            ]);

            setBookings(attendeeBookings);
            setUpcomingEvents(eventsResponse.content || []);

            // Calculate stats
            const now = new Date();
            const upcomingCount = attendeeBookings.filter(b => 
                new Date(b.startTime) > now && 
                (b.status === 'ACCEPTED' || b.status === 'CONFIRMED')
            ).length;
            
            const completedCount = attendeeBookings.filter(b => 
                new Date(b.endTime) < now && 
                (b.status === 'ACCEPTED' || b.status === 'CONFIRMED')
            ).length;

            const pendingCount = attendeeBookings.filter(b => b.status === 'PENDING').length;

            setStats({
                totalBookings: attendeeBookings.length,
                upcomingBookings: upcomingCount,
                completedBookings: completedCount,
                pendingBookings: pendingCount
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    };

    return (
        <div className="event-page">
            <div className="event-page-header">
                <h3 className="event-page-title">Attendee Dashboard</h3>
                <p className="event-page-subtitle">Welcome! Manage your event bookings and discover new events</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card clickable-stat" onClick={() => navigate('/attendee/bookings')}>
                    <div className="stat-icon bookings-icon">📋</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.totalBookings}</h3>
                        <p className="stat-label">My Bookings</p>
                        <span className="stat-link">View all →</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon upcoming-icon">🚀</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.upcomingBookings}</h3>
                        <p className="stat-label">Upcoming Events</p>
                        <span className="stat-change positive">Ready to attend</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending-icon">⏳</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.pendingBookings}</h3>
                        <p className="stat-label">Pending Approval</p>
                        <span className="stat-change neutral">Awaiting confirmation</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon completed-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.completedBookings}</h3>
                        <p className="stat-label">Completed Events</p>
                        <span className="stat-change positive">Successfully attended</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="event-section">
                <h4 className="section-title">Quick Actions</h4>
                <div className="quick-actions-grid">
                    <button 
                        className="action-card primary" 
                        onClick={() => navigate('/attendee/bookings')}
                    >
                        <div className="action-icon">📋</div>
                        <div className="action-content">
                            <h5>My Bookings</h5>
                            <p>View and manage your event bookings</p>
                        </div>
                    </button>

                    <button 
                        className="action-card" 
                        onClick={() => navigate('/events')}
                    >
                        <div className="action-icon">🎯</div>
                        <div className="action-content">
                            <h5>Browse Events</h5>
                            <p>Discover and book new events</p>
                        </div>
                    </button>

                    <button 
                        className="action-card" 
                        onClick={() => navigate('/venues')}
                    >
                        <div className="action-icon">🏢</div>
                        <div className="action-content">
                            <h5>Find Venues</h5>
                            <p>Browse available venues</p>
                        </div>
                    </button>

                    <button 
                        className="action-card" 
                        onClick={() => navigate('/services')}
                    >
                        <div className="action-content">
                            <h5>Book Services</h5>
                            <p>Find service providers</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="event-section">
                <div className="section-header">
                    <h4 className="section-title">Recent Bookings</h4>
                    <button 
                        className="view-all-btn" 
                        onClick={() => navigate('/attendee/bookings')}
                    >
                        View All →
                    </button>
                </div>

                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <h5>No bookings yet</h5>
                        <p>Start by browsing events and making your first booking!</p>
                        <button 
                            className="event-btn success" 
                            onClick={() => navigate('/events')}
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="bookings-preview">
                        {bookings.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="booking-preview-card">
                                <div className="booking-preview-header">
                                    <span className="booking-type">
                                        {booking.type === 'VENUE' ? '🏢 Venue' : '🛠️ Service'}
                                    </span>
                                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="booking-preview-content">
                                    <p className="booking-date">
                                        📅 {new Date(booking.startTime).toLocaleDateString()}
                                    </p>
                                    <p className="booking-time">
                                        ⏰ {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Events */}
            <div className="event-section">
                <div className="section-header">
                    <h4 className="section-title">Available Events</h4>
                    <button 
                        className="view-all-btn" 
                        onClick={() => navigate('/events')}
                    >
                        Browse All →
                    </button>
                </div>

                <div className="events-preview">
                    {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="event-preview-card">
                            <div className="event-preview-header">
                                <h5 className="event-name">{event.name}</h5>
                                <span className="event-type">{event.type}</span>
                            </div>
                            <div className="event-preview-content">
                                <p className="event-date">📅 {event.date || new Date(event.startTime).toLocaleDateString()}</p>
                                <p className="event-description">{event.description}</p>
                                {event.retailPrice && (
                                    <p className="event-price">💰 ${event.retailPrice}</p>
                                )}
                            </div>
                            <button 
                                className="event-btn secondary" 
                                onClick={() => navigate(`/events/${event.id}`)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AttendeeDashboard;

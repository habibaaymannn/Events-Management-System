import React, { useState, useEffect } from "react";
import { getBookingsByAttendeeId, getBookingById } from "../../api/bookingApi";
import { updateBookingStatus } from "../../api/bookingApi";

const AttendeeBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            // Get attendee ID from auth context or localStorage
            const attendeeId = "current-attendee-id"; // Replace with actual attendee ID
            const bookingsData = await getBookingsByAttendeeId(attendeeId);
            setBookings(bookingsData);
        } catch (error) {
            console.error("Error loading bookings:", error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (booking) => {
        try {
            const details = await getBookingById(booking.id);
            setBookingDetails(details);
            setSelectedBooking(booking);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            // Fallback to using booking object directly
            setBookingDetails(booking);
            setSelectedBooking(booking);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await updateBookingStatus(bookingId, "CANCELLED");
                loadBookings();
                alert("Booking cancelled successfully!");
            } catch (error) {
                console.error("Error cancelling booking:", error);
                alert("Failed to cancel booking. Please try again.");
            }
        }
    };

    const filteredBookings = filter === "All"
        ? bookings
        : bookings.filter(booking => booking.status === filter);

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "PENDING").length,
        confirmed: bookings.filter(b => b.status === "ACCEPTED" || b.status === "CONFIRMED").length,
        cancelled: bookings.filter(b => b.status === "CANCELLED").length
    };

    if (loading) {
        return (
            <div className="event-page">
                <div className="event-page-header">
                    <h3 className="event-page-title">My Bookings</h3>
                    <p className="event-page-subtitle">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="event-page">
            <div className="event-page-header">
                <h3 className="event-page-title">My Bookings</h3>
                <p className="event-page-subtitle">View and manage your event bookings</p>
            </div>

            {/* Booking Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total-icon">📊</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.total}</h3>
                        <p className="stat-label">Total Bookings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending-icon">⏳</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.pending}</h3>
                        <p className="stat-label">Pending</p>
                        <span className="stat-change neutral">Awaiting confirmation</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon confirmed-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.confirmed}</h3>
                        <p className="stat-label">Confirmed</p>
                        <span className="stat-change positive">Ready to attend</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon cancelled-icon">❌</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.cancelled}</h3>
                        <p className="stat-label">Cancelled</p>
                        <span className="stat-change negative">No longer attending</span>
                    </div>
                </div>
            </div>

            <div className="event-section">
                <div className="section-header">
                    <h4 className="section-title">Booking Management</h4>
                    <div className="header-actions">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-control filter-select"
                        >
                            <option value="All">All Bookings</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Confirmed</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <h5>No bookings found</h5>
                        <p>You don't have any bookings matching the selected filter.</p>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-card-header">
                                    <h5 className="booking-card-title">
                                        {booking.type === 'VENUE' ? '🏢 Venue Booking' : '🛠️ Service Booking'}
                                    </h5>
                                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="booking-card-content">
                                    <div className="booking-details">
                                        <p className="booking-id">📋 Booking ID: {booking.id}</p>
                                        <p className="booking-start">📅 Start: {new Date(booking.startTime).toLocaleString()}</p>
                                        <p className="booking-end">⏰ End: {new Date(booking.endTime).toLocaleString()}</p>
                                        {booking.venueId && <p className="booking-venue">🏢 Venue ID: {booking.venueId}</p>}
                                        {booking.serviceId && <p className="booking-service">🛠️ Service ID: {booking.serviceId}</p>}
                                        {booking.currency && <p className="booking-currency">💰 Currency: {booking.currency}</p>}
                                    </div>

                                    {booking.createdAt && (
                                        <div className="booking-meta">
                                            <p className="booking-created">
                                                <strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="booking-card-actions">
                                    <button
                                        className="event-btn secondary"
                                        onClick={() => handleViewDetails(booking)}
                                    >
                                        View Details
                                    </button>
                                    {(booking.status === "PENDING" || booking.status === "ACCEPTED") && (
                                        <button
                                            className="event-btn danger"
                                            onClick={() => handleCancelBooking(booking.id)}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && bookingDetails && (
                <div className="modal-overlay" onClick={() => {setSelectedBooking(null); setBookingDetails(null);}}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Booking Details</h4>
                            <button
                                className="modal-close"
                                onClick={() => {setSelectedBooking(null); setBookingDetails(null);}}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h5>Booking Information</h5>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Booking ID:</strong> {bookingDetails.id}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Type:</strong> {bookingDetails.type}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Status:</strong> {bookingDetails.status}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Start Time:</strong> {new Date(bookingDetails.startTime).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>End Time:</strong> {new Date(bookingDetails.endTime).toLocaleString()}
                                    </div>
                                    {bookingDetails.currency && (
                                        <div className="detail-item">
                                            <strong>Currency:</strong> {bookingDetails.currency}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {bookingDetails.venueId && (
                                <div className="detail-section">
                                    <h5>Venue Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Venue ID:</strong> {bookingDetails.venueId}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingDetails.serviceId && (
                                <div className="detail-section">
                                    <h5>Service Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Service ID:</strong> {bookingDetails.serviceId}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingDetails.attendeeBooker && (
                                <div className="detail-section">
                                    <h5>Your Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Name:</strong> {bookingDetails.attendeeBooker.firstName} {bookingDetails.attendeeBooker.lastName}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Email:</strong> {bookingDetails.attendeeBooker.email}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Phone:</strong> {bookingDetails.attendeeBooker.phoneNumber}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(bookingDetails.createdAt || bookingDetails.updatedAt) && (
                                <div className="detail-section">
                                    <h5>Timestamps</h5>
                                    <div className="detail-grid">
                                        {bookingDetails.createdAt && (
                                            <div className="detail-item">
                                                <strong>Created:</strong> {new Date(bookingDetails.createdAt).toLocaleString()}
                                            </div>
                                        )}
                                        {bookingDetails.updatedAt && (
                                            <div className="detail-item">
                                                <strong>Updated:</strong> {new Date(bookingDetails.updatedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {bookingDetails.cancellationReason && (
                                <div className="detail-section">
                                    <h5>Additional Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item full-width">
                                            <strong>Cancellation Reason:</strong>
                                            <p>{bookingDetails.cancellationReason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingDetails.stripePaymentId && (
                                <div className="detail-section">
                                    <h5>Payment Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Payment ID:</strong> {bookingDetails.stripePaymentId}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendeeBookings;

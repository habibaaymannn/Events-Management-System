import React, { useState, useEffect } from "react";
import { getServiceProviderBookings, updateBookingStatus } from "../../api/serviceApi";
import { getBookingById } from "../../api/bookingApi";

const ServiceBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await getServiceProviderBookings(0, 100);
            // Map the backend response to expected frontend format
            const mappedBookings = (response || []).map(booking => ({
                id: booking.id,
                serviceName: "Service", // You may need to get this from a separate endpoint
                clientName: booking.organizerBooker?.fullName || `${booking.organizerBooker?.firstName || ''} ${booking.organizerBooker?.lastName || ''}`.trim(),
                clientEmail: booking.organizerBooker?.email || booking.attendeeBooker?.email,
                clientPhone: "N/A", // Phone not in response
                eventDate: new Date(booking.startTime).toLocaleDateString(),
                eventTime: new Date(booking.startTime).toLocaleTimeString(),
                eventLocation: booking.organizerBooker?.events?.[0]?.venue?.location || "TBD",
                quantity: 1, // Default since not in response
                unitPrice: 0, // You may need to calculate this
                totalAmount: 0, // You may need to calculate this
                status: booking.status,
                requestDate: new Date(booking.createdAt).toLocaleDateString(),
                eventType: booking.organizerBooker?.events?.[0]?.type || "Unknown",
                specialRequests: booking.cancellationReason || "None",
                notes: "Booking request",
                organizerBooker: booking.organizerBooker,
                attendeeBooker: booking.attendeeBooker,
                startTime: booking.startTime,
                endTime: booking.endTime
            }));
            setBookings(mappedBookings);
        } catch (error) {
            console.error("Error loading bookings:", error);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            let statusToUpdate = newStatus;
            
            // Map frontend status to backend enum values
            if (newStatus === "ACCEPTED") {
                statusToUpdate = "ACCEPTED";
            } else if (newStatus === "REJECTED") {
                statusToUpdate = "REJECTED";
                const reason = prompt("Please provide a reason for rejection:");
                // If using the specific service API with reason, use that instead
                await respondToBookingRequest(bookingId, "REJECTED", reason || "No reason provided");
                addNotification("Booking rejected!", "client");
                loadBookings();
                return;
            } else if (newStatus === "CANCELLED") {
                statusToUpdate = "CANCELLED";
                const reason = prompt("Please provide a reason for cancellation:");
                await cancelServiceBooking(bookingId, reason || "Cancelled by service provider");
                addNotification("Booking cancelled!", "client");
                loadBookings();
                return;
            }

            // Use the general booking status update endpoint
            await updateBookingStatus(bookingId, statusToUpdate);
            addNotification(`Booking ${statusToUpdate.toLowerCase()}!`, "client");
            loadBookings();
        } catch (error) {
            console.error("Error updating booking status:", error);
        }
    };

    const addNotification = (message, client) => {
        const notification = {
            id: Date.now(),
            message,
            client,
            timestamp: new Date().toLocaleString(),
            read: false
        };
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
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

    const filteredBookings = filter === "All"
        ? bookings
        : bookings.filter(booking => booking.status === filter);

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "PENDING").length,
        confirmed: bookings.filter(b => b.status === "ACCEPTED" || b.status === "CONFIRMED").length,
        cancelled: bookings.filter(b => b.status === "CANCELLED").length,
        totalRevenue: bookings
            .filter(b => b.status === "ACCEPTED" || b.status === "CONFIRMED")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        pendingRevenue: bookings
            .filter(b => b.status === "PENDING")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };

    return (
        <div className="service-page">
            <div className="service-page-header">
                <h3 className="service-page-title">Service Bookings</h3>
                <p className="service-page-subtitle">Manage your service requests and bookings</p>
            </div>

            {/* Booking Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bookings-icon">📅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.total}</h3>
                        <p className="stat-label">Total Bookings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending-icon">⏳</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.pending}</h3>
                        <p className="stat-label">Pending Requests</p>
                        <span className="stat-change neutral">Needs attention</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon confirmed-icon">✅</div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.confirmed}</h3>
                        <p className="stat-label">Confirmed</p>
                        <span className="stat-change positive">Ready to deliver</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon revenue-icon">💰</div>
                    <div className="stat-content">
                        <h3 className="stat-number">${stats.totalRevenue.toLocaleString()}</h3>
                        <p className="stat-label">Confirmed Revenue</p>
                        <span className="stat-change positive">
                            +${stats.pendingRevenue.toLocaleString()} pending
                        </span>
                    </div>
                </div>
            </div>

            {/* Notifications Panel */}
            {notifications.length > 0 && (
                <div className="notifications-panel">
                    <h4>Recent Notifications</h4>
                    <div className="notifications-list">
                        {notifications.slice(0, 3).map(notif => (
                            <div key={notif.id} className="notification-item">
                                <div className="notification-content">
                                    <p className="notification-message">{notif.message}</p>
                                    <p className="notification-client">Client: {notif.client}</p>
                                </div>
                                <span className="notification-time">{notif.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="service-section">
                <div className="section-header">
                    <h4 className="section-title">Booking Requests</h4>
                    <div className="filter-controls">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-control"
                            style={{ width: "150px" }}
                        >
                            <option value="All">All Bookings</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="bookings-grid">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <div className="booking-title-section">
                                    <h5 className="booking-title">{booking.serviceName}</h5>
                                    <p className="booking-client">{booking.clientName}</p>
                                </div>
                                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="booking-details">
                                <div className="detail-row">
                                    <span className="detail-label">Event Type:</span>
                                    <span className="detail-value">{booking.eventType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date & Time:</span>
                                    <span className="detail-value">{booking.eventDate} at {booking.eventTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Location:</span>
                                    <span className="detail-value">{booking.eventLocation}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Client Email:</span>
                                    <span className="detail-value">{booking.clientEmail}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Requested:</span>
                                    <span className="detail-value">{booking.requestDate}</span>
                                </div>
                            </div>

                            {booking.specialRequests && booking.specialRequests !== "None" && (
                                <div className="special-requests">
                                    <strong>Special Requests:</strong>
                                    <p>{booking.specialRequests}</p>
                                </div>
                            )}

                            <div className="booking-actions">
                                <button
                                    className="service-btn"
                                    onClick={() => handleViewDetails(booking)}
                                >
                                    View Details
                                </button>
                                {booking.status === "PENDING" && (
                                    <>
                                        <button
                                            className="service-btn success"
                                            onClick={() => handleStatusChange(booking.id, "ACCEPTED")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="service-btn danger"
                                            onClick={() => handleStatusChange(booking.id, "REJECTED")}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {(booking.status === "ACCEPTED" || booking.status === "CONFIRMED") && (
                                    <button
                                        className="service-btn secondary"
                                        onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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

                            {bookingDetails.organizerBooker && (
                                <div className="detail-section">
                                    <h5>Organizer Information</h5>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <strong>Name:</strong> {bookingDetails.organizerBooker.firstName} {bookingDetails.organizerBooker.lastName}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Email:</strong> {bookingDetails.organizerBooker.email}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Phone:</strong> {bookingDetails.organizerBooker.phoneNumber}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bookingDetails.attendeeBooker && (
                                <div className="detail-section">
                                    <h5>Attendee Information</h5>
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

                            {(bookingDetails.cancellationReason || bookingDetails.stripePaymentId) && (
                                <div className="detail-section">
                                    <h5>Additional Information</h5>
                                    <div className="detail-grid">
                                        {bookingDetails.cancellationReason && (
                                            <div className="detail-item full-width">
                                                <strong>Cancellation Reason:</strong>
                                                <p>{bookingDetails.cancellationReason}</p>
                                            </div>
                                        )}
                                        {bookingDetails.stripePaymentId && (
                                            <div className="detail-item">
                                                <strong>Payment ID:</strong> {bookingDetails.stripePaymentId}
                                            </div>
                                        )}
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

export default ServiceBookings;
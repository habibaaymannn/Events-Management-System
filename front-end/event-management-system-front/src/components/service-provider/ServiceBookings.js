import React, { useState } from "react";

const mockBookings = [
    {
        id: 1,
        serviceId: 1,
        serviceName: "Premium Wedding Catering",
        clientName: "Sarah & Mike Wedding",
        clientEmail: "sarah.mike@email.com",
        clientPhone: "+1 234-567-8900",
        eventDate: "2024-02-20",
        eventTime: "18:00",
        eventLocation: "Garden Pavilion, City Park",
        quantity: 120,
        unitPrice: 50,
        totalAmount: 6000,
        status: "Pending",
        requestDate: "2024-01-15",
        eventType: "Wedding",
        specialRequests: "Vegetarian options for 20 guests, gluten-free desserts",
        notes: "High-profile wedding, ensure premium service"
    },
    {
        id: 2,
        serviceId: 2,
        serviceName: "Professional Event Photography",
        clientName: "TechCorp Inc.",
        clientEmail: "events@techcorp.com",
        clientPhone: "+1 234-567-8901",
        eventDate: "2024-02-15",
        eventTime: "09:00",
        eventLocation: "Grand Ballroom, Convention Center",
        quantity: 1,
        unitPrice: 1500,
        totalAmount: 1500,
        status: "Confirmed",
        requestDate: "2024-01-10",
        eventType: "Corporate Conference",
        specialRequests: "Focus on keynote speakers and networking sessions",
        notes: "Annual tech conference with 300+ attendees"
    },
    {
        id: 3,
        serviceId: 3,
        serviceName: "Complete AV Solution",
        clientName: "BusinessSolutions Ltd",
        clientEmail: "meetings@bizsolv.com",
        clientPhone: "+1 234-567-8902",
        eventDate: "2024-02-25",
        eventTime: "10:00",
        eventLocation: "Conference Center, Business District",
        quantity: 2,
        unitPrice: 800,
        totalAmount: 1600,
        status: "Confirmed",
        requestDate: "2024-01-12",
        eventType: "Corporate Meeting",
        specialRequests: "Video conferencing setup for international participants",
        notes: "Board meeting with remote attendees"
    },
    {
        id: 4,
        serviceId: 1,
        serviceName: "Premium Wedding Catering",
        clientName: "Hope Foundation",
        clientEmail: "gala@hopefoundation.org",
        clientPhone: "+1 234-567-8903",
        eventDate: "2024-03-10",
        eventTime: "19:00",
        eventLocation: "Grand Ballroom, Downtown",
        quantity: 200,
        unitPrice: 50,
        totalAmount: 10000,
        status: "Pending",
        requestDate: "2024-01-20",
        eventType: "Charity Gala",
        specialRequests: "Elegant presentation, dietary restrictions accommodated",
        notes: "Annual charity fundraising event"
    },
    {
        id: 5,
        serviceId: 2,
        serviceName: "Professional Event Photography",
        clientName: "StartupXYZ",
        clientEmail: "events@startupxyz.com",
        clientPhone: "+1 234-567-8904",
        eventDate: "2024-03-01",
        eventTime: "19:00",
        eventLocation: "Rooftop Terrace, Downtown",
        quantity: 1,
        unitPrice: 1500,
        totalAmount: 1500,
        status: "Cancelled",
        requestDate: "2024-01-18",
        eventType: "Product Launch",
        specialRequests: "Action shots and product photography",
        notes: "Event postponed due to scheduling conflicts"
    }
];

const ServiceBookings = () => {
    const [bookings, setBookings] = useState(mockBookings);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const handleStatusChange = (bookingId, newStatus) => {
        setBookings(bookings.map(booking => {
            if (booking.id === bookingId) {
                // Add notification
                const updatedBooking = { ...booking, status: newStatus };
                addNotification(`Booking #${bookingId} ${newStatus.toLowerCase()}`, updatedBooking.clientName);
                return updatedBooking;
            }
            return booking;
        }));
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

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
    };

    const filteredBookings = filter === "All"
        ? bookings
        : bookings.filter(booking => booking.status === filter);

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "Pending").length,
        confirmed: bookings.filter(b => b.status === "Confirmed").length,
        cancelled: bookings.filter(b => b.status === "Cancelled").length,
        totalRevenue: bookings
            .filter(b => b.status === "Confirmed")
            .reduce((sum, b) => sum + b.totalAmount, 0),
        pendingRevenue: bookings
            .filter(b => b.status === "Pending")
            .reduce((sum, b) => sum + b.totalAmount, 0)
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
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
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
                                    <span className="detail-label">Quantity:</span>
                                    <span className="detail-value">{booking.quantity}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Total Amount:</span>
                                    <span className="detail-value revenue">${booking.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Requested:</span>
                                    <span className="detail-value">{booking.requestDate}</span>
                                </div>
                            </div>

                            {booking.specialRequests && (
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
                                {booking.status === "Pending" && (
                                    <>
                                        <button
                                            className="service-btn success"
                                            onClick={() => handleStatusChange(booking.id, "Confirmed")}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="service-btn danger"
                                            onClick={() => handleStatusChange(booking.id, "Cancelled")}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {booking.status === "Confirmed" && (
                                    <button
                                        className="service-btn secondary"
                                        onClick={() => handleStatusChange(booking.id, "Cancelled")}
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
            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>Booking Details</h4>
                            <button
                                className="modal-close"
                                onClick={() => setSelectedBooking(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h5>Service Information</h5>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Service:</strong> {selectedBooking.serviceName}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Unit Price:</strong> ${selectedBooking.unitPrice}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Quantity:</strong> {selectedBooking.quantity}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Total Amount:</strong> ${selectedBooking.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5>Client Information</h5>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Client Name:</strong> {selectedBooking.clientName}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Email:</strong> {selectedBooking.clientEmail}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Phone:</strong> {selectedBooking.clientPhone}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Request Date:</strong> {selectedBooking.requestDate}
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5>Event Details</h5>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Event Type:</strong> {selectedBooking.eventType}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Date:</strong> {selectedBooking.eventDate}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Time:</strong> {selectedBooking.eventTime}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong>Location:</strong> {selectedBooking.eventLocation}
                                    </div>
                                    {selectedBooking.specialRequests && (
                                        <div className="detail-item full-width">
                                            <strong>Special Requests:</strong>
                                            <p>{selectedBooking.specialRequests}</p>
                                        </div>
                                    )}
                                    {selectedBooking.notes && (
                                        <div className="detail-item full-width">
                                            <strong>Notes:</strong>
                                            <p>{selectedBooking.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h5>Actions</h5>
                                <div className="modal-actions">
                                    {selectedBooking.status === "Pending" && (
                                        <>
                                            <button
                                                className="service-btn success"
                                                onClick={() => {
                                                    handleStatusChange(selectedBooking.id, "Confirmed");
                                                    setSelectedBooking(null);
                                                }}
                                            >
                                                Accept Booking
                                            </button>
                                            <button
                                                className="service-btn danger"
                                                onClick={() => {
                                                    handleStatusChange(selectedBooking.id, "Cancelled");
                                                    setSelectedBooking(null);
                                                }}
                                            >
                                                Reject Booking
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === "Confirmed" && (
                                        <button
                                            className="service-btn secondary"
                                            onClick={() => {
                                                handleStatusChange(selectedBooking.id, "Cancelled");
                                                setSelectedBooking(null);
                                            }}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceBookings;
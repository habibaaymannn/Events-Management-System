import React, { useState } from "react";

const mockBookings = [
    {
        id: 1,
        eventName: "Tech Conference 2024",
        venue: "Grand Ballroom",
        organizer: "TechCorp Inc.",
        date: "2024-02-15",
        startTime: "09:00",
        endTime: "17:00",
        status: "Confirmed",
        revenue: 5000,
        attendees: 350,
        contact: "john@techcorp.com",
        specialRequests: "Extra microphones, livestream setup"
    },
    {
        id: 2,
        eventName: "Wedding Reception",
        venue: "Garden Pavilion",
        organizer: "Sarah & Mike",
        date: "2024-02-20",
        startTime: "18:00",
        endTime: "23:00",
        status: "Pending",
        revenue: 3500,
        attendees: 120,
        contact: "sarah.mike@email.com",
        specialRequests: "Floral decorations, dance floor"
    },
    {
        id: 3,
        eventName: "Corporate Meeting",
        venue: "Conference Center",
        organizer: "BusinessSolutions Ltd",
        date: "2024-02-25",
        startTime: "10:00",
        endTime: "16:00",
        status: "Confirmed",
        revenue: 2000,
        attendees: 80,
        contact: "meetings@bizsolv.com",
        specialRequests: "Video conferencing equipment"
    },
    {
        id: 4,
        eventName: "Product Launch",
        venue: "Rooftop Terrace",
        organizer: "StartupXYZ",
        date: "2024-03-01",
        startTime: "19:00",
        endTime: "22:00",
        status: "Pending",
        revenue: 4200,
        attendees: 90,
        contact: "events@startupxyz.com",
        specialRequests: "Photography setup, cocktail service"
    },
    {
        id: 5,
        eventName: "Charity Gala",
        venue: "Grand Ballroom",
        organizer: "Hope Foundation",
        date: "2024-03-10",
        startTime: "18:30",
        endTime: "23:30",
        status: "Confirmed",
        revenue: 6000,
        attendees: 400,
        contact: "gala@hopefoundation.org",
        specialRequests: "Auction setup, VIP area"
    }
];

const Bookings = () => {
    const [bookings, setBookings] = useState(mockBookings);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleStatusChange = (bookingId, newStatus) => {
        setBookings(bookings.map(booking =>
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
    };

    const filteredBookings = filter === "All"
        ? bookings
        : bookings.filter(booking => booking.status === filter);

    const totalRevenue = bookings.reduce((sum, booking) =>
        booking.status === "Confirmed" ? sum + booking.revenue : sum, 0
    );

    const pendingRevenue = bookings.reduce((sum, booking) =>
        booking.status === "Pending" ? sum + booking.revenue : sum, 0
    );

    return (
        <div className="venue-page">
            <div className="venue-page-header">
                <h3 className="venue-page-title">Booking Management</h3>
                <p className="venue-page-subtitle">Track and manage all venue bookings</p>
            </div>

            {/* Booking Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-number">{bookings.length}</h3>
                        <p className="stat-label">Total Bookings</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-number">{bookings.filter(b => b.status === "Confirmed").length}</h3>
                        <p className="stat-label">Confirmed</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-number">{bookings.filter(b => b.status === "Pending").length}</h3>
                        <p className="stat-label">Pending</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <h3 className="stat-number">${totalRevenue.toLocaleString()}</h3>
                        <p className="stat-label">Confirmed Revenue</p>
                    </div>
                </div>
            </div>

            <div className="venue-section">
                <div className="section-header">
                    <h4 className="section-title">Booking List</h4>
                    <div className="filter-controls">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-control"
                            style={{ width: "150px" }}
                        >
                            <option value="All">All Bookings</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="bookings-grid">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <h5 className="booking-title">{booking.eventName}</h5>
                                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="booking-details">
                                <div className="detail-row">
                                    <span className="detail-label">Venue:</span>
                                    <span className="detail-value">{booking.venue}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Organizer:</span>
                                    <span className="detail-value">{booking.organizer}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date:</span>
                                    <span className="detail-value">{booking.date}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Time:</span>
                                    <span className="detail-value">{booking.startTime} - {booking.endTime}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Attendees:</span>
                                    <span className="detail-value">{booking.attendees}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Revenue:</span>
                                    <span className="detail-value revenue">${booking.revenue.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="booking-actions">
                                <button
                                    className="venue-btn"
                                    onClick={() => handleViewDetails(booking)}
                                >
                                    View Details
                                </button>
                                {booking.status === "Pending" && (
                                    <>
                                        <button
                                            className="venue-btn success"
                                            onClick={() => handleStatusChange(booking.id, "Confirmed")}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            className="venue-btn danger"
                                            onClick={() => handleStatusChange(booking.id, "Cancelled")}
                                        >
                                            Cancel
                                        </button>
                                    </>
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
                                <h5>Event Information</h5>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong>Event Name:</strong> {selectedBooking.eventName}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Organizer:</strong> {selectedBooking.organizer}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Contact:</strong> {selectedBooking.contact}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Venue:</strong> {selectedBooking.venue}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Date:</strong> {selectedBooking.date}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Expected Attendees:</strong> {selectedBooking.attendees}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Revenue:</strong> ${selectedBooking.revenue.toLocaleString()}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong>Special Requests:</strong>
                                        <p>{selectedBooking.specialRequests}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
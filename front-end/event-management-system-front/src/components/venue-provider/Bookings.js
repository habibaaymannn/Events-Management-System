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
        <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
            <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
                Booking Management
            </h2>
            <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
                Track and manage all venue bookings
            </p>

            {/* Booking Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="card text-center">
                    <h3 className="text-primary">{bookings.length}</h3>
                    <p className="text-muted">Total Bookings</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-success">{bookings.filter(b => b.status === "Confirmed").length}</h3>
                    <p className="text-muted">Confirmed</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-warning">{bookings.filter(b => b.status === "Pending").length}</h3>
                    <p className="text-muted">Pending</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-success">${totalRevenue.toLocaleString()}</h3>
                    <p className="text-muted">Confirmed Revenue</p>
                </div>
            </div>

            <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: "#2c3e50" }}>Booking List</h3>
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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, color: "#2c3e50", fontSize: '1.2rem' }}>{booking.eventName}</h4>
                                <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div><strong>Venue:</strong> {booking.venue}</div>
                                    <div><strong>Organizer:</strong> {booking.organizer}</div>
                                    <div><strong>Date:</strong> {booking.date}</div>
                                    <div><strong>Time:</strong> {booking.startTime} - {booking.endTime}</div>
                                    <div><strong>Attendees:</strong> {booking.attendees}</div>
                                    <div><strong>Revenue:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>${booking.revenue.toLocaleString()}</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleViewDetails(booking)}
                                    style={{ flex: 1, minWidth: '100px' }}
                                >
                                    View Details
                                </button>
                                {booking.status === "Pending" && (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleStatusChange(booking.id, "Confirmed")}
                                            style={{ flex: 1, minWidth: '100px' }}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleStatusChange(booking.id, "Cancelled")}
                                            style={{ flex: 1, minWidth: '100px' }}
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
                        <div style={{ padding: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Event Information</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong>Event Name:</strong> {selectedBooking.eventName}</div>
                                    <div><strong>Organizer:</strong> {selectedBooking.organizer}</div>
                                    <div><strong>Contact:</strong> {selectedBooking.contact}</div>
                                    <div><strong>Venue:</strong> {selectedBooking.venue}</div>
                                    <div><strong>Date:</strong> {selectedBooking.date}</div>
                                    <div><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</div>
                                    <div><strong>Expected Attendees:</strong> {selectedBooking.attendees}</div>
                                    <div><strong>Revenue:</strong> ${selectedBooking.revenue.toLocaleString()}</div>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Special Requests:</strong>
                                    <p style={{ marginTop: '0.5rem', color: '#6c757d' }}>{selectedBooking.specialRequests}</p>
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
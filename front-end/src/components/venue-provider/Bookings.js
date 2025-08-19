import React, { useState, useEffect } from "react";
import { cancelVenueBooking, getAllVenues } from "../../api/venueApi";
import { updateBookingStatus, getBookingById } from "../../api/bookingApi";

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            // Get all venues and extract bookings from them
            const venues = await getAllVenues();
            const allBookings = [];
            
            venues.forEach(venue => {
                if (venue.bookings) {
                    venue.bookings.forEach(booking => {
                        allBookings.push({
                            ...booking,
                            venue: venue.name,
                            eventName: `Event at ${venue.name}`,
                            organizer: `${booking.organizerBooker?.firstName || ''} ${booking.organizerBooker?.lastName || ''}`.trim(),
                            contact: booking.organizerBooker?.email,
                            date: new Date(booking.startTime).toLocaleDateString(),
                            startTime: new Date(booking.startTime).toLocaleTimeString(),
                            endTime: new Date(booking.endTime).toLocaleTimeString(),
                            revenue: 0, // You may need to calculate this based on venue pricing
                            attendees: 'N/A', // This info may not be available in venue bookings
                            specialRequests: booking.cancellationReason || 'None'
                        });
                    });
                }
            });
            
            setBookings(allBookings);
        } catch (error) {
            console.error("Error loading bookings:", error);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            if (newStatus === "Confirmed") {
                await updateBookingStatus(bookingId, "ACCEPTED");
            } else if (newStatus === "Cancelled") {
                await updateBookingStatus(bookingId, "CANCELLED");
            }
            loadBookings();
        } catch (error) {
            console.error("Error updating booking status:", error);
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
                        <div style={{ padding: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Booking Information</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong>Booking ID:</strong> {bookingDetails.id}</div>
                                    <div><strong>Type:</strong> {bookingDetails.type}</div>
                                    <div><strong>Status:</strong> {bookingDetails.status}</div>
                                    <div><strong>Start Time:</strong> {new Date(bookingDetails.startTime).toLocaleString()}</div>
                                    <div><strong>End Time:</strong> {new Date(bookingDetails.endTime).toLocaleString()}</div>
                                    {bookingDetails.venueId && (
                                        <div><strong>Venue ID:</strong> {bookingDetails.venueId}</div>
                                    )}
                                </div>
                            </div>

                            {bookingDetails.organizerBooker && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Organizer Information</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div><strong>Name:</strong> {bookingDetails.organizerBooker.firstName} {bookingDetails.organizerBooker.lastName}</div>
                                        <div><strong>Email:</strong> {bookingDetails.organizerBooker.email}</div>
                                        <div><strong>Phone:</strong> {bookingDetails.organizerBooker.phoneNumber}</div>
                                    </div>
                                </div>
                            )}

                            {bookingDetails.attendeeBooker && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Attendee Information</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div><strong>Name:</strong> {bookingDetails.attendeeBooker.firstName} {bookingDetails.attendeeBooker.lastName}</div>
                                        <div><strong>Email:</strong> {bookingDetails.attendeeBooker.email}</div>
                                        <div><strong>Phone:</strong> {bookingDetails.attendeeBooker.phoneNumber}</div>
                                    </div>
                                </div>
                            )}

                            {(bookingDetails.createdAt || bookingDetails.updatedAt) && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Timestamps</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {bookingDetails.createdAt && (
                                            <div><strong>Created:</strong> {new Date(bookingDetails.createdAt).toLocaleString()}</div>
                                        )}
                                        {bookingDetails.updatedAt && (
                                            <div><strong>Updated:</strong> {new Date(bookingDetails.updatedAt).toLocaleString()}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {bookingDetails.cancellationReason && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong>Cancellation Reason:</strong>
                                    <p style={{ marginTop: '0.5rem', color: '#6c757d' }}>{bookingDetails.cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
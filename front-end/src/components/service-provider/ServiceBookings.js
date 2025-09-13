import React, { useState, useEffect } from "react";
import { getServiceProviderBookings } from "../../api/serviceApi";
import {
    cancelServiceBooking,
    getServiceBookingById,
    updateServiceBookingStatus
} from "../../api/bookingApi";
import { useLocation } from "react-router-dom";

const ServiceBookings = () => {
    const location = useLocation();
    const serviceId = location.state?.serviceId;

    const [serviceProviderId, setServiceProviderId] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);

    // Initialize serviceProviderId when Keycloak is ready
    useEffect(() => {
        const kc = window.keycloak;
        if (kc && kc.tokenParsed?.sub) {
            setServiceProviderId(kc.tokenParsed.sub);
        }
    }, []);

    // Load bookings whenever serviceProviderId changes
    useEffect(() => {
        if (!serviceProviderId) return;
        loadBookings();
    }, [serviceProviderId]);

    // Load bookings function
    const loadBookings = async () => {
        if (!serviceProviderId) return;

        try {
            const data = await getServiceProviderBookings(serviceProviderId);
            const allBookings = data.content.map((booking) => ({
                id: booking.id,
                ...booking,
                service: booking.serviceId,
                eventName: `Event #${booking.eventId}`,
                contact: booking.organizerBooker?.email,
                date: new Date(booking.startTime).toLocaleDateString(),
                startTime: new Date(booking.startTime).toLocaleTimeString(),
                endTime: new Date(booking.endTime).toLocaleTimeString(),
                revenue: booking.amount || 0,
                // attendees: booking.attendeesCount || "N/A",
                specialRequests: booking.cancellationReason || "None",
            }));

            setBookings(allBookings);
        } catch (error) {
            console.error("Error loading service bookings:", error);
        }
    };
    const handleAcceptBooking = async (bookingId) => {
        try {
            await updateServiceBookingStatus(bookingId, "ACCEPTED");
            await loadBookings(); // refresh list
        } catch (error) {
            console.error("Error accepting booking:", error);
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            await updateServiceBookingStatus(bookingId, "REJECTED");
            await loadBookings(); // refresh list
        } catch (error) {
            console.error("Error rejecting booking:", error);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            // Prompt for cancellation reason
            const cancellationReason = prompt("Please enter cancellation reason:");
            if (cancellationReason === null) return; // User cancelled the prompt

            await cancelServiceBooking(bookingId, cancellationReason);
            await loadBookings(); // Reload the bookings list
        } catch (error) {
            console.error("Error cancelling booking:", error);
        }
    };

    const handleViewDetails = async (booking) => {
        try {
            const details = await getServiceBookingById(booking.id);
            setBookingDetails(details);
            setSelectedBooking(booking);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            // Fallback to using booking object directly
            setBookingDetails(booking);
            setSelectedBooking(booking);
        }
    };

    const filteredBookings = bookings
        .filter(b => !serviceId || b.serviceId === serviceId)
        .filter(b => filter === "All" || b.status === filter);

    const totalRevenue = bookings.reduce((sum, booking) =>
        booking.status === "BOOKED" ? sum + (booking.amount || 0) : sum, 0
    );

    const pendingRevenue = bookings.reduce((sum, booking) =>
        booking.status === "PENDING" ? sum + (booking.amount || 0) : sum, 0
    );

    return (
        <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
            <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
                Service Booking Management
            </h2>
            <p style={{ textAlign: "center", marginBottom: 32, color: "#6c757d", fontSize: "1.1rem" }}>
                Track and manage all service bookings
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
                    <h3 className="text-warning">{bookings.filter(b => b.status === "PENDING").length}</h3>
                    <p className="text-muted">PENDING</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-success">{bookings.filter(b => b.status === "BOOKED").length}</h3>
                    <p className="text-muted">BOOKED</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-danger">{bookings.filter(b => b.status === "CANCELLED").length}</h3>
                    <p className="text-muted">CANCELLED</p>
                </div>
                <div className="card text-center">
                    <h3 className="text-success">${totalRevenue.toLocaleString()}</h3>
                    <p className="text-muted">Confirmed Revenue</p>
                </div>
            </div>

            <div className="card" style={{width: '100%', padding: '1.5rem'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{margin: 0, color: "#2c3e50"}}>Booking List</h3>
                    <div className="filter-controls">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-control"
                            style={{width: "150px"}}
                        >
                            <option value="All">All Bookings</option>
                            <option value="PENDING">PENDING</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="CANCELLED">CANCELLED</option>
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

                            <div style={{marginBottom: '1rem'}}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div><strong>Service ID:</strong> {booking.service}</div>
                                    <div><strong>Date:</strong> {booking.date}</div>
                                    <div><strong>Time:</strong> {booking.startTime} - {booking.endTime}</div>
                                    {/*<div><strong>Attendees:</strong> {booking.attendees}</div>*/}
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
                                {booking.status === "PENDING" && (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleAcceptBooking(booking.id)}
                                            style={{ flex: 1, minWidth: '100px' }}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleRejectBooking(booking.id)}
                                            style={{ flex: 1, minWidth: '100px' }}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {/* Add cancel button for all statuses except already cancelled */}
                                {booking.status !== "CANCELLED" && (
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => handleCancelBooking(booking.id)}
                                        style={{ flex: 1, minWidth: '100px' }}
                                    >
                                        Cancel Booking
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
                        <div style={{ padding: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Booking Information</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div><strong>Booking ID:</strong> {bookingDetails.id}</div>
                                    <div><strong>Status:</strong> {bookingDetails.status}</div>
                                    <div><strong>Start Time:</strong> {new Date(bookingDetails.startTime).toLocaleString()}</div>
                                    <div><strong>End Time:</strong> {new Date(bookingDetails.endTime).toLocaleString()}</div>
                                    {bookingDetails.serviceId && (
                                        <div><strong>Service ID:</strong> {bookingDetails.serviceId}</div>
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

                            {/*{bookingDetails.attendeeBooker && (*/}
                            {/*    <div style={{ marginBottom: '1.5rem' }}>*/}
                            {/*        <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Attendee Information</h5>*/}
                            {/*        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>*/}
                            {/*            <div><strong>Name:</strong> {bookingDetails.attendeeBooker.firstName} {bookingDetails.attendeeBooker.lastName}</div>*/}
                            {/*            <div><strong>Email:</strong> {bookingDetails.attendeeBooker.email}</div>*/}
                            {/*            <div><strong>Phone:</strong> {bookingDetails.attendeeBooker.phoneNumber}</div>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*)}*/}

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

export default ServiceBookings;
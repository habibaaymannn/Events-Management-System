import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceById, getServiceProviderBookings } from "../../api/serviceApi";
import "./ServiceDetails.css";

const SERVICE_CATEGORIES = [
    { value: "CATERING", label: "Catering Services" },
    { value: "DECOR_AND_STYLING", label: "Decor and Styling" },
    { value: "AUDIO_VISUAL", label: "Audio Visual Services" },
    { value: "FURNITURE_RENTAL", label: "Furniture & Equipment Rental" },
];

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [serviceBookings, setServiceBookings] = useState([]);
    const [serviceProviderId, setServiceProviderId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const kc = window.keycloak;
        if (kc && kc.tokenParsed?.sub) {
            setServiceProviderId(kc.tokenParsed.sub);
        }
    }, []);

    useEffect(() => {
        const loadService = async () => {
            try {
                const data = await getServiceById(id);
                setService(data);
            } catch (err) {
                console.error("Failed to load service details", err);
            } finally {
                setLoading(false);
            }
        };
        const loadServiceBookings = async () => {
            try {
                if (!serviceProviderId) return;

                const data = await getServiceProviderBookings(serviceProviderId);
                // Filter bookings for this specific service
                const bookingsForThisService = data.content.filter(booking =>
                    booking.serviceId === parseInt(id)
                );
                setServiceBookings(bookingsForThisService);
            } catch (error) {
                console.error("Error fetching service bookings:", error);
            }
        };
        loadService();
        loadServiceBookings()
    }, [id, serviceProviderId]);

    if (loading) return <p>Loading service details...</p>;
    if (!service) return <p>Service not found.</p>;

    return (
        <div className="service-details-container">
            <div className="service-details-content">
                {/* Header */}
                <div className="service-details-header">
                    <button onClick={() => navigate(-1)} className="back-button">
                        ← Back to Dashboard
                    </button>
                    <h1 className="service-title">{service.name}</h1>
                </div>

                {/* Service Information */}
                <div className="detail-card">
                    <h3>Service Information</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">
                {SERVICE_CATEGORIES.find(c => c.value === service.type)?.label || service.type}
              </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value">${service.price}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Locations:</span>
                            <span className="detail-value">
                {Array.isArray(service.servicesAreas) ? service.servicesAreas.join(", ") : service.location}
              </span>
                        </div>
                        {/*<div className="detail-item">*/}
                        {/*    <span className="detail-label">Availability:</span>*/}
                        {/*    <span className="detail-value">{service.availability}</span>*/}
                        {/*</div>*/}
                    </div>
                    <p style={{ marginTop: "12px" }}>
                        <strong>Description:</strong> {service.description ?? "No description"}
                    </p>
                </div>

                {/* Availability Section */}
                <div className="detail-card">
                    <h3>Availability</h3>
                    <p className="availability-count">
                        {service.availability || "Currently unavailable"}
                    </p>
                </div>

                {/* ServiceBookings Section */}
                <div className="detail-card">
                    <h3>Bookings</h3>
                    <p className="booking-count">{serviceBookings.length} total bookings</p>
                    {serviceBookings.length > 0 ? (
                        <div className="bookings-list">
                            {serviceBookings.slice(0, 5).map((booking, index) => (
                                <div key={index} className="booking-item">
                                    <span className="booking-date">
                                        {new Date(booking.startTime).toLocaleDateString()}
                                    </span>
                                    <span className="booking-user">
                                        Booking #{booking.id || 'N/A'}
                                    </span>
                                    <span className={`booking-status status-${booking.status?.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                            {serviceBookings.length > 5 && (
                                <p className="more-bookings">
                                    ... and {serviceBookings.length - 5} more bookings
                                </p>
                            )}
                        </div>
                    ) : (
                        <p style={{ color: "#6c757d", fontStyle: "italic" }}>No bookings yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;

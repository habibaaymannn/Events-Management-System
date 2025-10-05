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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const getImageUrl = (img) => {
        if (typeof img === "string") {
            if (img.startsWith("data:") || img.startsWith("http")) {
                return img;
            } else {
                return `data:image/jpeg;base64,${img}`;
            }
        }
        return null;
    };

    if (loading) return <p>Loading service details...</p>;
    if (!service) return <p>Service not found.</p>;

    const validImages = service.images?.filter(img => getImageUrl(img)) || [];

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

                {/* Images Section */}
                {validImages.length > 0 && (
                    <div className="detail-card">
                        <h3>Images</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ 
                                width: '100%', 
                                height: '400px', 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                marginBottom: '1rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={getImageUrl(validImages[currentImageIndex])}
                                    alt={service.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        background: '#fff'
                                    }}
                                />
                            </div>
                            {validImages.length > 1 && (
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '10px', 
                                    overflowX: 'auto',
                                    padding: '10px 0'
                                }}>
                                    {validImages.map((img, index) => (
                                        <img
                                            key={`${img}-${index}`}
                                            src={getImageUrl(img)}
                                            alt={`${service.name} ${index + 1}`}
                                            style={{
                                                width: '100px',
                                                height: '75px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                border: index === currentImageIndex ? '2px solid #3b82f6' : '2px solid transparent',
                                                transition: 'all 0.3s ease',
                                                flexShrink: 0,
                                                background: '#f8f9fa'
                                            }}
                                            onClick={() => setCurrentImageIndex(index)}
                                            onMouseEnter={(e) => {
                                                if (index !== currentImageIndex) {
                                                    e.target.style.borderColor = '#3b82f6';
                                                    e.target.style.transform = 'scale(1.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (index !== currentImageIndex) {
                                                    e.target.style.borderColor = 'transparent';
                                                    e.target.style.transform = 'scale(1)';
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Service Information */}
                <div className="detail-card">
                    <h3>Service Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            <strong>Category:</strong> {SERVICE_CATEGORIES.find(c => c.value === service.type)?.label || service.type}
                        </div>
                        <div>
                            <strong>Price:</strong> ${service.price}
                        </div>
                        <div>
                            <strong>Locations:</strong> {Array.isArray(service.servicesAreas) ? service.servicesAreas.join(", ") : service.location}
                        </div>
                        <div>
                            <strong>Description:</strong> {service.description ?? "No description"}
                        </div>
                    </div>
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

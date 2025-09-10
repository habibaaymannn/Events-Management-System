import React, { useState, useEffect } from "react";
import {getBookingsByVenueProviderId, getVenueById} from "../../api/venueApi";
import { useParams, useNavigate } from "react-router-dom";
import "./VenueDetails.css";

const VenueDetails = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [venueBookings, setVenueBookings] = useState([]);
  const [venueProviderId, setVenueProviderId] = useState(null);


  // Initialize venueProviderId when Keycloak is ready
  useEffect(() => {
    const kc = window.keycloak;
    if (kc && kc.tokenParsed?.sub) {
      setVenueProviderId(kc.tokenParsed.sub);
    }
  }, []);
  useEffect(() => {
    if (!id) return;
    const fetchVenue = async () => {
      try {
        const data = await getVenueById(id);
        setVenue(data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchVenueBookings = async () => {
      try {
        if (!venueProviderId) return;

        const data = await getBookingsByVenueProviderId(venueProviderId);
        const bookingsForThisVenue = data.content.filter(booking =>
            booking.venueId === parseInt(id)
        );
        setVenueBookings(bookingsForThisVenue);
      } catch (error) {
        console.error("Error fetching venue bookings:", error);
      }
    };

    fetchVenue();
    fetchVenueBookings();
  }, [id,venueProviderId]);

  const handleSetAvailability = () => {
    navigate(`/venue/${id}/availability`);
  };

  const handleBookVenue = () => {
    navigate(`/venue/${id}/book`);
  };

  const getImageUrl = (img) => {
    if (typeof img === "string") {
      if (img.startsWith("data:") || img.startsWith("http")) {
        return img;
      } else {
        // Assume it's a base64 string without prefix
        return `data:image/jpeg;base64,${img}`;
      }
    }
    return null;
  };

  const formatVenueType = (type) => {
    switch (type) {
      case 'VILLA':
        return 'Villa';
      case 'CHALET':
        return 'Chalet';
      case 'SCHOOL_HALL':
        return 'School Hall';
      default:
        return type;
    }
  };
  const formatEventType = (type) => {
    switch (type) {
      case 'WEDDING':
        return 'Wedding';
      case 'ENGAGEMENT_PARTY':
        return 'Engagement Party';
      case 'BIRTHDAY_PARTY':
        return 'Birthday Party';
      case 'FAMILY_REUNION':
        return 'Family Reunion';
      case 'PRIVATE_DINNER':
        return 'Private Dinner';
      case 'RETREAT':
        return 'Retreat';
      case 'BACHELORETTE_PARTY':
        return 'Bachelorette Party';
      case 'BABY_SHOWER':
        return 'Baby Shower';
      case 'CONFERENCE':
        return 'Conference';
      case 'WORKSHOP':
        return 'Workshop';
      case 'SEMINAR':
        return 'Seminar';
      case 'CORPORATE_DINNER':
        return 'Corporate Dinner';
      case 'NETWORKING_EVENT':
        return 'Networking Event';
      case 'PRODUCT_LAUNCH':
        return 'Product Launch';
      case 'AWARD_CEREMONY':
        return 'Award Ceremony';
      case 'FASHION_SHOW':
        return 'Fashion Show';
      case 'BUSINESS_EXPO':
        return 'Business Expo';
      case 'FUNDRAISER':
        return 'Fundraiser';
      default:
        return type.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    }
  };


  if (!venue) {
    return (
        <div className="venue-details-container">
          <div className="venue-details-header">
            <button onClick={() => navigate(-1)} className="back-button">
              ← Back
            </button>
            <h1 className="venue-title">Venue not found</h1>
          </div>
          <p>The venue you're looking for could not be found.</p>
        </div>
    );
  }

  const validImages = venue.images?.filter(img => getImageUrl(img)) || [];

  return (
      <div className="venue-details-container">
        <div className="venue-details-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back to Dashboard
          </button>
          <h1 className="venue-title">{venue.name}</h1>
        </div>

        <div className="venue-content">
          {/* Images Section */}
          <div className="images-section">
            {validImages.length > 0 ? (
                <>
                  <div className="main-image-container">
                    <img
                        src={getImageUrl(validImages[currentImageIndex])}
                        alt={venue.name}
                        className="main-image"
                    />
                  </div>
                  {validImages.length > 1 && (
                      <div className="thumbnail-container">
                        {validImages.map((img, index) => (
                            <img
                                key={index}
                                src={getImageUrl(img)}
                                alt={`${venue.name} ${index + 1}`}
                                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                      </div>
                  )}
                </>
            ) : (
                <div className="no-images">
                  <div className="no-images-placeholder">
                    <span>🏢</span>
                    <p>No images available</p>
                  </div>
                </div>
            )}
          </div>

          {/* Details Section */}
          <div className="details-section">
            {/* Basic Information */}
            <div className="detail-card">
              <h3>Venue Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{formatVenueType(venue.type)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{venue.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Capacity Range:</span>
                  <span className="detail-value">
                  {venue.capacity?.minCapacity || 0} - {venue.capacity?.maxCapacity || 0} people
                </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">
                  {venue.pricing?.perHour ? `$${venue.pricing.perHour}/hr` : ""}
                    {venue.pricing?.perHour && venue.pricing?.perEvent ? " | " : ""}
                    {venue.pricing?.perEvent ? `$${venue.pricing.perEvent}/event` : ""}
                </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Event Types:</span>
                  <span className="detail-value">
                  {venue.eventTypes && venue.eventTypes.length > 0
                      ? venue.eventTypes.map(type => formatEventType(type)).join(", ")
                      : "N/A"}
                </span>
                </div>


              </div>
            </div>

            {/* Availability Information */}
            <div className="detail-card">
              <h3>Availability</h3>
              <p className="availability-count">
                {venue.availability === "AVAILABLE" ? "Available" : "Not Available"}
              </p>
              {/*<div className="action-buttons">*/}
              {/*  <button onClick={handleSetAvailability} className="action-button primary">*/}
              {/*    Manage Availability*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>

            {/* ServiceBookings Information */}
            <div className="detail-card">
              <h3>Bookings</h3>
              <p className="booking-count">
                {venueBookings.length} total bookings
              </p>
              {venueBookings.length > 0 ? (
                  <div className="bookings-list">
                    {venueBookings.slice(0, 5).map((booking, index) => (
                        <div key={index} className="booking-item">
          <span className="booking-date">
            {new Date(booking.startTime).toLocaleDateString()}
          </span>
                          <span className="booking-user">
                 Booking #{booking.id || 'N/A'}
           </span>
                          <span className={`booking-status status-${booking.status.toLowerCase()}`}>
            {booking.status}
          </span>
                        </div>
                    ))}
                    {venueBookings.length > 5 && (
                        <p className="more-bookings">
                          ... and {venueBookings.length - 5} more bookings
                        </p>
                    )}
                  </div>
              ) : (
                  <p style={{color: '#6c757d', fontStyle: 'italic'}}>No bookings yet</p>
              )}

              {/*<div className="action-buttons">*/}
              {/*  <button onClick={handleBookVenue} className="action-button secondary">*/}
              {/*    View All ServiceBookings*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>
  );
};

export default VenueDetails;
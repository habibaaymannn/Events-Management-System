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
  }, [id, venueProviderId]);

  const handleSetAvailability = () => {
    navigate(`/venue/${id}/availability`);
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

  const formatType = (name) => {
    if (!name) return "Unknown";
    return name
        .toLowerCase()
        .replace(/_/g, " ") // replace underscores with spaces
        .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize words
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
                  <span className="detail-value">{venue.typeName ? formatType(venue.typeName) : "N/A"}</span>
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
                    {venue.supportedEventTypes && venue.supportedEventTypes.length > 0 ?
                        venue.supportedEventTypes.map(type => formatType(type)).join(", ") : "N/A"}
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
                    <span className="booking-date">{new Date(booking.startTime).toLocaleDateString()}</span>
                    <span className="booking-user">Booking #{booking.id || 'N/A'}</span>
                    <span className={`booking-status status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </div>
              ))}
              {venueBookings.length > 5 && (
                  <p className="more-bookings">... and {venueBookings.length - 5} more bookings</p>)}
            </div>
              ) : (<p style={{color: '#6c757d', fontStyle: 'italic'}}>No bookings yet</p>)}
            </div>
          </div>
        </div>
      </div>
  );
};

export default VenueDetails;
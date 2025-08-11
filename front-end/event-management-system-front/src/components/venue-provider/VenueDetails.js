import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VenueDetails.css";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    const stored = localStorage.getItem("venues");
    if (stored) {
      const venuesData = JSON.parse(stored);
      const foundVenue = venuesData.find(v => {
        if (!v || typeof v.id === 'undefined' || v.id === null) {
          return false;
        }
        return String(v.id) === String(id);
      });
      
      setVenue(foundVenue);
    }
  }, [id]);

  const handleSetAvailability = () => {
    navigate(`/venue/${id}/availability`);
  };

  const handleBookVenue = () => {
    navigate(`/venue/${id}/book`);
  };

  const getImageUrl = (img) => {
    if (typeof img === "string" && (img.startsWith("data:") || img.startsWith("http"))) return img;
    return null;
  };

  const formatVenueType = (type) => {
    switch(type) {
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
                <span className="detail-value">{venue.capacity_minimum} - {venue.capacity_maximum} people</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value">${venue.price} ({venue.priceType})</span>
              </div>
            </div>
          </div>

          {/* Availability Information */}
          <div className="detail-card">
            <h3>Availability</h3>
            <p className="availability-count">
              {venue.availability?.length || 0} dates currently available
            </p>
            <div className="action-buttons">
              <button onClick={handleSetAvailability} className="action-button primary">
                Manage Availability
              </button>
            </div>
          </div>

          {/* Bookings Information */}
          <div className="detail-card">
            <h3>Bookings</h3>
            <p className="booking-count">
              {venue.bookings?.length || 0} total bookings
            </p>
            
            {venue.bookings && venue.bookings.length > 0 ? (
              <div className="bookings-list">
                {venue.bookings.slice(0, 5).map((booking, index) => (
                  <div key={index} className="booking-item">
                    <span className="booking-date">
                      {new Date(booking.date + 'T00:00:00').toLocaleDateString()}
                    </span>
                    <span className="booking-user">{booking.user}</span>
                  </div>
                ))}
                {venue.bookings.length > 5 && (
                  <p className="more-bookings">
                    ... and {venue.bookings.length - 5} more bookings
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No bookings yet</p>
            )}
            
            <div className="action-buttons">
              <button onClick={handleBookVenue} className="action-button secondary">
                View All Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
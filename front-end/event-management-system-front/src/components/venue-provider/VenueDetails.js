import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VenueDetails.css";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    console.log("Looking for venue with ID:", id); // Debug log
    
    // Check if id exists before proceeding
    if (!id) {
      console.log("No ID provided in URL");
      return;
    }
    
    const stored = localStorage.getItem("venues");
    if (stored) {
      const venues = JSON.parse(stored);
      console.log("All venues:", venues); // Debug log
      const foundVenue = venues.find(v => {
        // More robust checking
        if (!v || typeof v.id === 'undefined' || v.id === null) {
          return false;
        }
        return String(v.id) === String(id);
      });
      console.log("Found venue:", foundVenue); // Debug log
      setVenue(foundVenue);
    }
  }, [id]);

  const getImageUrl = (img) => {
    try {
      if (typeof img === "string") {
        return img;
      }
      if (img instanceof File || img instanceof Blob) {
        return URL.createObjectURL(img);
      }
      return null;
    } catch (error) {
      console.warn("Failed to create image URL:", error);
      return null;
    }
  };

  if (!venue) {
    return (
      <div className="venue-details-container">
        <div className="venue-details-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <h2>Venue not found</h2>
        </div>
      </div>
    );
  }

  const validImages = venue.images?.filter(img => getImageUrl(img) !== null) || [];

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
                  src={getImageUrl(validImages[selectedImageIndex])}
                  alt={`${venue.name} main view`}
                  className="main-image"
                />
              </div>
              {validImages.length > 1 && (
                <div className="thumbnail-container">
                  {validImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`${venue.name} thumbnail ${idx + 1}`}
                      className={`thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-images">
              <div className="no-images-placeholder">
                <span>📷</span>
                <p>No images available for this venue</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="detail-card">
            <h3>Venue Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{venue.type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{venue.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capacity:</span>
                <span className="detail-value">
                  {venue.capacity_minimum} - {venue.capacity_maximum} people
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price:</span>
                <span className="detail-value">
                  ${venue.price} {venue.priceType}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Availability</h3>
            <p className="availability-count">
              {venue.availability?.length || 0} dates available
            </p>
            <div className="action-buttons">
              <button 
                onClick={() => navigate(`/venue/${venue.id}/availability`)}
                className="action-button primary"
              >
                Manage Availability
              </button>
            </div>
          </div>

          <div className="detail-card">
            <h3>Bookings</h3>
            <p className="booking-count">
              {venue.bookings?.length || 0} bookings
            </p>
            {venue.bookings && venue.bookings.length > 0 && (
              <div className="bookings-list">
                {venue.bookings.slice(0, 3).map((booking, idx) => (
                  <div key={idx} className="booking-item">
                    <span className="booking-date">{booking.date}</span>
                    <span className="booking-user">{booking.user}</span>
                  </div>
                ))}
                {venue.bookings.length > 3 && (
                  <p className="more-bookings">
                    +{venue.bookings.length - 3} more bookings
                  </p>
                )}
              </div>
            )}
            <div className="action-buttons">
              <button 
                onClick={() => navigate(`/venue/${venue.id}/book`)}
                className="action-button secondary"
              >
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
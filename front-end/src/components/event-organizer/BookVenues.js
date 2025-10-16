import React, { useState, useEffect } from "react";
import { getAllVenues } from "../../api/venueApi";
import { bookVenue } from "../../api/bookingApi";

const BookVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    minCapacity: "",
    maxPrice: "",
    availabilityOnly: false
  });
  const [bookingData, setBookingData] = useState({
    eventName: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    expectedGuests: "",
    eventType: "",
    specialRequests: ""
  });

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const result = await getAllVenues();
        const venuesList = Array.isArray(result) ? result : (result?.content ?? []);
        setVenues(venuesList);
      } catch (error) {
        console.error("Error loading venues:", error);
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(venue => {
    if (filters.location && !venue.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    const venueCapacity = venue.capacity?.maxCapacity || 0;
    if (filters.minCapacity && venueCapacity < parseInt(filters.minCapacity)) {
      return false;
    }
    const venuePrice = venue.pricing?.perEvent || venue.price || 0;
    if (filters.maxPrice && venuePrice > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.availabilityOnly && venue.availability !== "AVAILABLE") {
      return false;
    }
    return true;
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
  };

  const handleBookVenue = (venue) => {
    setSelectedVenue(venue);
    setShowBookingModal(true);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const organizerId = window.keycloak?.tokenParsed?.sub;
      if (!organizerId) {
        alert("Unable to identify organizer. Please log in again.");
        return;
      }

      const venueBookingData = {
        startTime: `${bookingData.eventDate}T${bookingData.startTime}:00.000Z`,
        endTime: `${bookingData.eventDate}T${bookingData.endTime}:00.000Z`,
        venueId: parseInt(selectedVenue.id),
        organizerId: organizerId,
        eventId: bookingData.eventId || null // If booking for existing event
      };

      const result = await bookVenue(venueBookingData);
      alert(`Venue booking confirmed! Booking ID: ${result.id}`);
      
      setShowBookingModal(false);
      setSelectedVenue(null);
      setBookingData({
        eventName: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        eventType: "",
        expectedGuests: "",
        specialRequests: "",
        contactName: "",
        contactEmail: "",
        contactPhone: ""
      });
      
      // Reload venues to update availability
      const fetchVenues = async () => {
        const result = await getAllVenues();
        setVenues(result);
      };
      fetchVenues();
    } catch (error) {
      console.error("Error booking venue:", error);
      alert("Failed to book venue. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="event-page">
        <div className="event-page-header">
          <h3 className="event-page-title">Book Venues</h3>
          <p className="event-page-subtitle">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-page">
      <div className="event-page-header">
        <h3 className="event-page-title">Book Venues</h3>
        <p className="event-page-subtitle">Find and reserve the perfect venue for your event</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h4 className="section-title">Filter Venues</h4>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Enter location"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Capacity</label>
            <input
              type="number"
              name="minCapacity"
              value={filters.minCapacity}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Min guests"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Max budget"
            />
          </div>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="availabilityOnly"
                checked={filters.availabilityOnly}
                onChange={handleFilterChange}
              />
              Show available only
            </label>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="event-section">
        <h4 className="section-title">Available Venues ({filteredVenues.length})</h4>
        <div className="venues-grid">
          {filteredVenues.map((venue) => (
            <div key={venue.id} className="venue-booking-card">
              <div className="venue-card-header">
                <h5 className="venue-card-title">{venue.name}</h5>
                <span className={`availability-badge ${venue.availability === "AVAILABLE" ? "available" : "unavailable"}`}>
                  {venue.availability === "AVAILABLE" ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="venue-card-content">
                <p className="venue-location">📍 {venue.location}</p>
                <p className="venue-capacity">👥 Capacity: {venue.capacity?.minCapacity || 0}-{venue.capacity?.maxCapacity || 0} guests</p>
                <p className="venue-price">💰 ${venue.pricing?.perHour || 0}/hour | ${venue.pricing?.perEvent || 0}/event</p>
                {venue.description && <p className="venue-description">{venue.description}</p>}

                {venue.eventTypes && venue.eventTypes.length > 0 && (
                  <div className="venue-amenities">
                    <strong>Supported Event Types:</strong>
                    <div className="amenities-tags">
                      {venue.eventTypes.slice(0, 4).map((eventType, index) => (
                        <span key={index} className="amenity-tag">{eventType.replace(/_/g, ' ')}</span>
                      ))}
                      {venue.eventTypes.length > 4 && (
                        <span className="amenity-tag more">+{venue.eventTypes.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="venue-card-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => handleViewDetails(venue)}
                >
                  View Details
                </button>
                {venue.availability === "AVAILABLE" && (
                  <button
                    className="event-btn success"
                    onClick={() => handleBookVenue(venue)}
                  >
                    Book Venue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Venue Details Modal */}
      {selectedVenue && !showBookingModal && (
        <div className="modal-overlay" onClick={() => setSelectedVenue(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedVenue.name}</h4>
              <button
                className="modal-close"
                onClick={() => setSelectedVenue(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="venue-details-grid">
                <div className="detail-section">
                  <h5>Venue Information</h5>
                  <div className="detail-list">
                    <p><strong>Location:</strong> {selectedVenue.location}</p>
                    <p><strong>Capacity:</strong> {selectedVenue.capacity?.minCapacity || 0}-{selectedVenue.capacity?.maxCapacity || 0} guests</p>
                    <p><strong>Price Per Hour:</strong> ${selectedVenue.pricing?.perHour || 0}</p>
                    <p><strong>Price Per Event:</strong> ${selectedVenue.pricing?.perEvent || 0}</p>
                    <p><strong>Availability:</strong> {selectedVenue.availability === "AVAILABLE" ? "Available" : "Unavailable"}</p>
                  </div>
                </div>

                {selectedVenue.description && (
                  <div className="detail-section full-width">
                    <h5>Description</h5>
                    <p>{selectedVenue.description}</p>
                  </div>
                )}

                {selectedVenue.eventTypes && selectedVenue.eventTypes.length > 0 && (
                  <div className="detail-section full-width">
                    <h5>Supported Event Types</h5>
                    <div className="amenities-list">
                      {selectedVenue.eventTypes.map((eventType, index) => (
                        <span key={index} className="amenity-item">✓ {eventType.replace(/_/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {selectedVenue.availability === "AVAILABLE" && (
                  <button
                    className="event-btn success"
                    onClick={() => handleBookVenue(selectedVenue)}
                  >
                    Book This Venue
                  </button>
                )}
                <button
                  className="event-btn secondary"
                  onClick={() => setSelectedVenue(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedVenue && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Book {selectedVenue.name}</h4>
              <button
                className="modal-close"
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitBooking}>
                <div className="booking-summary">
                  <h5>Venue Details</h5>
                  <p><strong>Venue:</strong> {selectedVenue.name}</p>
                  <p><strong>Location:</strong> {selectedVenue.location}</p>
                  <p><strong>Capacity:</strong> {selectedVenue.capacity?.minCapacity || 0}-{selectedVenue.capacity?.maxCapacity || 0} guests</p>
                  <p><strong>Price Per Hour:</strong> ${selectedVenue.pricing?.perHour || 0}</p>
                  <p><strong>Price Per Event:</strong> ${selectedVenue.pricing?.perEvent || 0}</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Event Name *</label>
                    <input
                      type="text"
                      name="eventName"
                      value={bookingData.eventName}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select
                      name="eventType"
                      value={bookingData.eventType}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Conference">Conference</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Charity">Charity</option>
                      <option value="Private">Private Party</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Date *</label>
                    <input
                      type="date"
                      name="eventDate"
                      value={bookingData.eventDate}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={bookingData.startTime}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={bookingData.endTime}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expected Guests *</label>
                    <input
                      type="number"
                      name="expectedGuests"
                      value={bookingData.expectedGuests}
                      onChange={handleBookingChange}
                      className="form-control"
                      max={selectedVenue.capacity?.maxCapacity || 1000}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleBookingChange}
                      className="form-control"
                      rows="3"
                      placeholder="Any special requirements or requests"
                    />
                  </div>
                </div>

                <div className="booking-total">
                  <h5>Booking Summary</h5>
                  <div className="total-row">
                    <span>Venue Cost (Per Event):</span>
                    <span>${selectedVenue.pricing?.perEvent || 0}</span>
                  </div>
                  <div className="total-row">
                    <span>Deposit Required (25%):</span>
                    <span>${Math.round((selectedVenue.pricing?.perEvent || 0) * 0.25)}</span>
                  </div>
                  <div className="total-row total">
                    <span><strong>Total Due:</strong></span>
                    <span><strong>${selectedVenue.pricing?.perEvent || 0}</strong></span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="event-btn success">
                    Submit Booking Request
                  </button>
                  <button
                    type="button"
                    className="event-btn secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookVenues;
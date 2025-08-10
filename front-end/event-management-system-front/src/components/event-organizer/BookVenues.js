import React, { useState } from "react";

const mockVenues = [
  {
    id: 1,
    name: "Grand Ballroom",
    location: "Downtown Convention Center",
    address: "123 Main Street, Downtown",
    capacity: 500,
    price: 2000,
    priceUnit: "per day",
    description: "Elegant ballroom perfect for large corporate events and galas",
    amenities: ["Stage", "Audio System", "Lighting", "Air Conditioning", "Parking", "Catering Kitchen"],
    images: ["ballroom1.jpg", "ballroom2.jpg"],
    availability: "Available",
    rating: 4.8,
    reviews: 156,
    contact: {
      phone: "+1 234-567-8900",
      email: "booking@grandballroom.com"
    },
    policies: {
      cancellation: "Free cancellation up to 7 days before event",
      deposit: "25% deposit required",
      setup: "Setup allowed 2 hours before event"
    }
  },
  {
    id: 2,
    name: "Conference Center",
    location: "Business District",
    address: "456 Business Ave, Business District",
    capacity: 200,
    price: 1500,
    priceUnit: "per day",
    description: "Modern conference center with state-of-the-art technology",
    amenities: ["Projectors", "Sound System", "WiFi", "Whiteboards", "Coffee Station", "Reception Area"],
    images: ["conference1.jpg", "conference2.jpg"],
    availability: "Available",
    rating: 4.7,
    reviews: 89,
    contact: {
      phone: "+1 234-567-8901",
      email: "events@bizconference.com"
    },
    policies: {
      cancellation: "Free cancellation up to 5 days before event",
      deposit: "30% deposit required",
      setup: "Setup allowed 1 hour before event"
    }
  },
  {
    id: 3,
    name: "Garden Pavilion",
    location: "City Park",
    address: "789 Park Lane, City Park",
    capacity: 150,
    price: 1200,
    priceUnit: "per day",
    description: "Beautiful outdoor pavilion surrounded by gardens",
    amenities: ["Gazebo", "Garden Views", "Outdoor Lighting", "Restrooms", "Parking", "Weather Backup"],
    images: ["garden1.jpg", "garden2.jpg"],
    availability: "Booked until Feb 25",
    rating: 4.9,
    reviews: 234,
    contact: {
      phone: "+1 234-567-8902",
      email: "reserve@citypark.gov"
    },
    policies: {
      cancellation: "Free cancellation up to 14 days before event",
      deposit: "20% deposit required",
      setup: "Setup allowed 3 hours before event"
    }
  },
  {
    id: 4,
    name: "Rooftop Terrace",
    location: "Downtown Skyline",
    address: "321 Sky Tower, Downtown",
    capacity: 100,
    price: 1800,
    priceUnit: "per day",
    description: "Stunning rooftop venue with panoramic city views",
    amenities: ["City Views", "Bar Area", "Lounge Seating", "Heating", "Sound System", "Elevator Access"],
    images: ["rooftop1.jpg", "rooftop2.jpg"],
    availability: "Available",
    rating: 4.6,
    reviews: 78,
    contact: {
      phone: "+1 234-567-8903",
      email: "events@skytower.com"
    },
    policies: {
      cancellation: "Free cancellation up to 10 days before event",
      deposit: "50% deposit required",
      setup: "Setup allowed 2 hours before event"
    }
  }
];

const BookVenues = () => {
  const [venues, setVenues] = useState(mockVenues);
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

  const filteredVenues = venues.filter(venue => {
    if (filters.location && !venue.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.minCapacity && venue.capacity < parseInt(filters.minCapacity)) {
      return false;
    }
    if (filters.maxPrice && venue.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.availabilityOnly && venue.availability !== "Available") {
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

  const submitBooking = (e) => {
    e.preventDefault();
    console.log("Booking venue:", selectedVenue.name, "with data:", bookingData);
    alert(`Booking request submitted for ${selectedVenue.name}!`);
    setShowBookingModal(false);
    setSelectedVenue(null);
    setBookingData({
      eventName: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      expectedGuests: "",
      eventType: "",
      specialRequests: ""
    });
  };

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
                <span className={`availability-badge ${venue.availability === "Available" ? "available" : "unavailable"}`}>
                  {venue.availability}
                </span>
              </div>

              <div className="venue-card-content">
                <p className="venue-location">📍 {venue.location}</p>
                <p className="venue-address">{venue.address}</p>
                <p className="venue-capacity">👥 Capacity: {venue.capacity} guests</p>
                <p className="venue-price">💰 ${venue.price} {venue.priceUnit}</p>
                <p className="venue-description">{venue.description}</p>

                <div className="venue-rating">
                  <span className="rating">⭐ {venue.rating}</span>
                  <span className="reviews">({venue.reviews} reviews)</span>
                </div>

                <div className="venue-amenities">
                  <strong>Amenities:</strong>
                  <div className="amenities-tags">
                    {venue.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                    {venue.amenities.length > 4 && (
                      <span className="amenity-tag more">+{venue.amenities.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="venue-card-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => handleViewDetails(venue)}
                >
                  View Details
                </button>
                {venue.availability === "Available" && (
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
                    <p><strong>Address:</strong> {selectedVenue.address}</p>
                    <p><strong>Capacity:</strong> {selectedVenue.capacity} guests</p>
                    <p><strong>Price:</strong> ${selectedVenue.price} {selectedVenue.priceUnit}</p>
                    <p><strong>Rating:</strong> ⭐ {selectedVenue.rating} ({selectedVenue.reviews} reviews)</p>
                    <p><strong>Availability:</strong> {selectedVenue.availability}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>Contact Information</h5>
                  <div className="detail-list">
                    <p><strong>Phone:</strong> {selectedVenue.contact.phone}</p>
                    <p><strong>Email:</strong> {selectedVenue.contact.email}</p>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h5>Description</h5>
                  <p>{selectedVenue.description}</p>
                </div>

                <div className="detail-section full-width">
                  <h5>Amenities</h5>
                  <div className="amenities-list">
                    {selectedVenue.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-item">✓ {amenity}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h5>Policies</h5>
                  <div className="policies-list">
                    <p><strong>Cancellation:</strong> {selectedVenue.policies.cancellation}</p>
                    <p><strong>Deposit:</strong> {selectedVenue.policies.deposit}</p>
                    <p><strong>Setup:</strong> {selectedVenue.policies.setup}</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedVenue.availability === "Available" && (
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
                  <p><strong>Capacity:</strong> {selectedVenue.capacity} guests</p>
                  <p><strong>Price:</strong> ${selectedVenue.price} {selectedVenue.priceUnit}</p>
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
                      max={selectedVenue.capacity}
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
                    <span>Venue Cost:</span>
                    <span>${selectedVenue.price}</span>
                  </div>
                  <div className="total-row">
                    <span>Deposit Required:</span>
                    <span>${Math.round(selectedVenue.price * 0.25)}</span>
                  </div>
                  <div className="total-row total">
                    <span><strong>Total Due:</strong></span>
                    <span><strong>${selectedVenue.price}</strong></span>
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
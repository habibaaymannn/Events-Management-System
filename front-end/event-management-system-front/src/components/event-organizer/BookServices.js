import React, { useState } from "react";

const mockServices = [
  {
    id: 1,
    name: "Premium Wedding Catering",
    category: "Food Catering",
    provider: "Gourmet Solutions",
    description: "Full-service catering with gourmet menu options for weddings and special events",
    price: 50,
    unit: "per person",
    minOrder: 20,
    maxOrder: 500,
    rating: 4.8,
    reviews: 145,
    serviceAreas: ["Downtown", "Business District", "Suburbs"],
    features: ["Appetizers", "Main Course", "Desserts", "Beverages", "Service Staff", "Setup & Cleanup"],
    images: ["catering1.jpg", "catering2.jpg"],
    availability: "Available",
    contact: {
      phone: "+1 234-567-9000",
      email: "catering@gourmet.com"
    },
    policies: {
      cancellation: "Free cancellation up to 7 days before event",
      deposit: "30% deposit required",
      notice: "Minimum 14 days advance booking required"
    }
  },
  {
    id: 2,
    name: "Professional Event Photography",
    category: "Photography",
    provider: "Lens Masters Studio",
    description: "High-quality event photography capturing all your special moments with professional editing",
    price: 1500,
    unit: "per event",
    minOrder: 1,
    maxOrder: 1,
    rating: 4.9,
    reviews: 98,
    serviceAreas: ["Downtown", "City Park", "Business District", "Suburbs"],
    features: ["Digital Gallery", "Edited Photos", "Print Rights", "Online Sharing", "USB Drive", "Professional Equipment"],
    images: ["photo1.jpg", "photo2.jpg"],
    availability: "Available",
    contact: {
      phone: "+1 234-567-9001",
      email: "bookings@lensmasters.com"
    },
    policies: {
      cancellation: "Free cancellation up to 5 days before event",
      deposit: "50% deposit required",
      notice: "Minimum 7 days advance booking required"
    }
  },
  {
    id: 3,
    name: "Complete Audio Visual Setup",
    category: "AV Equipment",
    provider: "TechSound Pro",
    description: "Professional audio-visual equipment rental with technical support and setup assistance",
    price: 800,
    unit: "per day",
    minOrder: 1,
    maxOrder: 7,
    rating: 4.7,
    reviews: 234,
    serviceAreas: ["Downtown", "Convention Center", "Hotels", "Business District"],
    features: ["Sound System", "Projectors", "Microphones", "Technical Support", "Setup Service", "Backup Equipment"],
    images: ["av1.jpg", "av2.jpg"],
    availability: "Booked until Feb 20",
    contact: {
      phone: "+1 234-567-9002",
      email: "rentals@techsound.com"
    },
    policies: {
      cancellation: "Free cancellation up to 3 days before event",
      deposit: "25% deposit required",
      notice: "Minimum 5 days advance booking required"
    }
  },
  {
    id: 4,
    name: "Elegant Floral Arrangements",
    category: "Decorations",
    provider: "Bloom & Co",
    description: "Beautiful floral decorations for weddings, corporate events, and celebrations with custom designs",
    price: 300,
    unit: "per arrangement",
    minOrder: 2,
    maxOrder: 50,
    rating: 4.6,
    reviews: 167,
    serviceAreas: ["City Park", "Venues", "Hotels", "Churches"],
    features: ["Fresh Flowers", "Custom Designs", "Setup Service", "Maintenance", "Color Coordination", "Seasonal Options"],
    images: ["floral1.jpg", "floral2.jpg"],
    availability: "Available",
    contact: {
      phone: "+1 234-567-9003",
      email: "orders@bloomco.com"
    },
    policies: {
      cancellation: "Free cancellation up to 5 days before event",
      deposit: "40% deposit required",
      notice: "Minimum 10 days advance booking required"
    }
  },
  {
    id: 5,
    name: "Live Band Entertainment",
    category: "Entertainment",
    provider: "Music Makers",
    description: "Professional live band with versatile repertoire for all types of events and celebrations",
    price: 2000,
    unit: "per event",
    minOrder: 1,
    maxOrder: 1,
    rating: 4.5,
    reviews: 89,
    serviceAreas: ["Downtown", "Venues", "Outdoor Locations"],
    features: ["Live Performance", "Sound Equipment", "Lighting", "Multiple Genres", "MC Services", "Custom Playlist"],
    images: ["band1.jpg", "band2.jpg"],
    availability: "Available",
    contact: {
      phone: "+1 234-567-9004",
      email: "bookings@musicmakers.com"
    },
    policies: {
      cancellation: "Free cancellation up to 14 days before event",
      deposit: "50% deposit required",
      notice: "Minimum 21 days advance booking required"
    }
  },
  {
    id: 6,
    name: "Premium Furniture Rental",
    category: "Furniture",
    provider: "Event Furnishings",
    description: "High-quality furniture rental including chairs, tables, lounge sets, and decorative pieces",
    price: 25,
    unit: "per item",
    minOrder: 10,
    maxOrder: 200,
    rating: 4.4,
    reviews: 201,
    serviceAreas: ["Downtown", "Business District", "Venues", "Outdoor Locations"],
    features: ["Delivery", "Setup", "Pickup", "Cleaning", "Variety of Styles", "Damage Protection"],
    images: ["furniture1.jpg", "furniture2.jpg"],
    availability: "Available",
    contact: {
      phone: "+1 234-567-9005",
      email: "rentals@eventfurnishings.com"
    },
    policies: {
      cancellation: "Free cancellation up to 3 days before event",
      deposit: "20% deposit required",
      notice: "Minimum 7 days advance booking required"
    }
  }
];

const serviceCategories = [
  "All Categories",
  "Food Catering",
  "Photography",
  "Videography",
  "AV Equipment",
  "Decorations",
  "Entertainment",
  "Furniture",
  "Transportation",
  "Security",
  "Cleaning"
];

const BookServices = () => {
  const [services, setServices] = useState(mockServices);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    serviceArea: "",
    maxPrice: "",
    availabilityOnly: false
  });
  const [bookingData, setBookingData] = useState({
    eventName: "",
    eventDate: "",
    eventType: "",
    quantity: "",
    specialRequests: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });

  const filteredServices = services.filter(service => {
    if (filters.category !== "All Categories" && service.category !== filters.category) {
      return false;
    }
    if (filters.serviceArea && !service.serviceAreas.some(area =>
      area.toLowerCase().includes(filters.serviceArea.toLowerCase())
    )) {
      return false;
    }
    if (filters.maxPrice && service.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.availabilityOnly && service.availability !== "Available") {
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

  const handleViewDetails = (service) => {
    setSelectedService(service);
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
    setBookingData(prev => ({ ...prev, quantity: service.minOrder }));
  };

  const addToCart = (service, quantity) => {
    const cartItem = {
      id: service.id,
      service: service,
      quantity: parseInt(quantity),
      totalCost: service.price * parseInt(quantity)
    };
    setCart(prev => [...prev, cartItem]);
    alert(`${service.name} added to cart!`);
  };

  const removeFromCart = (serviceId) => {
    setCart(prev => prev.filter(item => item.id !== serviceId));
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalCost, 0);
  };

  const submitBooking = (e) => {
    e.preventDefault();
    const totalCost = selectedService.price * parseInt(bookingData.quantity);
    console.log("Booking service:", selectedService.name, "with data:", bookingData, "Total cost:", totalCost);
    alert(`Booking request submitted for ${selectedService.name}! Total cost: $${totalCost.toLocaleString()}`);
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingData({
      eventName: "",
      eventDate: "",
      eventType: "",
      quantity: "",
      specialRequests: "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    });
  };

  return (
    <div className="event-page">
      <div className="event-page-header">
        <h3 className="event-page-title">Book Services</h3>
        <p className="event-page-subtitle">Find and hire professional service providers for your event</p>
      </div>

      {/* Shopping Cart */}
      {cart.length > 0 && (
        <div className="cart-section">
          <h4 className="section-title">
            🛒 Service Cart ({cart.length} items) - Total: ${calculateCartTotal().toLocaleString()}
          </h4>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <span className="cart-service">{item.service.name}</span>
                <span className="cart-quantity">Qty: {item.quantity}</span>
                <span className="cart-cost">${item.totalCost.toLocaleString()}</span>
                <button
                  className="remove-cart-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h4 className="section-title">Filter Services</h4>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              {serviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Service Area</label>
            <input
              type="text"
              name="serviceArea"
              value={filters.serviceArea}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Enter area"
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

      {/* Services Grid */}
      <div className="event-section">
        <h4 className="section-title">Available Services ({filteredServices.length})</h4>
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-booking-card">
              <div className="service-card-header">
                <h5 className="service-card-title">{service.name}</h5>
                <span className="service-category-badge">{service.category}</span>
              </div>

              <div className="service-card-content">
                <p className="service-provider">🏪 {service.provider}</p>
                <p className="service-price">💰 ${service.price} {service.unit}</p>
                <p className="service-order-info">
                  📦 Min: {service.minOrder} | Max: {service.maxOrder}
                </p>
                <p className="service-description">{service.description}</p>

                <div className="service-rating">
                  <span className="rating">⭐ {service.rating}</span>
                  <span className="reviews">({service.reviews} reviews)</span>
                </div>

                <div className="service-availability">
                  <span className={`availability-status ${service.availability === "Available" ? "available" : "unavailable"}`}>
                    {service.availability}
                  </span>
                </div>

                <div className="service-areas">
                  <strong>Service Areas:</strong>
                  <div className="areas-tags">
                    {service.serviceAreas.slice(0, 3).map((area, index) => (
                      <span key={index} className="area-tag">{area}</span>
                    ))}
                    {service.serviceAreas.length > 3 && (
                      <span className="area-tag more">+{service.serviceAreas.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="service-features">
                  <strong>Features:</strong>
                  <div className="features-tags">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="feature-tag more">+{service.features.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="service-card-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => handleViewDetails(service)}
                >
                  View Details
                </button>
                {service.availability === "Available" && (
                  <button
                    className="event-btn success"
                    onClick={() => handleBookService(service)}
                  >
                    Book Service
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && !showBookingModal && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedService.name}</h4>
              <button
                className="modal-close"
                onClick={() => setSelectedService(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="service-details-grid">
                <div className="detail-section">
                  <h5>Service Information</h5>
                  <div className="detail-list">
                    <p><strong>Provider:</strong> {selectedService.provider}</p>
                    <p><strong>Category:</strong> {selectedService.category}</p>
                    <p><strong>Price:</strong> ${selectedService.price} {selectedService.unit}</p>
                    <p><strong>Min Order:</strong> {selectedService.minOrder}</p>
                    <p><strong>Max Order:</strong> {selectedService.maxOrder}</p>
                    <p><strong>Rating:</strong> ⭐ {selectedService.rating} ({selectedService.reviews} reviews)</p>
                    <p><strong>Availability:</strong> {selectedService.availability}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>Contact Information</h5>
                  <div className="detail-list">
                    <p><strong>Phone:</strong> {selectedService.contact.phone}</p>
                    <p><strong>Email:</strong> {selectedService.contact.email}</p>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h5>Description</h5>
                  <p>{selectedService.description}</p>
                </div>

                <div className="detail-section full-width">
                  <h5>Service Areas</h5>
                  <div className="areas-list">
                    {selectedService.serviceAreas.map((area, index) => (
                      <span key={index} className="area-item">📍 {area}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h5>Features Included</h5>
                  <div className="features-list">
                    {selectedService.features.map((feature, index) => (
                      <span key={index} className="feature-item">✓ {feature}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h5>Policies</h5>
                  <div className="policies-list">
                    <p><strong>Cancellation:</strong> {selectedService.policies.cancellation}</p>
                    <p><strong>Deposit:</strong> {selectedService.policies.deposit}</p>
                    <p><strong>Advance Notice:</strong> {selectedService.policies.notice}</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedService.availability === "Available" && (
                  <button
                    className="event-btn success"
                    onClick={() => handleBookService(selectedService)}
                  >
                    Book This Service
                  </button>
                )}
                <button
                  className="event-btn secondary"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Book {selectedService.name}</h4>
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
                  <h5>Service Details</h5>
                  <p><strong>Service:</strong> {selectedService.name}</p>
                  <p><strong>Provider:</strong> {selectedService.provider}</p>
                  <p><strong>Price:</strong> ${selectedService.price} {selectedService.unit}</p>
                  <p><strong>Min/Max Order:</strong> {selectedService.minOrder} - {selectedService.maxOrder}</p>
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
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={bookingData.quantity}
                      onChange={handleBookingChange}
                      className="form-control"
                      min={selectedService.minOrder}
                      max={selectedService.maxOrder}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      value={bookingData.contactName}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email *</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={bookingData.contactEmail}
                      onChange={handleBookingChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={bookingData.contactPhone}
                      onChange={handleBookingChange}
                      className="form-control"
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

                {bookingData.quantity && (
                  <div className="booking-total">
                    <h5>Booking Summary</h5>
                    <div className="total-row">
                      <span>Unit Price:</span>
                      <span>${selectedService.price} {selectedService.unit}</span>
                    </div>
                    <div className="total-row">
                      <span>Quantity:</span>
                      <span>{bookingData.quantity}</span>
                    </div>
                    <div className="total-row">
                      <span>Subtotal:</span>
                      <span>${(selectedService.price * parseInt(bookingData.quantity || 0)).toLocaleString()}</span>
                    </div>
                    <div className="total-row">
                      <span>Deposit Required:</span>
                      <span>${Math.round((selectedService.price * parseInt(bookingData.quantity || 0)) * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="total-row total">
                      <span><strong>Total Cost:</strong></span>
                      <span><strong>${(selectedService.price * parseInt(bookingData.quantity || 0)).toLocaleString()}</strong></span>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="submit" className="event-btn success">
                    Submit Booking Request
                  </button>
                  <button
                    type="button"
                    className="event-btn"
                    onClick={() => {
                      if (bookingData.quantity) {
                        addToCart(selectedService, bookingData.quantity);
                        setShowBookingModal(false);
                      }
                    }}
                    disabled={!bookingData.quantity}
                  >
                    Add to Cart
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

export default BookServices;
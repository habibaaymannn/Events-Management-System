
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
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await getAllAvailableServices();
      const servicesList = Array.isArray(servicesData) ? servicesData : (servicesData?.content ?? []);
      setServices(servicesList);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };
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
    if (filters.category !== "All Categories") {
      const serviceCategory = service.type?.replace(/_/g, ' ') || '';
      if (!serviceCategory.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
    }
    if (filters.serviceArea && service.servicesAreas && !service.servicesAreas.some(area =>
      area.toLowerCase().includes(filters.serviceArea.toLowerCase())
    )) {
      return false;
    }
    if (filters.maxPrice && service.price > parseInt(filters.maxPrice)) {
      return false;
    }
    if (filters.availabilityOnly && service.availability !== "AVAILABLE") {
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
    setBookingData(prev => ({ ...prev, quantity: 1 }));
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

  const submitBooking = async (e) => {
    e.preventDefault();
    try {
      const organizerId = window.keycloak?.tokenParsed?.sub;
      if (!organizerId) {
        alert("Unable to identify organizer. Please log in again.");
        return;
      }

      const serviceBookingData = {
        startTime: `${bookingData.eventDate}T09:00:00.000Z`, // Default start time
        endTime: `${bookingData.eventDate}T18:00:00.000Z`,   // Default end time
        currency: "USD", // Default currency
        serviceId: parseInt(selectedService.id),
        organizerId: organizerId,
        eventId: bookingData.eventId || null // If booking for existing event
      };

      const result = await bookService(serviceBookingData);
      alert(`Service booking confirmed! Booking ID: ${result.id}`);
      
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
    } catch (error) {
      console.error("Error booking service:", error);
      alert("Failed to book service. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="event-page">
        <div className="event-page-header">
          <h3 className="event-page-title">Book Services</h3>
          <p className="event-page-subtitle">Loading services...</p>
        </div>
      </div>
    );
  }

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
                <span className="service-category-badge">{service.type?.replace(/_/g, ' ') || 'Service'}</span>
              </div>

              <div className="service-card-content">
                <p className="service-price">💰 ${service.price || 0}</p>
                {service.description && <p className="service-description">{service.description}</p>}

                <div className="service-availability">
                  <span className={`availability-status ${service.availability === "AVAILABLE" ? "available" : "unavailable"}`}>
                    {service.availability === "AVAILABLE" ? "Available" : "Unavailable"}
                  </span>
                </div>

                {service.servicesAreas && service.servicesAreas.length > 0 && (
                  <div className="service-areas">
                    <strong>Service Areas:</strong>
                    <div className="areas-tags">
                      {service.servicesAreas.slice(0, 3).map((area, index) => (
                        <span key={index} className="area-tag">{area}</span>
                      ))}
                      {service.servicesAreas.length > 3 && (
                        <span className="area-tag more">+{service.servicesAreas.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="service-card-actions">
                <button
                  className="event-btn secondary"
                  onClick={() => handleViewDetails(service)}
                >
                  View Details
                </button>
                {service.availability === "AVAILABLE" && (
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
                    <p><strong>Category:</strong> {selectedService.type?.replace(/_/g, ' ') || 'Service'}</p>
                    <p><strong>Price:</strong> ${selectedService.price || 0}</p>
                    <p><strong>Availability:</strong> {selectedService.availability === "AVAILABLE" ? "Available" : "Unavailable"}</p>
                  </div>
                </div>

                {selectedService.description && (
                  <div className="detail-section full-width">
                    <h5>Description</h5>
                    <p>{selectedService.description}</p>
                  </div>
                )}

                {selectedService.servicesAreas && selectedService.servicesAreas.length > 0 && (
                  <div className="detail-section full-width">
                    <h5>Service Areas</h5>
                    <div className="areas-list">
                      {selectedService.servicesAreas.map((area, index) => (
                        <span key={index} className="area-item">📍 {area}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {selectedService.availability === "AVAILABLE" && (
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
                  <p><strong>Category:</strong> {selectedService.type?.replace(/_/g, ' ') || 'Service'}</p>
                  <p><strong>Price:</strong> ${selectedService.price || 0}</p>
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
                      min={1}
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
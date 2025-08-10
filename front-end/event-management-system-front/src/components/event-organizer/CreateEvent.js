import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockVenues = [
  { id: 1, name: "Grand Ballroom", location: "Downtown", capacity: 500, price: 2000, available: true },
  { id: 2, name: "Conference Center", location: "Business District", capacity: 200, price: 1500, available: true },
  { id: 3, name: "Garden Pavilion", location: "City Park", capacity: 150, price: 1200, available: false },
  { id: 4, name: "Rooftop Terrace", location: "Downtown", capacity: 100, price: 1800, available: true },
];

const mockServices = [
  { id: 1, name: "Premium Catering", category: "Food", price: 50, unit: "per person", provider: "Gourmet Solutions" },
  { id: 2, name: "Professional Photography", category: "Photography", price: 1500, unit: "per event", provider: "Lens Masters" },
  { id: 3, name: "Audio Visual Setup", category: "AV Equipment", price: 800, unit: "per day", provider: "TechSound Pro" },
  { id: 4, name: "Floral Decorations", category: "Decorations", price: 300, unit: "per arrangement", provider: "Bloom & Co" },
  { id: 5, name: "Live Band", category: "Entertainment", price: 2000, unit: "per event", provider: "Music Makers" },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    // Basic Information
    name: "",
    description: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    expectedAttendees: "",
    ticketPrice: "",

    // Venue & Services
    selectedVenue: null,
    selectedServices: [],

    // Additional Details
    specialRequirements: "",
    marketingBudget: "",
    notes: ""
  });

  const eventTypes = ["Corporate", "Wedding", "Birthday", "Conference", "Workshop", "Charity", "Private Party"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVenueSelect = (venue) => {
    setEventData(prev => ({
      ...prev,
      selectedVenue: venue
    }));
  };

  const handleServiceToggle = (service) => {
    setEventData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.find(s => s.id === service.id)
        ? prev.selectedServices.filter(s => s.id !== service.id)
        : [...prev.selectedServices, service]
    }));
  };

  const calculateTotalCost = () => {
    let total = 0;
    if (eventData.selectedVenue) {
      total += eventData.selectedVenue.price;
    }
    eventData.selectedServices.forEach(service => {
      if (service.unit === "per person" && eventData.expectedAttendees) {
        total += service.price * parseInt(eventData.expectedAttendees);
      } else {
        total += service.price;
      }
    });
    return total;
  };

  const calculatePotentialRevenue = () => {
    if (eventData.ticketPrice && eventData.expectedAttendees) {
      return parseFloat(eventData.ticketPrice) * parseInt(eventData.expectedAttendees);
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating event:", eventData);
    // Here you would submit to your API
    alert("Event created successfully!");
    navigate('/event-organizer/my-events');
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return eventData.name && eventData.type && eventData.date && eventData.startTime && eventData.endTime;
      case 2:
        return eventData.expectedAttendees;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="event-page">
      <div className="event-page-header">
        <h3 className="event-page-title">Create New Event</h3>
        <p className="event-page-subtitle">Plan your perfect event step by step</p>
      </div>

      {/* Progress Indicator */}
      <div className="progress-container">
        <div className="progress-steps">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className={`progress-step ${step <= currentStep ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && "Basic Info"}
                {step === 2 && "Details"}
                {step === 3 && "Venue & Services"}
                {step === 4 && "Review"}
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-event-form">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h4 className="step-title">📝 Basic Event Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={eventData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select
                  name="type"
                  value={eventData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Select event type</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={eventData.startTime}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={eventData.endTime}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Event Description</label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Describe your event"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Event Details */}
        {currentStep === 2 && (
          <div className="form-step">
            <h4 className="step-title">🎯 Event Details</h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Expected Attendees *</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={eventData.expectedAttendees}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Number of attendees"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ticket Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ticketPrice"
                  value={eventData.ticketPrice}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Price per ticket"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Marketing Budget ($)</label>
                <input
                  type="number"
                  name="marketingBudget"
                  value={eventData.marketingBudget}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Marketing budget"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Special Requirements</label>
                <textarea
                  name="specialRequirements"
                  value={eventData.specialRequirements}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Any special requirements or notes"
                />
              </div>
            </div>

            {/* Financial Preview */}
            {eventData.ticketPrice && eventData.expectedAttendees && (
              <div className="financial-preview">
                <h5>Financial Preview</h5>
                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="preview-label">Potential Revenue:</span>
                    <span className="preview-value revenue">${calculatePotentialRevenue().toLocaleString()}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Current Costs:</span>
                    <span className="preview-value cost">${calculateTotalCost().toLocaleString()}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Estimated Profit:</span>
                    <span className="preview-value profit">${(calculatePotentialRevenue() - calculateTotalCost()).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Venue & Services */}
        {currentStep === 3 && (
          <div className="form-step">
            <h4 className="step-title">🏢 Select Venue & Services</h4>

            {/* Venue Selection */}
            <div className="selection-section">
              <h5>Choose a Venue (Optional)</h5>
              <div className="venues-grid">
                {mockVenues.map(venue => (
                  <div
                    key={venue.id}
                    className={`venue-option ${eventData.selectedVenue?.id === venue.id ? 'selected' : ''} ${!venue.available ? 'unavailable' : ''}`}
                    onClick={() => venue.available && handleVenueSelect(venue)}
                  >
                    <div className="venue-option-header">
                      <h6>{venue.name}</h6>
                      {!venue.available && <span className="unavailable-badge">Unavailable</span>}
                    </div>
                    <p>📍 {venue.location}</p>
                    <p>👥 {venue.capacity} capacity</p>
                    <p className="venue-price">💰 ${venue.price}/day</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Selection */}
            <div className="selection-section">
              <h5>Add Services (Optional)</h5>
              <div className="services-grid">
                {mockServices.map(service => (
                  <div
                    key={service.id}
                    className={`service-option ${eventData.selectedServices.find(s => s.id === service.id) ? 'selected' : ''}`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <div className="service-option-header">
                      <h6>{service.name}</h6>
                      <span className="service-category">{service.category}</span>
                    </div>
                    <p className="service-provider">🏪 {service.provider}</p>
                    <p className="service-price">💰 ${service.price} {service.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Summary */}
            <div className="cost-summary">
              <h5>Cost Summary</h5>
              <div className="cost-breakdown">
                {eventData.selectedVenue && (
                  <div className="cost-item">
                    <span>Venue: {eventData.selectedVenue.name}</span>
                    <span>${eventData.selectedVenue.price}</span>
                  </div>
                )}
                {eventData.selectedServices.map(service => (
                  <div key={service.id} className="cost-item">
                    <span>{service.name}</span>
                    <span>
                      ${service.unit === "per person" && eventData.expectedAttendees
                        ? (service.price * parseInt(eventData.expectedAttendees)).toLocaleString()
                        : service.price.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="cost-total">
                  <span><strong>Total Cost:</strong></span>
                  <span><strong>${calculateTotalCost().toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="form-step">
            <h4 className="step-title">📋 Review & Confirm</h4>
            <div className="review-section">
              <div className="review-grid">
                <div className="review-card">
                  <h5>Event Information</h5>
                  <div className="review-details">
                    <p><strong>Name:</strong> {eventData.name}</p>
                    <p><strong>Type:</strong> {eventData.type}</p>
                    <p><strong>Date:</strong> {eventData.date}</p>
                    <p><strong>Time:</strong> {eventData.startTime} - {eventData.endTime}</p>
                    <p><strong>Attendees:</strong> {eventData.expectedAttendees}</p>
                    {eventData.ticketPrice && <p><strong>Ticket Price:</strong> ${eventData.ticketPrice}</p>}
                  </div>
                </div>

                {eventData.selectedVenue && (
                  <div className="review-card">
                    <h5>Venue</h5>
                    <div className="review-details">
                      <p><strong>Name:</strong> {eventData.selectedVenue.name}</p>
                      <p><strong>Location:</strong> {eventData.selectedVenue.location}</p>
                      <p><strong>Capacity:</strong> {eventData.selectedVenue.capacity}</p>
                      <p><strong>Cost:</strong> ${eventData.selectedVenue.price}</p>
                    </div>
                  </div>
                )}

                {eventData.selectedServices.length > 0 && (
                  <div className="review-card">
                    <h5>Services</h5>
                    <div className="review-details">
                      {eventData.selectedServices.map(service => (
                        <p key={service.id}>
                          <strong>{service.name}:</strong> ${service.price} {service.unit}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="review-card financial-summary">
                  <h5>Financial Summary</h5>
                  <div className="review-details">
                    <p><strong>Total Costs:</strong> ${calculateTotalCost().toLocaleString()}</p>
                    {eventData.ticketPrice && eventData.expectedAttendees && (
                      <>
                        <p><strong>Potential Revenue:</strong> ${calculatePotentialRevenue().toLocaleString()}</p>
                        <p className="profit-line">
                          <strong>Expected Profit:</strong>
                          <span className="profit-amount">${(calculatePotentialRevenue() - calculateTotalCost()).toLocaleString()}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="event-btn secondary">
              ← Previous
            </button>
          )}

          <div className="nav-spacer"></div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="event-btn"
              disabled={!isStepValid()}
            >
              Next →
            </button>
          ) : (
            <button type="submit" className="event-btn success">
              Create Event 🎉
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
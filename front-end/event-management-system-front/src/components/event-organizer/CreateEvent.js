import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../../api/eventApi";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    // Basic Information - matching backend API
    name: "",
    description: "",
    type: "WEDDING", // Backend expects enum values
    startTime: "",
    endTime: "",
    retailPrice: ""
  });

  const eventTypes = [
    { value: "WEDDING", label: "Wedding" },
    { value: "ENGAGEMENT_PARTY", label: "Engagement Party" },
    { value: "BIRTHDAY_PARTY", label: "Birthday Party" },
    { value: "FAMILY_REUNION", label: "Family Reunion" },
    { value: "PRIVATE_DINNER", label: "Private Dinner" },
    { value: "RETREAT", label: "Retreat" },
    { value: "BACHELORETTE_PARTY", label: "Bachelorette Party" },
    { value: "BABY_SHOWER", label: "Baby Shower" },
    { value: "CONFERENCE", label: "Conference" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "SEMINAR", label: "Seminar" },
    { value: "CORPORATE_DINNER", label: "Corporate Dinner" },
    { value: "NETWORKING_EVENT", label: "Networking Event" },
    { value: "PRODUCT_LAUNCH", label: "Product Launch" },
    { value: "AWARD_CEREMONY", label: "Award Ceremony" },
    { value: "FASHION_SHOW", label: "Fashion Show" },
    { value: "BUSINESS_EXPO", label: "Business Expo" },
    { value: "FUNDRAISER", label: "Fundraiser" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format data according to backend API
      const apiEventData = {
        name: eventData.name,
        description: eventData.description,
        type: eventData.type,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        retailPrice: parseFloat(eventData.retailPrice) || 0
      };

      await createEvent(apiEventData);
      alert("Event created successfully!");
      navigate('/event-organizer/my-events');
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return eventData.name && eventData.type && eventData.startTime && eventData.endTime;
      case 2:
        return eventData.description && eventData.retailPrice;
      case 3:
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
          {[1, 2, 3].map(step => (
            <div key={step} className={`progress-step ${step <= currentStep ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && "Basic Info"}
                {step === 2 && "Details"}
                {step === 3 && "Review"}
              </div>
            </div>
          ))}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 3) * 100}%` }}
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
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={eventData.startTime}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={eventData.endTime}
                  onChange={handleInputChange}
                  className="form-control"
                  required
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
              <div className="form-group full-width">
                <label className="form-label">Event Description *</label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  placeholder="Describe your event in detail"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Retail Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="retailPrice"
                  value={eventData.retailPrice}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Event price"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="info-box">
              <h5>📋 Note</h5>
              <p>After creating your event, you can separately book venues and services through the respective sections of the platform.</p>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="form-step">
            <h4 className="step-title">📋 Review & Confirm</h4>
            <div className="review-section">
              <div className="review-grid">
                <div className="review-card">
                  <h5>Event Information</h5>
                  <div className="review-details">
                    <p><strong>Name:</strong> {eventData.name}</p>
                    <p><strong>Type:</strong> {eventTypes.find(t => t.value === eventData.type)?.label}</p>
                    <p><strong>Start:</strong> {eventData.startTime ? new Date(eventData.startTime).toLocaleString() : 'Not set'}</p>
                    <p><strong>End:</strong> {eventData.endTime ? new Date(eventData.endTime).toLocaleString() : 'Not set'}</p>
                    <p><strong>Price:</strong> ${eventData.retailPrice}</p>
                  </div>
                </div>

                <div className="review-card">
                  <h5>Description</h5>
                  <div className="review-details">
                    <p>{eventData.description}</p>
                  </div>
                </div>

                <div className="review-card">
                  <h5>Next Steps</h5>
                  <div className="review-details">
                    <p>After creating your event, you can:</p>
                    <ul>
                      <li>Browse and book venues</li>
                      <li>Hire service providers</li>
                      <li>Manage event attendees</li>
                      <li>Track bookings and payments</li>
                    </ul>
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

          {currentStep < 3 ? (
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
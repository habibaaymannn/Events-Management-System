import React from "react";

const EventForm = ({
  formEvent,
  setFormEvent,
  editEventId,
  onSubmit,
  onCancel,
  venues,
  services,
  getAvailableVenues,
  getAvailableServices,
  formatVenueDisplay,
  formatServiceDisplay,
  EVENT_TYPES,
  EVENT_TYPE_LABELS
}) => {
  return (
    <div className="card" style={{ marginBottom: 32 }}>
      <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
        {editEventId ? "Edit Event" : "Create New Event"}
      </h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input
            required
            placeholder="Event Name"
            value={formEvent.name}
            onChange={(e) => setFormEvent({ ...formEvent, name: e.target.value })}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <textarea
            required
            placeholder="Event Description"
            value={formEvent.description}
            onChange={(e) => setFormEvent({ ...formEvent, description: e.target.value })}
            className="form-control"
            rows={2}
          />
        </div>
        <div className="form-group">
          <select
            required
            value={formEvent.type}
            onChange={(e) => setFormEvent({ ...formEvent, type: e.target.value })}
            className="form-control"
          >
            <option value="">Select Event Type</option>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              required
              type="datetime-local"
              value={formEvent.startTime}
              onChange={(e) => setFormEvent({ ...formEvent, startTime: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              required
              type="datetime-local"
              value={formEvent.endTime}
              onChange={(e) => setFormEvent({ ...formEvent, endTime: e.target.value })}
              className="form-control"
            />
          </div>
        </div>
        
        {/* Venue selection */}
        <div className="form-group">
          <label className="form-label">Select Venue (optional - only one venue allowed)</label>
          <select
            value={formEvent.venueId}
            onChange={(e) => setFormEvent({ ...formEvent, venueId: e.target.value })}
            className="form-control"
          >
            <option value="">No Venue</option>
            {formEvent.startTime &&
              getAvailableVenues(formEvent.startTime.split("T")[0]).map(v => (
                <option key={v.id} value={v.id}>
                  {formatVenueDisplay(v)}
                </option>
              ))}
          </select>
          {formEvent.startTime && getAvailableVenues(formEvent.startTime.split("T")[0]).length === 0 && (
            <small style={{ color: '#dc3545' }}>No venues available for the selected date</small>
          )}
        </div>
        
        {/* Service selection */}
        <div className="form-group">
          <label className="form-label">Select Services (optional, multiple allowed)</label>
          <div style={{ position: 'relative' }}>
            <select 
              className="form-control"
              style={{ 
                appearance: 'none',
                background: 'white',
                cursor: 'pointer',
                paddingRight: '30px'
              }}
              onClick={(e) => {
                e.preventDefault();
                const dropdown = e.target.nextElementSibling;
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
              }}
              readOnly
              value=""
            >
              <option value="">
                {formEvent.serviceIds.length === 0 
                  ? "Select Services" 
                  : `${formEvent.serviceIds.length} service(s) selected`
                }
              </option>
            </select>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderTop: 'none',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              display: 'none'
            }}>
              {getAvailableServices().length === 0 ? (
                <div style={{ padding: '10px', color: '#6c757d' }}>No services available</div>
              ) : (
                getAvailableServices().map(s => (
                  <label key={s.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <input
                      type="checkbox"
                      checked={formEvent.serviceIds.includes(String(s.id))}
                      onChange={(e) => {
                        const serviceId = String(s.id);
                        if (e.target.checked) {
                          setFormEvent({ ...formEvent, serviceIds: [...formEvent.serviceIds, serviceId] });
                        } else {
                          setFormEvent({ ...formEvent, serviceIds: formEvent.serviceIds.filter(id => id !== serviceId) });
                        }
                      }}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ fontSize: '14px' }}>{formatServiceDisplay(s)}</span>
                  </label>
                ))
              )}
            </div>
            <span style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: '12px'
            }}>▼</span>
          </div>
        </div>
        
        <div className="form-group">
          <input
            required
            type="number"
            placeholder="Retail Price (What attendees will pay)"
            value={formEvent.retailPrice}
            onChange={(e) => setFormEvent({ ...formEvent, retailPrice: e.target.value })}
            min={0}
            step="0.01"
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-success">
          {editEventId ? "Update Event" : "Create Event & Send Booking Requests"}
        </button>
      </form>
    </div>
  );
};

export default EventForm;

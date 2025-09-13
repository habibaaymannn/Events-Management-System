import React from "react";

const EventForm = ({
  formEvent,
  setFormEvent,
  editEventId,
  onSubmit,
  onCancel,
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
            <label className="form-label" htmlFor="form-start-time">Start Time</label>
            <input
              id="form-start-time"
              required
              type="datetime-local"
              value={formEvent.startTime}
              onChange={(e) => setFormEvent({ ...formEvent, startTime: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="form-end-time">End Time</label>
            <input
              id="form-end-time"
              required
              type="datetime-local"
              value={formEvent.endTime}
              onChange={(e) => setFormEvent({ ...formEvent, endTime: e.target.value })}
              className="form-control"
            />
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
          {editEventId ? "Update Event" : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default EventForm;

import React from "react";

const EditEventModal = ({
  showEdit,
  formEvent,
  setFormEvent,
  onSave,
  onClose
}) => {
  if (!showEdit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Edit Event</h4>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSave}>
          <div className="form-group">
            <input
              required
              placeholder="Event Name"
              value={formEvent.name}
              onChange={e => setFormEvent({ ...formEvent, name: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <select
              required
              value={formEvent.type}
              onChange={e => setFormEvent({ ...formEvent, type: e.target.value })}
              className="form-control"
            >
              <option value="">Select Event Type</option>
              <option value="BIRTHDAY_PARTY">Birthday Party</option>
              <option value="WEDDING">Wedding</option>
              <option value="CONFERENCE">Conference</option>
              <option value="MEETING">Meeting</option>
              <option value="GALA">Gala</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="form-group">
            <input
              required
              type="datetime-local"
              placeholder="Start Time"
              value={formEvent.startTime}
              onChange={e => setFormEvent({ ...formEvent, startTime: e.target.value })}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              required
              type="datetime-local"
              placeholder="End Time"
              value={formEvent.endTime}
              onChange={e => setFormEvent({ ...formEvent, endTime: e.target.value })}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <input
              type="number"
              placeholder="Retail Price"
              value={formEvent.retailPrice}
              onChange={e => setFormEvent({ ...formEvent, retailPrice: e.target.value })}
              className="form-control"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-success">Save</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;

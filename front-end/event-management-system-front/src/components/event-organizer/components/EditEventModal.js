import React from "react";

const EditEventModal = ({
  showEdit,
  formEvent,
  setFormEvent,
  venues,
  services,
  onSave,
  onClose,
  formatServiceDisplay
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
          
          {/* Venue selection in edit modal */}
          <div className="form-group">
            <select
              value={formEvent.venueId || ""}
              onChange={e => setFormEvent({ ...formEvent, venueId: e.target.value })}
              className="form-control"
            >
              <option value="">Select Venue</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          
          {/* Services selection */}
          <div className="form-group">
            <label className="form-label">Services</label>
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
                {services.length === 0 ? (
                  <div style={{ padding: '10px', color: '#6c757d' }}>No services available</div>
                ) : (
                  services.map(service => (
                    <label key={service.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '8px 12px', 
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <input
                        type="checkbox"
                        checked={formEvent.serviceIds.includes(String(service.id))}
                        onChange={(e) => {
                          const serviceId = String(service.id);
                          if (e.target.checked) {
                            setFormEvent({ ...formEvent, serviceIds: [...formEvent.serviceIds, serviceId] });
                          } else {
                            setFormEvent({ ...formEvent, serviceIds: formEvent.serviceIds.filter(id => id !== serviceId) });
                          }
                        }}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{ fontSize: '14px' }}>{formatServiceDisplay(service)}</span>
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

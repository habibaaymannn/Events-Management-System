import React from "react";

const EventsTable = ({
  filteredEvents,
  EVENT_TYPE_LABELS,
  getVenueName,
  getServiceNames,
  onEditEvent,
  onCancelEvent
}) => {
  return (
    <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
      <table className="table" style={{ minWidth: '1200px', width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Start</th>
            <th>End</th>
            <th>Venue Status</th>
            <th>Services Status</th>
            <th>Retail Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                No events found for this filter.
              </td>
            </tr>
          ) : (
            filteredEvents.map(event => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{EVENT_TYPE_LABELS[event.type] || event.type}</td>
                <td>{event.startTime ? new Date(event.startTime).toLocaleString() : event.date}</td>
                <td>{event.endTime ? new Date(event.endTime).toLocaleString() : event.date}</td>
                <td>{getVenueName(event.venueId)}</td>
                <td>{getServiceNames(event.serviceIds)}</td>
                <td>${event.retailPrice}</td>
                <td>
                  <span className={`status-badge status-${(event.status || "planning").toLowerCase()}`}>
                    {event.status || "PLANNING"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning"
                    style={{ marginRight: 8 }}
                    onClick={() => onEditEvent(event)}
                  >
                    EDIT
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onCancelEvent(event)}
                  >
                    CANCEL
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;

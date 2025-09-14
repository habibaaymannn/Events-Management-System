import React from "react";

const EventsTable = ({
  filteredEvents,
  EVENT_TYPE_LABELS,
  onEditEvent,
  onCancelEvent,
  onBookVenue,
  onBookService,
  onEditVenueBooking,
  onEditServiceBookings,
  eventBookings = {}
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
            <th>Retail Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
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
                <td>${event.retailPrice}</td>
                <td>
                  <span className={`status-badge status-${(event.status || "planning").toLowerCase()}`}>
                    {event.status || "PLANNING"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn btn-warning"
                        onClick={() => onEditEvent(event)}
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        EDIT
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => onCancelEvent(event)}
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                      >
                        CANCEL
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(() => {
                        const bookings = eventBookings[event.id] || { venue: [], service: [] };
                        const hasVenueBooking = bookings.venue && bookings.venue.length > 0;
                        const hasServiceBooking = bookings.service && bookings.service.length > 0;
                        
                        return (
                          <>
                            <button
                              className={`btn ${hasVenueBooking ? 'btn-info' : 'btn-primary'}`}
                              onClick={() => hasVenueBooking ? onEditVenueBooking(event, bookings.venue[0]) : onBookVenue(event)}
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                              title={hasVenueBooking ? 'Edit existing venue booking' : 'Book a venue (one per event)'}
                            >
                              {hasVenueBooking ? 'EDIT VENUE' : 'BOOK VENUE'}
                            </button>
                            <button
                              className={`btn ${hasServiceBooking ? 'btn-info' : 'btn-success'}`}
                              onClick={() => hasServiceBooking ? onEditServiceBookings(event, bookings.service) : onBookService(event)}
                              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                              {hasServiceBooking ? `MANAGE SERVICES (${bookings.service.length})` : 'BOOK SERVICE'}
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
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

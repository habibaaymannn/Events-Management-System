import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAllVenues } from "../../api/venueApi";
import { bookVenue, cancelVenueBooking } from "../../api/bookingApi";

const BookVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    if (!id) return;
    loadVenues();
  }, [id]);

  const loadVenues = async () => {
    try {
      const data = await getAllVenues();
      setVenues(data);
      const foundVenue = data.find(v => String(v.id) === String(id));
      setVenue(foundVenue);
    } catch (error) {
      // Handle error
    }
  };

  // Book a date using the booking API
  const handleBookDate = async (date) => {
    if (!venue) return;
    
    try {
      const startTime = `${date.toISOString().split('T')[0]}T09:00:00.000Z`;
      const endTime = `${date.toISOString().split('T')[0]}T17:00:00.000Z`;
      
      const bookingData = {
        startTime: startTime,
        endTime: endTime,
        venueId: parseInt(venue.id),
        organizerId: "current-organizer-id", // Get from auth context
        eventId: null // Manual booking without specific event
      };
      
      await bookVenue(bookingData);
      alert("Booking confirmed and email notification sent!");
      loadVenues();
    } catch (error) {
      console.error("Error booking venue:", error);
      alert("Failed to book venue. Please try again.");
    }
  };

  // Cancel a booking
  const handleCancelBooking = async (date) => {
    if (!venue) return;
    
    const dateStr = date.toISOString().split("T")[0];
    // Find booking by date in the venue's bookings array
    const booking = venue.bookings?.find(b => {
      // Handle different date formats from backend
      const bookingDate = new Date(b.startTime).toISOString().split("T")[0];
      return bookingDate === dateStr;
    });
    
    if (booking && booking.id) {
      try {
        await cancelVenueBooking(booking.id);
        alert("Booking cancelled and email notification sent!");
        loadVenues();
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    } else {
      alert("No booking found for this date.");
    }
  };

  if (!venue) {
    return (
      <main>
        <div className="card">
          <div className="card-header">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              ← Back
            </button>
            <h2 className="card-title">Venue not found</h2>
          </div>
          <p>The venue you're looking for could not be found.</p>
        </div>
      </main>
    );
  }

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isBooked = venue?.bookings?.some(b => {
    const bookingDate = new Date(b.startTime).toISOString().split("T")[0];
    return bookingDate === dateStr;
  });
  const isAvailable = true; // You may need to implement availability checking

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
            ← Back to Dashboard
          </button>
          <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "2rem", fontWeight: 700 }}>
            Book: {venue?.name || 'Venue'}
          </h2>
        </div>
        
        <div className="center-calendar">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: '#495057', marginBottom: '1rem' }}>
              Select a date to book or manage bookings
            </h4>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Green = Available | Red = Booked | Gray = Not Available
            </p>
          </div>
          
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              // Check if date has a booking
              const hasBooking = venue?.bookings?.some(b => {
                const bookingDate = new Date(b.startTime).toISOString().split("T")[0];
                return bookingDate === dateStr;
              });
              if (hasBooking) return "calendar-booked";
              // For now, assume all dates are available (you may need an availability endpoint)
              return "calendar-available";
            }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          />
          
          <div style={{ marginTop: '2rem' }}>
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
              <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                Selected Date: {selectedDate.toLocaleDateString()}
              </h5>
              
              {isBooked ? (
                <div>
                  <p style={{ color: '#dc3545', marginBottom: '1rem' }}>
                    This date is already booked
                  </p>
                  <button 
                    onClick={() => handleCancelBooking(selectedDate)}
                    className="btn btn-danger"
                  >
                    Cancel Booking
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ 
                    color: isAvailable ? '#28a745' : '#6c757d', 
                    marginBottom: '1rem' 
                  }}>
                    {isAvailable ? 'Available for booking' : 'Not available'}
                  </p>
                  <button
                    onClick={() => handleBookDate(selectedDate)}
                    disabled={!isAvailable}
                    className={`btn ${isAvailable ? 'btn-success' : 'btn-secondary'}`}
                  >
                    {isAvailable ? 'Book This Date' : 'Not Available'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                All Bookings for {venue?.name || 'this venue'}
              </h5>
              {venue?.bookings && venue.bookings.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {venue.bookings.map((booking, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid #f8f9fa'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {new Date(booking.startTime).toLocaleDateString()}
                      </span>
                      <span style={{ color: '#6c757d' }}>
                        {booking.organizerBooker?.firstName} {booking.organizerBooker?.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                  No bookings yet for this venue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVenue;
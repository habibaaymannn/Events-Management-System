import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";

const BookVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    if (!id) return;
    
    const stored = localStorage.getItem("venues");
    if (stored) {
      const venuesData = JSON.parse(stored);
      setVenues(venuesData);
      
      const foundVenue = venuesData.find(v => {
        if (!v || typeof v.id === 'undefined' || v.id === null) {
          return false;
        }
        return String(v.id) === String(id);
      });
      
      setVenue(foundVenue);
    }
  }, [id]);

  // Book a date
  const handleBookDate = (date) => {
    if (!venue) return;
    
    const dateStr = date.toISOString().split("T")[0];
    
    // Check if already booked or not available
    if (venue.bookings.some(b => b.date === dateStr)) {
      alert("This date is already booked!");
      return;
    }
    
    if (!venue.availability.includes(dateStr)) {
      alert("This date is not available for booking!");
      return;
    }
    
    const updatedVenues = venues.map(v => {
      if (String(v.id) === String(venue.id)) {
        const updatedVenue = {
          ...v,
          bookings: [...v.bookings, { date: dateStr, user: "You" }]
        };
        setVenue(updatedVenue); // Update local venue state
        return updatedVenue;
      }
      return v;
    });
    
    setVenues(updatedVenues);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
    alert("Booking confirmed and email notification sent!");
  };

  // Cancel a booking
  const handleCancelBooking = (date) => {
    if (!venue) return;
    
    const dateStr = date.toISOString().split("T")[0];
    
    const updatedVenues = venues.map(v => {
      if (String(v.id) === String(venue.id)) {
        const updatedVenue = {
          ...v,
          bookings: v.bookings.filter(b => b.date !== dateStr)
        };
        setVenue(updatedVenue); // Update local venue state
        return updatedVenue;
      }
      return v;
    });
    
    setVenues(updatedVenues);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
    alert("Booking cancelled and email notification sent!");
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
  const isBooked = venue.bookings.some(b => b.date === dateStr);
  const isAvailable = venue.availability.includes(dateStr);

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
            ← Back to Dashboard
          </button>
          <h2 className="card-title">Book: {venue.name}</h2>
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
              if (venue.bookings.some(b => b.date === dateStr)) return "calendar-booked";
              if (venue.availability.includes(dateStr)) return "calendar-available";
              return null;
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
                All Bookings for {venue.name}
              </h5>
              {venue.bookings && venue.bookings.length > 0 ? (
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
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString()}
                      </span>
                      <span style={{ color: '#6c757d' }}>{booking.user}</span>
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
    </main>
  );
};

export default BookVenue;
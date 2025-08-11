import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./../admin/AdminDashboard.css";

const SetAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    console.log("Looking for venue with ID:", id);
    
    if (!id) {
      console.log("No ID provided in URL");
      return;
    }
    
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
      
      console.log("Found venue:", foundVenue);
      setVenue(foundVenue);
    }
  }, [id]);

  // Toggle availability for a date
  const handleAvailabilityChange = (date) => {
    if (!venue) return;
    
    const dateStr = date.toISOString().split("T")[0];
    const isCurrentlyAvailable = venue.availability.includes(dateStr);
    
    const updatedVenues = venues.map(v => {
      if (String(v.id) === String(venue.id)) {
        let newAvailability;
        
        if (isCurrentlyAvailable) {
          // Remove from availability (make unavailable)
          newAvailability = v.availability.filter(d => d !== dateStr);
        } else {
          // Add to availability (make available)
          newAvailability = [...v.availability, dateStr];
        }
        
        const updatedVenue = { ...v, availability: newAvailability };
        setVenue(updatedVenue); // Update local venue state
        return updatedVenue;
      }
      return v;
    });
    
    setVenues(updatedVenues);
    localStorage.setItem("venues", JSON.stringify(updatedVenues));
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

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
            ← Back to Dashboard
          </button>
          <h2 className="card-title">Set Availability for: {venue.name}</h2>
        </div>
        
        <div className="center-calendar">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h4 style={{ color: '#495057', marginBottom: '1rem' }}>
              Click dates to toggle availability
            </h4>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Green dates are available for booking. Click any date to toggle its availability status.
            </p>
          </div>
          
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            onClickDay={handleAvailabilityChange}
            tileClassName={({ date }) => {
              const dateStr = date.toISOString().split("T")[0];
              return venue.availability.includes(dateStr) ? "calendar-available" : null;
            }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          />
          
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                Availability Summary
              </h5>
              <p style={{ fontSize: '1.2rem', color: '#28a745', fontWeight: 'bold' }}>
                {venue.availability?.length || 0} dates available
              </p>
              {venue.availability && venue.availability.length > 0 && (
                <div style={{ textAlign: 'left', maxHeight: '200px', overflowY: 'auto' }}>
                  <strong style={{ color: '#495057' }}>Available dates:</strong>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    {venue.availability.slice(0, 10).map(date => (
                      <li key={date} style={{ 
                        padding: '0.25rem 0', 
                        borderBottom: '1px solid #f8f9fa',
                        color: '#495057'
                      }}>
                        {new Date(date + 'T00:00:00').toLocaleDateString()}
                      </li>
                    ))}
                    {venue.availability.length > 10 && (
                      <li style={{ color: '#6c757d', fontStyle: 'italic', padding: '0.25rem 0' }}>
                        ... and {venue.availability.length - 10} more dates
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SetAvailability;
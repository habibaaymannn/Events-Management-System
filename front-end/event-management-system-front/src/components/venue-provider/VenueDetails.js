import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    console.log("Looking for venue with ID:", id);
    
    if (!id) {
      console.log("No ID provided in URL");
      return;
    }
    
    const stored = localStorage.getItem("venues");
    if (stored) {
      const venues = JSON.parse(stored);
      console.log("All venues:", venues);
      const foundVenue = venues.find(v => {
        if (!v || typeof v.id === 'undefined' || v.id === null) {
          return false;
        }
        return String(v.id) === String(id);
      });
      console.log("Found venue:", foundVenue);
      setVenue(foundVenue);
    }
  }, [id]);

  const getImageUrl = (img) => {
    try {
      if (typeof img === "string") {
        // Handle base64 data URLs, regular URLs, and blob URLs
        if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('blob:')) {
          console.log("Valid image URL found:", img.substring(0, 50) + "...");
          return img;
        }
        console.log("Invalid string image:", img);
        return null;
      }
      if (img instanceof File || img instanceof Blob) {
        const url = URL.createObjectURL(img);
        console.log("Created blob URL:", url);
        return url;
      }
      // Handle stored File objects that became plain objects
      if (img && typeof img === 'object' && (img.name || img.type)) {
        console.log("Image is a stored File object that can't be displayed:", img);
        return null;
      }
      console.log("Unknown image type:", typeof img, img);
      return null;
    } catch (error) {
      console.warn("Failed to create image URL:", error);
      return null;
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

  const validImages = venue.images?.filter(img => {
    const url = getImageUrl(img);
    console.log("Image check:", img, "-> URL:", url);
    return url !== null;
  }) || [];
  
  console.log("Valid images:", validImages);
  console.log("All venue images:", venue.images);

  return (
    <main>
      <div className="card">
        <div className="card-header">
          <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
            ← Back to Dashboard
          </button>
          <h1 className="card-title">{venue.name}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Images Section */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Images</h3>
            {validImages.length > 0 ? (
              <>
                <div style={{ 
                  width: '100%', 
                  height: '400px', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}>
                  <img
                    src={getImageUrl(validImages[selectedImageIndex])}
                    alt={`${venue.name} main view`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
                {validImages.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    overflowX: 'auto', 
                    padding: '10px 0' 
                  }}>
                    {validImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(img)}
                        alt={`${venue.name} thumbnail ${idx + 1}`}
                        style={{
                          width: '80px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: idx === selectedImageIndex ? '3px solid #667eea' : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          flexShrink: 0
                        }}
                        onClick={() => setSelectedImageIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f8f9fa',
                borderRadius: '12px',
                color: '#6c757d'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>📷</span>
                  <p style={{ fontSize: '1.2rem', margin: 0 }}>No images available for this venue</p>
                  <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                    {venue.images && venue.images.length > 0 
                      ? `${venue.images.length} image(s) were uploaded but can't be displayed after storage. Images need to be re-uploaded as they lose their data when stored in localStorage.`
                      : 'Upload images when creating or editing this venue'
                    }
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <button 
                      onClick={() => navigate('/venue-provider')}
                      className="btn btn-primary"
                      style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}
                    >
                      Back to Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        // Clear the problematic images from this venue
                        const stored = localStorage.getItem("venues");
                        if (stored) {
                          const venues = JSON.parse(stored);
                          const updatedVenues = venues.map(v => 
                            String(v.id) === String(venue.id) 
                              ? { ...v, images: [] }
                              : v
                          );
                          localStorage.setItem("venues", JSON.stringify(updatedVenues));
                          window.location.reload();
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.9rem' }}
                    >
                      Clear Invalid Images
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Venue Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f8f9fa'
                }}>
                  <span style={{ fontWeight: 600, color: '#495057' }}>Type:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 500 }}>{venue.type}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f8f9fa'
                }}>
                  <span style={{ fontWeight: 600, color: '#495057' }}>Location:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 500 }}>{venue.location}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f8f9fa'
                }}>
                  <span style={{ fontWeight: 600, color: '#495057' }}>Capacity:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 500 }}>
                    {venue.capacity_minimum} - {venue.capacity_maximum} people
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.75rem 0'
                }}>
                  <span style={{ fontWeight: 600, color: '#495057' }}>Price:</span>
                  <span style={{ color: '#28a745', fontWeight: 700, fontSize: '1.1rem' }}>
                    ${venue.price} {venue.priceType}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Availability</h3>
              <p style={{ color: '#6c757d', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <strong style={{ color: '#28a745', fontSize: '1.3rem' }}>
                  {venue.availability?.length || 0}
                </strong> dates available
              </p>
              <button 
                onClick={() => navigate(`/venue/${venue.id}/availability`)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Manage Availability
              </button>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Bookings</h3>
              <p style={{ color: '#6c757d', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <strong style={{ color: '#007bff', fontSize: '1.3rem' }}>
                  {venue.bookings?.length || 0}
                </strong> bookings
              </p>
              {venue.bookings && venue.bookings.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#495057', fontSize: '0.9rem' }}>Recent bookings:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {venue.bookings.slice(0, 3).map((booking, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #f8f9fa',
                        fontSize: '0.9rem'
                      }}>
                        <span style={{ fontWeight: 500, color: '#2c3e50' }}>
                          {new Date(booking.date + 'T00:00:00').toLocaleDateString()}
                        </span>
                        <span style={{ color: '#6c757d' }}>{booking.user}</span>
                      </div>
                    ))}
                    {venue.bookings.length > 3 && (
                      <p style={{ 
                        color: '#6c757d', 
                        fontSize: '0.8rem', 
                        margin: '0.5rem 0 0 0',
                        fontStyle: 'italic',
                        textAlign: 'center'
                      }}>
                        +{venue.bookings.length - 3} more bookings
                      </p>
                    )}
                  </div>
                </div>
              )}
              <button 
                onClick={() => navigate(`/venue/${venue.id}/book`)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                View All Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VenueDetails;
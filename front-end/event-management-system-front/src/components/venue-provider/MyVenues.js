import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockVenues = [
    {
        id: 1,
        name: "Grand Ballroom",
        location: "Downtown Convention Center",
        capacity: 500,
        pricePerHour: 200,
        status: "Available",
        amenities: ["WiFi", "Projector", "Sound System", "Catering Kitchen"],
        description: "Elegant ballroom perfect for weddings and corporate events",
        bookings: 15,
        revenue: 25000
    },
    {
        id: 2,
        name: "Conference Center",
        location: "Business District",
        capacity: 200,
        pricePerHour: 150,
        status: "Booked",
        amenities: ["WiFi", "Projector", "Video Conferencing"],
        description: "Modern conference space ideal for business meetings",
        bookings: 8,
        revenue: 12000
    },
    {
        id: 3,
        name: "Garden Pavilion",
        location: "City Park",
        capacity: 150,
        pricePerHour: 120,
        status: "Available",
        amenities: ["Outdoor Setting", "Garden Views", "Natural Lighting"],
        description: "Beautiful outdoor venue with garden surroundings",
        bookings: 12,
        revenue: 18000
    },
    {
        id: 4,
        name: "Rooftop Terrace",
        location: "Downtown Skyline",
        capacity: 100,
        pricePerHour: 180,
        status: "Maintenance",
        amenities: ["City Views", "Open Air", "Bar Setup"],
        description: "Stunning rooftop venue with panoramic city views",
        bookings: 5,
        revenue: 7500
    }
];

const MyVenues = () => {
    const [venues, setVenues] = useState(mockVenues);
    const [showAddForm, setShowAddForm] = useState(false);
    const navigate = useNavigate();

    const handleEdit = (venueId) => {
        console.log("Edit venue:", venueId);
    };

    const handleDelete = (venueId) => {
        if (window.confirm("Are you sure you want to delete this venue?")) {
            setVenues(venues.filter(v => v.id !== venueId));
        }
    };

    const handleAvailability = (venueId) => {
        navigate(`/venue/${venueId}/availability`);
    };

    const handleViewDetails = (venueId) => {
        navigate(`/venue/${venueId}/details`);
    };

    return (
        <div className="venue-page">
            <div className="venue-page-header">
                <h3 className="venue-page-title">My Venues</h3>
                <p className="venue-page-subtitle">Manage your venue listings and availability</p>
            </div>

            <div className="venue-section">
                <div className="section-header">
                    <h4 className="section-title">Venue Management</h4>
                    <button
                        className="venue-btn success"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? "Cancel" : "Add New Venue"}
                    </button>
                </div>

                {showAddForm && (
                    <div className="venue-form">
                        <h5>Add New Venue</h5>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Venue Name</label>
                                <input type="text" className="form-control" placeholder="Enter venue name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input type="text" className="form-control" placeholder="Enter location" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Capacity</label>
                                <input type="number" className="form-control" placeholder="Maximum capacity" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price per Hour</label>
                                <input type="number" className="form-control" placeholder="Price in USD" />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows="3" placeholder="Venue description"></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="venue-btn">Save Venue</button>
                            <button className="venue-btn secondary" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="venues-grid">
                    {venues.map((venue) => (
                        <div key={venue.id} className="venue-card">
                            <div className="venue-card-header">
                                <h5 className="venue-card-title">{venue.name}</h5>
                                <span className={`status-badge status-${venue.status.toLowerCase()}`}>
                                    {venue.status}
                                </span>
                            </div>
                            <div className="venue-card-content">
                                <p className="venue-location">📍 {venue.location}</p>
                                <p className="venue-capacity">👥 Capacity: {venue.capacity}</p>
                                <p className="venue-price">💰 ${venue.pricePerHour}/hour</p>
                                <p className="venue-description">{venue.description}</p>
                                <div className="venue-amenities">
                                    {venue.amenities.map((amenity, index) => (
                                        <span key={index} className="amenity-tag">{amenity}</span>
                                    ))}
                                </div>
                                <div className="venue-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{venue.bookings}</span>
                                        <span className="stat-label">Bookings</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">${venue.revenue.toLocaleString()}</span>
                                        <span className="stat-label">Revenue</span>
                                    </div>
                                </div>
                            </div>
                            <div className="venue-card-actions">
                                <button className="venue-btn" onClick={() => handleViewDetails(venue.id)}>
                                    View Details
                                </button>
                                <button className="venue-btn secondary" onClick={() => handleAvailability(venue.id)}>
                                    Set Availability
                                </button>
                                <button className="venue-btn success" onClick={() => handleEdit(venue.id)}>
                                    Edit
                                </button>
                                <button className="venue-btn danger" onClick={() => handleDelete(venue.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyVenues;
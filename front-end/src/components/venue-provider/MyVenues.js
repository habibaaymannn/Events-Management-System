import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVenues, deleteVenue, updateVenue, createVenue } from "../../api/venueApi";

const MyVenues = () => {
    const [venues, setVenues] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newVenueForm, setNewVenueForm] = useState({
        name: "",
        type: "",
        location: "",
        capacity: {
            minCapacity: "",
            maxCapacity: ""
        },
        pricing: {
            perHour: "",
            perEvent: ""
        },
        description: "",
        supportedEventTypes: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {
        try {
            const data = await getAllVenues();
            setVenues(data);
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    };

    const handleEdit = async (venueId) => {
        // Implement edit logic using updateVenue
        // Example: await updateVenue(venueId, updatedVenueData); then reload
        // loadVenues();
    };

    const handleDelete = async (venueId) => {
        if (window.confirm("Are you sure you want to delete this venue?")) {
            try {
                await deleteVenue(venueId);
                loadVenues();
            } catch (error) {
                console.error("Error deleting venue:", error);
            }
        }
    };

    const handleAvailability = (venueId) => {
        navigate(`/venue/${venueId}/availability`);
    };

    const handleViewDetails = (venueId) => {
        navigate(`/venue/${venueId}/details`);
    };

    const handleSaveVenue = async () => {
        try {
            const venueData = {
                name: newVenueForm.name,
                type: newVenueForm.type,
                location: newVenueForm.location,
                capacity: {
                    minCapacity: parseInt(newVenueForm.capacity.minCapacity),
                    maxCapacity: parseInt(newVenueForm.capacity.maxCapacity)
                },
                pricing: {
                    perHour: parseFloat(newVenueForm.pricing.perHour) || 0,
                    perEvent: parseFloat(newVenueForm.pricing.perEvent) || 0
                },
                images: [],
                supportedEventTypes: newVenueForm.supportedEventTypes
            };
            
            await createVenue(venueData);
            setShowAddForm(false);
            setNewVenueForm({
                name: "",
                type: "",
                location: "",
                capacity: {
                    minCapacity: "",
                    maxCapacity: ""
                },
                pricing: {
                    perHour: "",
                    perEvent: ""
                },
                description: "",
                supportedEventTypes: []
            });
            loadVenues();
        } catch (error) {
            console.error("Error saving venue:", error);
        }
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
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter venue name"
                                    value={newVenueForm.name}
                                    onChange={(e) => setNewVenueForm({...newVenueForm, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Venue Type</label>
                                <select 
                                    className="form-control"
                                    value={newVenueForm.type}
                                    onChange={(e) => setNewVenueForm({...newVenueForm, type: e.target.value})}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Chalet">Chalet</option>
                                    <option value="School_Hall">School Hall</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Enter location"
                                    value={newVenueForm.location}
                                    onChange={(e) => setNewVenueForm({...newVenueForm, location: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Min Capacity</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Minimum capacity"
                                    value={newVenueForm.capacity.minCapacity}
                                    onChange={(e) => setNewVenueForm({
                                        ...newVenueForm, 
                                        capacity: {...newVenueForm.capacity, minCapacity: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Max Capacity</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Maximum capacity"
                                    value={newVenueForm.capacity.maxCapacity}
                                    onChange={(e) => setNewVenueForm({
                                        ...newVenueForm, 
                                        capacity: {...newVenueForm.capacity, maxCapacity: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price per Hour</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Price in USD"
                                    value={newVenueForm.pricing.perHour}
                                    onChange={(e) => setNewVenueForm({
                                        ...newVenueForm, 
                                        pricing: {...newVenueForm.pricing, perHour: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price per Event</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Price in USD"
                                    value={newVenueForm.pricing.perEvent}
                                    onChange={(e) => setNewVenueForm({
                                        ...newVenueForm, 
                                        pricing: {...newVenueForm.pricing, perEvent: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <textarea className="form-control" rows="3" placeholder="Venue description"></textarea>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="venue-btn" onClick={handleSaveVenue}>
                                Save Venue
                            </button>
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
                                <p className="venue-capacity">👥 Capacity: {venue.capacity?.minCapacity}-{venue.capacity?.maxCapacity}</p>
                                <p className="venue-price">💰 ${venue.pricing?.perHour || 0}/hour | ${venue.pricing?.perEvent || 0}/event</p>
                                <p className="venue-description">{venue.description}</p>
                                <div className="venue-amenities">
                                    {venue.supportedEventTypes?.map((eventType, index) => (
                                        <span key={index} className="amenity-tag">{eventType}</span>
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
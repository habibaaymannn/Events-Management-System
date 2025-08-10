import React, { useState } from "react";

const serviceCategories = [
    "Food Catering",
    "Decorations",
    "AV Equipment",
    "Photography",
    "Videography",
    "Furniture Rental",
    "Entertainment",
    "Transportation",
    "Security",
    "Cleaning"
];

const mockServices = [
    {
        id: 1,
        name: "Premium Wedding Catering",
        category: "Food Catering",
        description: "Full-service catering with gourmet menu options for weddings and special events",
        price: 50,
        unit: "per person",
        minOrder: 20,
        maxOrder: 500,
        status: "Active",
        serviceAreas: ["Downtown", "Business District", "Suburbs"],
        features: ["Appetizers", "Main Course", "Desserts", "Beverages", "Service Staff"],
        bookings: 12,
        revenue: 18000,
        rating: 4.8,
        availability: "Available"
    },
    {
        id: 2,
        name: "Professional Event Photography",
        category: "Photography",
        description: "High-quality event photography capturing all your special moments",
        price: 1500,
        unit: "per event",
        minOrder: 1,
        maxOrder: 1,
        status: "Active",
        serviceAreas: ["Downtown", "City Park", "Business District"],
        features: ["Digital Gallery", "Edited Photos", "Print Rights", "Online Sharing"],
        bookings: 8,
        revenue: 12000,
        rating: 4.9,
        availability: "Available"
    },
    {
        id: 3,
        name: "Complete AV Solution",
        category: "AV Equipment",
        description: "Professional audio-visual equipment rental with technical support",
        price: 800,
        unit: "per day",
        minOrder: 1,
        maxOrder: 7,
        status: "Active",
        serviceAreas: ["Downtown", "Convention Center", "Hotels"],
        features: ["Sound System", "Projectors", "Microphones", "Technical Support"],
        bookings: 15,
        revenue: 12000,
        rating: 4.7,
        availability: "Booked until Feb 20"
    },
    {
        id: 4,
        name: "Elegant Floral Arrangements",
        category: "Decorations",
        description: "Beautiful floral decorations for weddings, corporate events, and celebrations",
        price: 300,
        unit: "per arrangement",
        minOrder: 2,
        maxOrder: 50,
        status: "Inactive",
        serviceAreas: ["City Park", "Venues", "Hotels"],
        features: ["Fresh Flowers", "Custom Designs", "Setup Service", "Maintenance"],
        bookings: 5,
        revenue: 1500,
        rating: 4.6,
        availability: "Temporarily Unavailable"
    }
];

const MyServices = () => {
    const [services, setServices] = useState(mockServices);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        unit: "per person",
        minOrder: "",
        maxOrder: "",
        serviceAreas: [],
        features: [],
        newFeature: "",
        newArea: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddFeature = () => {
        if (formData.newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, prev.newFeature.trim()],
                newFeature: ""
            }));
        }
    };

    const handleRemoveFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleAddArea = () => {
        if (formData.newArea.trim()) {
            setFormData(prev => ({
                ...prev,
                serviceAreas: [...prev.serviceAreas, prev.newArea.trim()],
                newArea: ""
            }));
        }
    };

    const handleRemoveArea = (index) => {
        setFormData(prev => ({
            ...prev,
            serviceAreas: prev.serviceAreas.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingService) {
            // Update existing service
            setServices(services.map(s =>
                s.id === editingService.id
                    ? { ...s, ...formData, id: editingService.id }
                    : s
            ));
            setEditingService(null);
        } else {
            // Add new service
            const newService = {
                ...formData,
                id: Date.now(),
                status: "Active",
                bookings: 0,
                revenue: 0,
                rating: 0,
                availability: "Available"
            };
            setServices([...services, newService]);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            description: "",
            price: "",
            unit: "per person",
            minOrder: "",
            maxOrder: "",
            serviceAreas: [],
            features: [],
            newFeature: "",
            newArea: ""
        });
        setShowAddForm(false);
        setEditingService(null);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            category: service.category,
            description: service.description,
            price: service.price,
            unit: service.unit,
            minOrder: service.minOrder,
            maxOrder: service.maxOrder,
            serviceAreas: [...service.serviceAreas],
            features: [...service.features],
            newFeature: "",
            newArea: ""
        });
        setShowAddForm(true);
    };

    const handleDelete = (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            setServices(services.filter(s => s.id !== serviceId));
        }
    };

    const handleToggleStatus = (serviceId) => {
        setServices(services.map(s =>
            s.id === serviceId
                ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
                : s
        ));
    };

    return (
        <div className="service-page">
            <div className="service-page-header">
                <h3 className="service-page-title">My Services</h3>
                <p className="service-page-subtitle">Manage your service offerings and pricing</p>
            </div>

            <div className="service-section">
                <div className="section-header">
                    <h4 className="section-title">Service Management</h4>
                    <button
                        className="service-btn success"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? "Cancel" : "Add New Service"}
                    </button>
                </div>

                {showAddForm && (
                    <div className="service-form">
                        <h5>{editingService ? "Edit Service" : "Add New Service"}</h5>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Service Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Enter service name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {serviceCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Enter price"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Unit *</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="form-control"
                                    >
                                        <option value="per person">per person</option>
                                        <option value="per event">per event</option>
                                        <option value="per day">per day</option>
                                        <option value="per hour">per hour</option>
                                        <option value="per item">per item</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Minimum Order</label>
                                    <input
                                        type="number"
                                        name="minOrder"
                                        value={formData.minOrder}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Minimum quantity"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Maximum Order</label>
                                    <input
                                        type="number"
                                        name="maxOrder"
                                        value={formData.maxOrder}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        placeholder="Maximum quantity"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Describe your service"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Service Features</label>
                                    <div className="feature-input">
                                        <input
                                            type="text"
                                            value={formData.newFeature}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newFeature: e.target.value }))}
                                            className="form-control"
                                            placeholder="Add a feature"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="service-btn secondary"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="tags-container">
                                        {formData.features.map((feature, index) => (
                                            <span key={index} className="tag">
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFeature(index)}
                                                    className="tag-remove"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">Service Areas</label>
                                    <div className="feature-input">
                                        <input
                                            type="text"
                                            value={formData.newArea}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newArea: e.target.value }))}
                                            className="form-control"
                                            placeholder="Add service area"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddArea}
                                            className="service-btn secondary"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="tags-container">
                                        {formData.serviceAreas.map((area, index) => (
                                            <span key={index} className="tag">
                                                {area}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveArea(index)}
                                                    className="tag-remove"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="service-btn">
                                    {editingService ? "Update Service" : "Create Service"}
                                </button>
                                <button type="button" className="service-btn secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className="service-card">
                            <div className="service-card-header">
                                <h5 className="service-card-title">{service.name}</h5>
                                <span className={`status-badge status-${service.status.toLowerCase()}`}>
                                    {service.status}
                                </span>
                            </div>

                            <div className="service-card-content">
                                <p className="service-category">📁 {service.category}</p>
                                <p className="service-price">💰 ${service.price} {service.unit}</p>
                                <p className="service-description">{service.description}</p>

                                <div className="service-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Min Order:</span>
                                        <span className="detail-value">{service.minOrder}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Max Order:</span>
                                        <span className="detail-value">{service.maxOrder}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Rating:</span>
                                        <span className="detail-value">⭐ {service.rating}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Availability:</span>
                                        <span className="detail-value">{service.availability}</span>
                                    </div>
                                </div>

                                <div className="service-areas">
                                    <strong>Service Areas:</strong>
                                    <div className="areas-tags">
                                        {service.serviceAreas.map((area, index) => (
                                            <span key={index} className="area-tag">{area}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="service-features">
                                    <strong>Features:</strong>
                                    <div className="features-tags">
                                        {service.features.map((feature, index) => (
                                            <span key={index} className="feature-tag">{feature}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="service-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{service.bookings}</span>
                                        <span className="stat-label">Bookings</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">${service.revenue.toLocaleString()}</span>
                                        <span className="stat-label">Revenue</span>
                                    </div>
                                </div>
                            </div>

                            <div className="service-card-actions">
                                <button
                                    className="service-btn"
                                    onClick={() => handleEdit(service)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`service-btn ${service.status === "Active" ? "secondary" : "success"}`}
                                    onClick={() => handleToggleStatus(service.id)}
                                >
                                    {service.status === "Active" ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                    className="service-btn danger"
                                    onClick={() => handleDelete(service.id)}
                                >
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

export default MyServices;
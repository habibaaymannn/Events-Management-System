import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addNewService, getMyServices, updateServiceAvailability } from "../../api/serviceApi";

const serviceCategories = [
    { value: "CATERING_SERVICES", label: "Catering Services" },
    { value: "DECOR_AND_STYLING", label: "Decor and Styling" },
    { value: "AUDIO_VISUAL_SERVICES", label: "Audio Visual Services" },
    { value: "FURNITURE_EQUIPMENT_RENTAL", label: "Furniture & Equipment Rental" }
];

const MyServices = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "CATERING_SERVICES",
        price: "",
        location: "",
        availability: "AVAILABLE"
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await getMyServices();
            setServices(data);
        } catch (error) {
            console.error("Error loading services:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const serviceData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                availability: formData.availability
            };

            if (editingService) {
                // Update service logic would go here if endpoint exists
                console.log("Update service not implemented yet");
            } else {
                await addNewService(serviceData);
            }
            
            resetForm();
            setShowAddForm(false);
            loadServices();
        } catch (error) {
            console.error("Error saving service:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "CATERING_SERVICES",
            price: "",
            location: "",
            availability: "AVAILABLE"
        });
        setEditingService(null);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            location: service.location,
            availability: service.availability
        });
        setShowAddForm(true);
    };

    const handleDelete = (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            setServices(services.filter(s => s.id !== serviceId));
        }
    };

    const handleToggleStatus = async (serviceId) => {
        try {
            const service = services.find(s => s.id === serviceId);
            const newAvailability = service.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
            
            await updateServiceAvailability(serviceId, { availability: newAvailability });
            loadServices();
        } catch (error) {
            console.error("Error updating service availability:", error);
        }
    };

    return (
        <div className="service-page">
            <div className="service-page-header">
                <h3 className="service-page-title">My Services</h3>
                <p className="service-page-subtitle">Manage your service offerings</p>
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
                                    <label className="form-label">Service Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        className="form-control" 
                                        placeholder="Enter service name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select 
                                        name="description"
                                        className="form-control"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {serviceCategories.map(category => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        className="form-control" 
                                        placeholder="Enter price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input 
                                        type="text" 
                                        name="location"
                                        className="form-control" 
                                        placeholder="Enter location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="service-btn success">
                                    {editingService ? "Update Service" : "Add Service"}
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
                                <span className={`status-badge ${service.availability === "AVAILABLE" ? "status-confirmed" : "status-pending"}`}>
                                    {service.availability}
                                </span>
                            </div>
                            <div className="service-card-content">
                                <p className="service-category">
                                    {serviceCategories.find(cat => cat.value === service.description)?.label || service.description}
                                </p>
                                <p className="service-price">💰 ${service.price}</p>
                                <p className="service-location">📍 {service.location}</p>
                            </div>
                            <div className="service-card-actions">
                                <button className="service-btn" onClick={() => handleEdit(service)}>
                                    Edit
                                </button>
                                <button 
                                    className="service-btn secondary" 
                                    onClick={() => handleToggleStatus(service.id)}
                                >
                                    Toggle Status
                                </button>
                                <button className="service-btn danger" onClick={() => handleDelete(service.id)}>
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
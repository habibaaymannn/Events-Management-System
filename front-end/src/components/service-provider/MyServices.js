import { useEffect, useState } from "react";
import { addNewService, getMyServices, updateService, updateServiceAvailability } from "../../api/serviceApi";

const serviceCategories = [
  { value: "CATERING", label: "Catering" },
  { value: "DECOR_AND_STYLING", label: "Decor & Styling" },
  { value: "AUDIO_VISUAL", label: "Audio / Visual" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "FURNITURE_RENTAL", label: "Furniture Rental" }
];

const MyServices = () => {
    const [services, setServices] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        type: "CATERING",          // must match BE enum
        price: "",
        servicesAreasText: "",     // user types: "maadi, zamalek"
        availability: "AVAILABLE", // you already send this to BE
        description: ""            // optional; BE doesn’t require it
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImagePreview = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const removeExistingImage = (index) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const areas = (formData.servicesAreasText || "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

            const serviceData = {
                name: formData.name.trim(),
                type: formData.type,                 // REQUIRED by BE
                price: Number(formData.price),       // REQUIRED by BE
                servicesAreas: areas,                // REQUIRED by BE (List<String>)
                availability: formData.availability, // REQUIRED by BE
                description: formData.description?.trim() || undefined // optional
            };

            if (editingService) {
                await updateService(editingService.id, serviceData, imageFiles);
            } else {
                await addNewService(serviceData, imageFiles);
            }

            resetForm();
            setShowAddForm(false);
            loadServices();
        } catch (error) {
            console.error("Error saving service:", error);
            alert(`Failed to save service: ${error.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            type: "CATERING",          // must match BE enum
            price: "",
            servicesAreasText: "",     // user types: "maadi, zamalek"
            availability: "AVAILABLE", // you already send this to BE
            description: ""            // optional; BE doesn’t require it
        });
        setEditingService(null);
        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            type: service.type,
            price: service.price,
            servicesAreasText: (service.servicesAreas ?? []).join(", "),
            availability: service.availability,
            description: service.description ?? ""
        });
        setExistingImages(service.images || []);
        setImageFiles([]);
        setImagePreviews([]);
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
                                        name="type"
                                        className="form-control"
                                        value={formData.type}
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
                                        name="servicesAreasText"
                                        className="form-control"
                                        placeholder="Enter location"
                                        value={formData.servicesAreasText}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Service Images</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="form-control"
                                />
                                <small style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                                    You can upload multiple images (jpg, png, etc.)
                                </small>
                            </div>

                            {/* Existing Images (for edit mode) */}
                            {editingService && existingImages.length > 0 && (
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Current Images</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {existingImages.map((imageUrl, index) => (
                                            <div key={index} style={{ position: 'relative', width: '120px', height: '120px' }}>
                                                <img
                                                    src={imageUrl}
                                                    alt={`Service ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '2px solid #e9ecef'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">New Images Preview</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} style={{ position: 'relative', width: '120px', height: '120px' }}>
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '2px solid #667eea'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImagePreview(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    {serviceCategories.find(cat => cat.value === service.type)?.label || service.type}
                                </p>
                                <p className="service-price"> ${Number(service.price ?? 0)}</p>
                                <p className="service-location">{(service.servicesAreas ?? []).join(", ")}</p>
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
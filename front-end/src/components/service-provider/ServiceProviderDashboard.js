import React, { useState, useEffect } from "react";
import {
  addNewService,
  updateService,
  getMyServicesByProvider,
  getServiceById
} from "../../api/serviceApi";
import { updateServiceBookingStatus } from "../../api/bookingApi";
import { deleteService } from "../../api/serviceApi";
import { useNavigate } from "react-router-dom";

// Service categories (maps to backend ServiceType enum)
const SERVICE_CATEGORIES = [
  {
    value: "CATERING",
    label: "Catering Services",
    details: [
      "Full meal service (buffet, seated dinner)",
      "Light snacks and beverages",
      "Coffee and dessert stations",
      "Food trucks or live cooking stations",
    ],
  },
  {
    value: "DECOR_AND_STYLING",
    label: "Decor and Styling",
    details: [
      "Thematic decoration (e.g., weddings, corporate branding)",
      "Floral arrangements",
      "Stage design and backdrops",
      "Lighting decoration (mood/ambient lighting, balloons)",
    ],
  },
  {
    value: "AUDIO_VISUAL",
    label: "Audio Visual Services",
    details: [
      "Sound systems (speakers, mics, mixers)",
      "Projectors and LED screens",
      "Lighting rigs and effects",
      "Live streaming equipment",
      "Video recording / photography",
    ],
  },
  {
    value: "FURNITURE_RENTAL",
    label: "Furniture & Equipment Rental",
    details: [
      "Chairs and tables",
      "Tents and canopies (for outdoor events)",
      "Stages or podiums",
      "Dance floors",
      "Booths or exhibition stands",
    ],
  },
];

const AVAILABILITY_OPTIONS = [
  { key: "AVAILABLE", label: "Available" },
  { key: "UNAVAILABLE", label: "Unavailable" },
];

const ServiceProviderDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [bookingRequests, setBookingRequests] = useState(() => {
    const stored = localStorage.getItem("bookingRequests");
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedService, setSelectedService] = useState(null);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);
  const [formService, setFormService] = useState({
    name: "",
    type: "",
    price: "",
    servicesAreasText: "",
    availability: "AVAILABLE",
    description: ""
  });

  const [updatingRequestId, setUpdatingRequestId] = useState(null); // 🔹

  const serviceBookingRequests = bookingRequests.filter(req =>
      req.type === 'service' &&
      services.some(s => s.id?.toString() === req.itemId?.toString())
  );

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const data = await getMyServicesByProvider();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
  }, [bookingRequests]);

  const handleBookingRequest = async (requestId, action) => {
    setUpdatingRequestId(requestId); // 🔹
    try {
      if (action === 'approve') {
        await updateServiceBookingStatus(requestId, "ACCEPTED");
      } else {
        const reason = prompt("Please provide a reason for rejection:") || "No reason provided";
        await updateServiceBookingStatus(requestId, "REJECTED", reason);
      }
      const updatedRequests = bookingRequests.filter(req => req.id !== requestId);
      setBookingRequests(updatedRequests);
      loadServices();
    } catch (error) {
      console.error("Error handling booking request:", error);
    } finally {
      setUpdatingRequestId(null); // 🔹
    }
  };

  const handleServiceFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const areas = (formService.servicesAreasText || "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);

      const serviceData = {
        name: formService.name?.trim(),
        type: String(formService.type || "").toUpperCase(),
        price: Number(formService.price),
        servicesAreas: areas,
        availability: String(formService.availability || "").toUpperCase(),
        description: formService.description?.trim() || null
      };

      if (editServiceId) {
        await updateService(editServiceId, serviceData);
      } else {
        await addNewService(serviceData);
      }

      setFormService({
        name: "",
        type: "",
        price: "",
        servicesAreasText: "",
        availability: "AVAILABLE",
        description: ""
      });
      setShowAdd(false);
      setEditServiceId(null);
      loadServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleRemoveService = async (id) => {
    try {
      await deleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error removing service:", error);
    }
  };

  const handleEditService = (service) => {
    setEditServiceId(service.id);
    setFormService({
      name: service.name ?? "",
      type: service.type ?? "CATERING",
      price: service.price ?? "",
      servicesAreasText: Array.isArray(service.servicesAreas) ? service.servicesAreas.join(", ") : "",
      availability: service.availability ?? "AVAILABLE",
      description: service.description ?? ""
    });
    setShowAdd(true);
  };

  const handleServiceClick = async (serviceId) => {
    navigate(`/service/${serviceId}`);
    // setLoadingServiceDetails(true);
    // try {
    //   const serviceDetails = await getServiceById(serviceId);
    //   setSelectedService(serviceDetails);
    // } catch (error) {
    //   console.error("Error fetching service details:", error);
    //   alert("Failed to load service details.");
    // } finally {
    //   setLoadingServiceDetails(false);
    // }
  };

  return (
      <div style={{ width: "98vw", maxWidth: "98vw", margin: "10px auto", padding: "0 10px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
          Service Provider Dashboard
        </h2>

        {/* Booking Requests Section */}
        {serviceBookingRequests.filter(req => req.status === 'pending').length > 0 && (
            <div className="card" style={{ marginBottom: 32, border: '2px solid #ffc107' }}>
              <h3 style={{ marginBottom: 20, color: "#f59e0b" }}>Pending Booking Requests</h3>
              <div style={{ overflowX: "auto", width: '100%' }}>
                <table className="table" style={{ minWidth: '800px', width: '100%' }}>
                  <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Organizer</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {serviceBookingRequests.filter(req => req.status === 'pending').map(req => {
                    const service = services.find(s => s.id?.toString() === req.itemId?.toString());
                    return (
                        <tr key={req.id}>
                          <td
                              style={{fontWeight: 600, cursor: "pointer", color: "#0d6efd"}}
                              onClick={() => handleServiceClick(service?.id)}
                          >
                            {service?.name || 'Unknown Service'}
                          </td>
                          <td>{req.organizerEmail}</td>
                          <td>{new Date(req.date).toLocaleDateString()}</td>
                          <td>
                            <div style={{display: "flex", gap: 4}}>
                              <button
                                  onClick={() => handleBookingRequest(req.id, 'approve')}
                                  disabled={updatingRequestId === req.id}
                                  className="btn btn-success"
                                  style={{padding: "6px 12px", fontSize: "0.8rem"}}
                              >
                                Approve
                              </button>
                              <button
                                  onClick={() => handleBookingRequest(req.id, 'reject')}
                                  disabled={updatingRequestId === req.id}
                                  className="btn btn-danger"
                                  style={{padding: "6px 12px", fontSize: "0.8rem"}}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {loadingServiceDetails && <p>Loading service details...</p>}

        {selectedService && (
            <div className="card" style={{ marginTop: 24, padding: "1rem", border: "1px solid #ddd" }}>
              <h4>Service Details: {selectedService.name}</h4>
              <p><strong>Category:</strong> {SERVICE_CATEGORIES.find(c => c.value === selectedService.type)?.label || selectedService.type}</p>
              <p><strong>Price:</strong> ${selectedService.price}</p>
              <p><strong>Locations:</strong> {Array.isArray(selectedService.servicesAreas) ? selectedService.servicesAreas.join(", ") : (selectedService.location || "")}</p>
              <p><strong>Availability:</strong> {selectedService.availability}</p>
              <p><strong>Description:</strong> {selectedService.description ?? "No description"}</p>
              <button className="btn btn-secondary" onClick={() => setSelectedService(null)}>Close</button>
            </div>
        )}

        <button
            onClick={() => {
              setShowAdd(!showAdd);
              setEditServiceId(null);
              setFormService({
                name: "",
                type: "",
                price: "",
                servicesAreasText: "",
                availability: "AVAILABLE",
              });
            }}
            className="btn btn-primary"
            style={{ marginBottom: 24 }}
        >
          {showAdd ? "Cancel" : "Add New Service"}
        </button>

        {showAdd && (
            <div className="card" style={{ marginBottom: 32 }}>
              <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
                {editServiceId ? "Edit Service" : "Add New Service"}
              </h3>
              <form onSubmit={handleServiceFormSubmit}>
                <div className="form-group">
                  <input
                      required
                      placeholder="Service Name"
                      value={formService.name}
                      onChange={(e) => setFormService({...formService, name: e.target.value})}
                      className="form-control"
                  />
                </div>

                <div className="form-group">
                  <select
                      required
                      value={formService.type}
                      onChange={(e) => setFormService({...formService, type: e.target.value})}
                      className="form-control"
                  >
                    <option value="">Select Category</option>
                    {SERVICE_CATEGORIES.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  {formService.type && (
                      <ul style={{marginTop: 10, color: "#495057", fontSize: "0.95rem", paddingLeft: 20}}>
                        {SERVICE_CATEGORIES.find(c => c.value === formService.type)?.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                  )}
                </div>

                <div className="form-group">
                  <input
                      required
                      type="number"
                      placeholder="Price"
                      value={formService.price}
                      onChange={(e) => setFormService({...formService, price: e.target.value})}
                      min={1}
                      className="form-control"
                  />
                </div>

                <div className="form-group">
                  <input
                      required
                      placeholder="Locations (comma-separated)"
                      value={formService.servicesAreasText}
                      onChange={(e) => setFormService({...formService, servicesAreasText: e.target.value})}
                      className="form-control"
                  />
                </div>

                <div className="form-group">
                  <select
                      required
                      value={formService.availability}
                      onChange={(e) => setFormService({...formService, availability: e.target.value})}
                      className="form-control"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
              <textarea
                  placeholder="Description (optional)"
                  value={formService.description}
                  onChange={(e) => setFormService({ ...formService, description: e.target.value })}
                  className="form-control"
              />
                </div>

                <button type="submit" className="btn btn-success">
                  {editServiceId ? "Update Service" : "Add Service"}
                </button>
              </form>
            </div>
        )}

        <div className="card" style={{width: "100%", padding: "1.5rem"}}>
          <h3 style={{marginBottom: 20, color: "#2c3e50"}}>Your Services</h3>
          <div style={{overflowX: "auto", width: "100%"}}>
            <table className="table" style={{minWidth: "900px", width: "100%"}}>
              <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Locations</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Bookings</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {services.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                      No services added yet. Click "Add New Service" to get started.
                    </td>
                  </tr>
              ) : (
                  services.map((s) => (
                      <tr key={s.id}
                          style={{cursor: "pointer"}}
                          onClick={() => handleServiceClick(s.id)}>
                        <td
                            style={{fontWeight: 600, cursor: "pointer", color: "#0d6efd"}}
                        >
                          {s.name}
                        </td>
                        <td>{SERVICE_CATEGORIES.find(c => c.value === s.type)?.label || s.type}</td>
                        <td>{Array.isArray(s.servicesAreas) ? s.servicesAreas.join(", ") : (s.location || "")}</td>
                        <td>${s.price ?? 0}</td>
                        <td>
                    <span
                        className={`status-badge ${s.availability === "AVAILABLE" ? "status-confirmed" : "status-pending"}`}>
                      {AVAILABILITY_OPTIONS.find((opt) => opt.key === s.availability)?.label ?? s.availability}
                    </span>
                        </td>
                        <td>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/service-bookings", {state: {serviceId: s.id}});
                              }}
                              className="btn btn-success"
                              style={{padding: "6px 12px", fontSize: "0.8rem"}}
                          >
                            View Bookings
                          </button>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{display: "flex", gap: 4}}>
                            <button onClick={() => handleEditService(s)} className="btn btn-warning"
                                    style={{padding: "6px 12px", fontSize: "0.8rem"}}>
                              Edit
                            </button>
                            <button onClick={() => handleRemoveService(s.id)} className="btn btn-danger"
                                    style={{padding: "6px 12px", fontSize: "0.8rem"}}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default ServiceProviderDashboard;

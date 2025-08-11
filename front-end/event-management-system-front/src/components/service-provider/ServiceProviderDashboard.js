import React, { useState, useEffect } from "react";

// Enum values for ServiceDescription and Availability
const SERVICE_DESCRIPTIONS = [
	{
		key: "CATERING_SERVICES",
		label: "Catering Services",
		details: [
			"Full meal service (buffet, seated dinner)",
			"Light snacks and beverages",
			"Coffee and dessert stations",
			"Food trucks or live cooking stations",
		],
	},
	{
		key: "DECOR_AND_STYLING",
		label: "Decor and Styling",
		details: [
			"Thematic decoration (e.g., weddings, corporate branding)",
			"Floral arrangements",
			"Stage design and backdrops",
			"Lighting decoration (mood/ambient lighting, balloons)",
		],
	},
	{
		key: "AUDIO_VISUAL_SERVICES",
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
		key: "FURNITURE_EQUIPMENT_RENTAL",
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

const initialServices = [
	{
		id: 1,
		name: "Food Catering",
		description: "CATERING_SERVICES",
		price: 1000,
		location: "Downtown",
		availability: "AVAILABLE",
	},
	{
		id: 2,
		name: "Decorations",
		description: "DECOR_AND_STYLING",
		price: 500,
		location: "Uptown",
		availability: "UNAVAILABLE",
	},
	{
		id: 3,
		name: "Audio-visual Equipment",
		description: "AUDIO_VISUAL_SERVICES",
		price: 700,
		location: "City Center",
		availability: "AVAILABLE",
	},
	{
		id: 4,
		name: "Photography/Videography",
		description: "AUDIO_VISUAL_SERVICES",
		price: 800,
		location: "All Areas",
		availability: "UNAVAILABLE",
	},
	{
		id: 5,
		name: "Furniture Rental",
		description: "FURNITURE_EQUIPMENT_RENTAL",
		price: 300,
		location: "Suburbs",
		availability: "AVAILABLE",
	},
];

const ServiceProviderDashboard = () => {
	const [services, setServices] = useState(() => {
		const stored = localStorage.getItem("services");
		return stored ? JSON.parse(stored) : initialServices;
	});
	
	// Add booking requests state
	const [bookingRequests, setBookingRequests] = useState(() => {
		const stored = localStorage.getItem("bookingRequests");
		return stored ? JSON.parse(stored) : [];
	});

	// Get service booking requests
	const serviceBookingRequests = bookingRequests.filter(req => 
		req.type === 'service' && 
		services.some(s => s.id.toString() === req.itemId.toString())
	);

	useEffect(() => {
		localStorage.setItem("services", JSON.stringify(services));
	}, [services]);

	useEffect(() => {
		localStorage.setItem("bookingRequests", JSON.stringify(bookingRequests));
	}, [bookingRequests]);

	// Handle booking request approval/rejection
	const handleBookingRequest = (requestId, action) => {
		const updatedRequests = bookingRequests.map(req => {
			if (req.id === requestId) {
				const newStatus = action === 'approve' ? 'confirmed' : 'rejected';
				
				// If approved, add booking to service
				if (action === 'approve') {
					const service = services.find(s => s.id.toString() === req.itemId.toString());
					if (service) {
						const updatedServices = services.map(s => 
							s.id === service.id 
								? { ...s, bookings: [...(s.bookings || []), { date: req.date, user: req.organizerEmail, eventName: req.eventName }] }
								: s
						);
						setServices(updatedServices);
					}
				}
				
				return { ...req, status: newStatus, updatedAt: new Date().toISOString() };
			}
			return req;
		});
		
		setBookingRequests(updatedRequests);
	};

	// Add or Edit Service
	const handleServiceFormSubmit = (e) => {
		e.preventDefault();
		if (editServiceId) {
			setServices(
				services.map((s) =>
					s.id === editServiceId ? { ...formService, id: editServiceId } : s
				)
			);
			setEditServiceId(null);
		} else {
			setServices([...services, { ...formService, id: Date.now() }]);
		}
		setFormService({
			name: "",
			description: "",
			price: "",
			location: "",
			availability: "AVAILABLE",
		});
		setShowAdd(false);
	};

	// Remove Service
	const handleRemoveService = (id) => {
		setServices(services.filter((s) => s.id !== id));
	};

	// Edit Service
	const handleEditService = (service) => {
		setEditServiceId(service.id);
		setFormService({ ...service });
		setShowAdd(true);
	};

	// Get description details
	const getDescriptionDetails = (descKey) => {
		const desc = SERVICE_DESCRIPTIONS.find((d) => d.key === descKey);
		return desc ? desc.details : [];
	};

	return (
		<div
			style={{
				width: "98vw",
				maxWidth: "98vw",
				margin: "10px auto",
				padding: "0 10px",
			}}
		>
			<h2
				style={{
					textAlign: "center",
					marginBottom: 24,
					color: "#2c3e50",
					fontSize: "2.5rem",
					fontWeight: 700,
				}}
			>
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
									<th>Service</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{serviceBookingRequests.filter(req => req.status === 'pending').map(req => {
									const service = services.find(s => s.id.toString() === req.itemId.toString());
									return (
										<tr key={req.id}>
											<td style={{ fontWeight: 600 }}>{req.eventName}</td>
											<td>{req.organizerEmail}</td>
											<td>{new Date(req.date).toLocaleDateString()}</td>
											<td>{service?.name || 'Unknown Service'}</td>
											<td>
												<div style={{ display: "flex", gap: 4 }}>
													<button
														onClick={() => handleBookingRequest(req.id, 'approve')}
														className="btn btn-success"
														style={{ padding: "6px 12px", fontSize: "0.8rem" }}
													>
														Approve
													</button>
													<button
														onClick={() => handleBookingRequest(req.id, 'reject')}
														className="btn btn-danger"
														style={{ padding: "6px 12px", fontSize: "0.8rem" }}
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

			<button
				onClick={() => {
					setShowAdd(!showAdd);
					setEditServiceId(null);
					setFormService({
						name: "",
						description: "",
						price: "",
						location: "",
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
								onChange={(e) =>
									setFormService({ ...formService, name: e.target.value })
								}
								className="form-control"
							/>
						</div>
						<div className="form-group">
							<select
								required
								value={formService.description}
								onChange={(e) =>
									setFormService({ ...formService, description: e.target.value })
								}
								className="form-control"
							>
								<option value="">Select Service Description</option>
								{SERVICE_DESCRIPTIONS.map((desc) => (
									<option key={desc.key} value={desc.key}>
										{desc.label}
									</option>
								))}
							</select>
							{formService.description && (
								<ul
									style={{
										marginTop: 10,
										color: "#495057",
										fontSize: "0.95rem",
										paddingLeft: 20,
									}}
								>
									{getDescriptionDetails(formService.description).map((d, idx) => (
										<li key={idx}>{d}</li>
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
								onChange={(e) =>
									setFormService({ ...formService, price: e.target.value })
								}
								min={1}
								className="form-control"
							/>
						</div>
						<div className="form-group">
							<input
								required
								placeholder="Location"
								value={formService.location}
								onChange={(e) =>
									setFormService({ ...formService, location: e.target.value })
								}
								className="form-control"
							/>
						</div>
						<div className="form-group">
							<select
								required
								value={formService.availability}
								onChange={(e) =>
									setFormService({ ...formService, availability: e.target.value })
								}
								className="form-control"
							>
								{AVAILABILITY_OPTIONS.map((opt) => (
									<option key={opt.key} value={opt.key}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<button type="submit" className="btn btn-success">
							{editServiceId ? "Update Service" : "Add Service"}
						</button>
					</form>
				</div>
			)}

			<div className="card" style={{ width: "100%", padding: "1.5rem" }}>
				<h3 style={{ marginBottom: 20, color: "#2c3e50" }}>Your Services</h3>
				<div style={{ overflowX: "auto", width: "100%" }}>
					<table className="table" style={{ minWidth: "900px", width: "100%" }}>
						<thead>
							<tr>
								<th>Service Name</th>
								<th>Description</th>
								<th>Location</th>
								<th>Price</th>
								<th>Availability</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{services.length === 0 ? (
								<tr>
									<td
										colSpan="6"
										style={{
											textAlign: "center",
											color: "#6c757d",
											padding: "2rem",
										}}
									>
										No services added yet. Click "Add New Service" to get started.
									</td>
								</tr>
							) : (
								services.map((s) => (
									<tr key={s.id}>
										<td style={{ fontWeight: 600 }}>{s.name}</td>
										<td>
											<span style={{ fontWeight: 500 }}>
												{
													SERVICE_DESCRIPTIONS.find((d) => d.key === s.description)
														?.label || s.description
												}
											</span>
											<ul
												style={{
													margin: 0,
													paddingLeft: 18,
													color: "#6c757d",
													fontSize: "0.9rem",
												}}
											>
												{getDescriptionDetails(s.description).map((d, idx) => (
													<li key={idx}>{d}</li>
												))}
											</ul>
										</td>
										<td>{s.location}</td>
										<td>${s.price}</td>
										<td>
											<span
												className={`status-badge ${
													s.availability === "AVAILABLE"
														? "status-confirmed"
														: "status-pending"
												}`}
											>
												{
													AVAILABILITY_OPTIONS.find(
														(opt) => opt.key === s.availability
													)?.label
												}
											</span>
										</td>
										<td>
											<div style={{ display: "flex", gap: 4 }}>
												<button
													onClick={() => handleEditService(s)}
													className="btn btn-warning"
													style={{ padding: "6px 12px", fontSize: "0.8rem" }}
												>
													Edit
												</button>
												<button
													onClick={() => handleRemoveService(s.id)}
													className="btn btn-danger"
													style={{ padding: "6px 12px", fontSize: "0.8rem" }}
												>
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
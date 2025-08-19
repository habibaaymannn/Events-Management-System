import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Add a new service for the service provider.
 * @param {object} serviceData - Service data to create.
 * @returns {Promise<object>} - Created service object.
 */
export async function addNewService(serviceData) {
  const url = buildApiUrl("/v1/services");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(serviceData),
  });

  if (!response.ok) {
    throw new Error(`Failed to add service: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Accept or reject a booking request as a service provider.
 * @param {number|string} bookingId - Booking request ID.
 * @param {string} status - Status to set ("ACCEPTED" or "REJECTED").
 * @param {string} [reason] - Optional reason for rejection.
 * @returns {Promise<object>} - Updated booking object.
 */
export async function respondToBookingRequest(bookingId, status, reason = "") {
  const url = buildApiUrl(`/v1/services/bookings/${bookingId}/status`);
  const requestBody = { status };

  // Add reason if provided and status is REJECTED
  if (status === "REJECTED" && reason) {
    requestBody.cancellationReason = reason;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${status.toLowerCase()} booking: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Cancel a booking as a service provider.
 * @param {number|string} bookingId - Booking ID to cancel.
 * @param {string} [reason] - Optional cancellation reason.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function cancelServiceBooking(bookingId, reason = "") {
  const url = buildApiUrl(`/v1/services/bookings/${bookingId}/cancel`);
  const requestBody = {};
  
  // Add reason if provided
  if (reason) {
    requestBody.cancellationReason = reason;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }
}

/**
 * Update availability of a service.
 * @param {number|string} serviceId - Service ID.
 * @param {object} availabilityData - Availability data (e.g., { availability: "AVAILABLE" }).
 * @returns {Promise<object>} - Updated service object.
 */
export async function updateServiceAvailability(serviceId, availabilityData) {
  const url = buildApiUrl(`/v1/services/${serviceId}/availability`);
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(availabilityData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update service availability: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all bookings for the current service provider.
 * @param {number} [page=0] - Page number for pagination.
 * @param {number} [size=10] - Page size for pagination.
 * @param {string} [status] - Optional status filter ("PENDING", "ACCEPTED", "CANCELLED").
 * @returns {Promise<Array>} - Array of booking objects.
 */
export async function getServiceProviderBookings(page = 0, size = 10, status = "") {
  let url = buildApiUrl("/v1/services/bookings");
  const params = new URLSearchParams();
  
  if (page !== undefined) params.append('page', page);
  if (size !== undefined) params.append('size', size);
  if (status) params.append('status', status);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all services for the current service provider.
 * @returns {Promise<Array>} - Array of service objects.
 */
export async function getMyServices() {
  const url = buildApiUrl("/v1/services/my-services");
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch services: ${response.statusText}`);
  }

  return await response.json();
}


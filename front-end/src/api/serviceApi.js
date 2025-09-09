// src/api/serviceApi.js
import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';


function unwrapApiData(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.content)) return json.content;
  if (json && json.data && Array.isArray(json.data.content)) return json.data.content;
  return [];
}
/**
 * Add a new service for the service provider.
 * POST /v1/services/create
 */
export async function addNewService(serviceData) {
  const url = buildApiUrl('/v1/services/create');
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) throw new Error(`Failed to add service: ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Update a service by ID.
 * PUT /v1/services/{serviceId}
 */
export async function updateService(serviceId, serviceData) {
  const url = buildApiUrl(`/v1/services/${encodeURIComponent(serviceId)}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update service: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Get details of a single service by ID
 * GET /v1/services/{serviceId}
 */
export async function getServiceById(serviceId) {
  const url = buildApiUrl(`/v1/services/${encodeURIComponent(serviceId)}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(true),
  });
  if (!response.ok) throw new Error(`Failed to fetch service details: ${response.status} ${response.statusText}`);
  return await response.json();
}


/**
 * Accept or reject a booking request as a service provider.
 * POST /v1/services/bookings/{bookingId}/status
 * Body: { status: "ACCEPTED" | "REJECTED", cancellationReason?: string }
 */
export async function respondToBookingRequest(bookingId, status, reason = '') {
  const url = buildApiUrl(`/v1/services/bookings/${bookingId}/status`);
  const requestBody = { status };
  if (status === 'REJECTED' && reason) requestBody.cancellationReason = reason;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error(`Failed to ${status.toLowerCase()} booking: ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Cancel a booking as a service provider.
 * BE does NOT expose ".../cancel" in your constants.
 * Use the same status endpoint with status=CANCELLED for consistency.
 * POST /v1/services/bookings/{bookingId}/status
 * Body: { status: "CANCELLED", cancellationReason?: string }
 */
export async function cancelServiceBooking(bookingId, reason = '') {
  const url = buildApiUrl(`/v1/services/bookings/${bookingId}/status`);
  const requestBody = { status: 'CANCELLED' };
  if (reason) requestBody.cancellationReason = reason;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) throw new Error(`Failed to cancel booking: ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Update availability of a service.
 * Your BE constant is "/{serviceId}/update-availability".
 * It takes availability as a QUERY PARAM (common pattern).
 * PATCH /v1/services/{serviceId}/update-availability?availability=AVAILABLE
 * If caller passes { availability: "AVAILABLE" } we lift it into the query string.
 */
export async function updateServiceAvailability(serviceId, availabilityData) {
  const availability = availabilityData?.availability;
  let url = buildApiUrl(`/v1/services/${encodeURIComponent(serviceId)}/update-availability`);
  if (availability) {
    const qs = new URLSearchParams({ availability }).toString();
    url += `?${qs}`;
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    // Most controllers ignore body for this endpoint; keep it empty to be safe
  });
  if (!response.ok) throw new Error(`Failed to update service availability: ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Get all bookings for the current service provider.
 * GET /v1/services/bookings?page=&size=&status=
 * BE returns a Spring Page<>. We normalize to ARRAY for the dashboard.
 * Return shape: Array of bookings (content) — unwraps Page.content if present.
 */
export async function getServiceProviderBookings(page = 0, size = 10, status = '') {
  let url = buildApiUrl('/v1/services/bookings');
  const params = new URLSearchParams();
  if (page !== undefined && page !== null) params.append('page', page);
  if (size !== undefined && size !== null) params.append('size', size);
  if (status) params.append('status', status);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);

  const json = await response.json();
  // If BE returns {content:[...], ...}, give the dashboard just the array.
  return Array.isArray(json) ? json : (json.content ?? []);
}

/**
 * Get all services for the current service provider.
 * GET /v1/services/all
 * BE returns a Spring Page<ServicesDTO>. We return the array (content).
 */
export async function getMyServices() {
  const url = buildApiUrl('/v1/services/all');
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);

  const json = await response.json();
  return unwrapApiData(json);
}
  /**
   * Delete a service by ID.
   * DELETE /v1/services/{serviceId}
   */
export async function deleteService(serviceId) {
    const url = buildApiUrl(`/v1/services/${encodeURIComponent(serviceId)}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(true),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete service: ${response.status} ${response.statusText}`);
    }
    return true;
  }
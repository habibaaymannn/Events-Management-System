import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

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
 * Get all services.
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
 * Get all services for the current service provider.
 * BE returns a Spring Page<ServicesDTO>. We return the array (content).
 */
export async function getMyServicesByProvider() {
  const url = buildApiUrl('/v1/services/all/provider');
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);

  const json = await response.json();
  return unwrapApiData(json);
}

/**
 * Get all available services for booking (for event organizers).
 */
export async function getAllAvailableServices() {
  const url = buildApiUrl('/v1/services/all');
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Failed to fetch available services: ${response.status} ${response.statusText}`);

  const json = await response.json();
  return unwrapApiData(json);
}

/**
 * Get all bookings for a venue provider.
 * @param serviceProviderId
 * @param {number} page - Page number (optional, default 0).
 * @param {number} size - Page size (optional, default 20).
 * @returns {Promise<object>} - Paginated booking data.
 */
export async function getServiceProviderBookings(serviceProviderId, page = 0, size = 20) {
  const url = buildApiUrl(`/v1/bookings/services/service-provider/${encodeURIComponent(serviceProviderId)}?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET", headers: getAuthHeaders(true) });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }

  const json = await response.json();
  return json;
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

function unwrapApiData(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.content)) return json.content;
  if (json && json.data && Array.isArray(json.data.content)) return json.data.content;
  return [];
}

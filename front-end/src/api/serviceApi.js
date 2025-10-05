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
export async function addNewService(serviceData, imageFiles) {
  const url = buildApiUrl('/v1/services/create');
  const formData = new FormData();

  formData.append('service', new Blob([JSON.stringify(serviceData)], {
    type: 'application/json'
  }));

  // FIX: Handle case where imageFiles is undefined or empty
  if (imageFiles && imageFiles.length > 0) {
    // Append each image file with key "images"
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  } else {
    // Append empty array if no images
    formData.append('images', new Blob([], { type: 'application/json' }));
  }

  const headers = getAuthHeaders();
  delete headers['Content-Type'];

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`Failed to create service: ${response.status} ${response.statusText} ${txt}`);
  }

  return await response.json();
}

/**
 * Update a service by ID.
 * PUT /v1/services/{serviceId}
 */
export async function updateService(serviceId, serviceData, newImageFiles) {
  const url = buildApiUrl(`/v1/services/${encodeURIComponent(serviceId)}`);
  const formData = new FormData();

  formData.append('service', new Blob([JSON.stringify(serviceData)], {
    type: 'application/json'
  }));

  // Handle new images
  if (newImageFiles && newImageFiles.length > 0) {
    newImageFiles.forEach(file => {
      formData.append('newImages', file);
    });
  }

  const headers = getAuthHeaders();
  delete headers['Content-Type']; // Let browser set multipart content type

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`Failed to update service: ${response.status} ${response.statusText} ${txt}`);
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
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.content)) return json.content;
  if (Array.isArray(json?.data?.content)) return json.data.content;
  return [];
}

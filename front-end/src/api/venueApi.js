import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Get a single venue by ID.
 * @returns {Promise<object>} - Venue object.
 * @param venueId
 */
export async function getVenueById(venueId) {
  const url = buildApiUrl(`/v1/venues/${encodeURIComponent(venueId)}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(true),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch venue: ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Get all venues.
 * @returns {Promise<Array>} - Array of venue objects.
 */
export async function getAllVenues() {
  const url = buildApiUrl("/v1/venues/all");
  const response = await fetch(url, { method: "GET", headers: getAuthHeaders(true) });
  if (!response.ok) throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);

  const json = await response.json();
  return Array.isArray(json) ? json : (json.content ?? []);
}


export async function getAvailableVenues(startDate, endDate, page = 0, size = 20) {
  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toISOString().slice(0, 19);
    }
    if (typeof date === 'string') {
      return new Date(date).toISOString().slice(0, 19);
    }
    return date;
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  const url = buildApiUrl(
    `/v1/venues/available?startDate=${encodeURIComponent(formattedStart)}&endDate=${encodeURIComponent(formattedEnd)}&page=${page}&size=${size}`
  );

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to fetch available venues: ${response.status} - ${errorText}`);
  }

  return await response.json();
}


/**
 * Get all venues for the venue provider.
 * @returns {Promise<Array>} - Array of venue objects.
 */
export async function getAllVenuesByProvider() {
  const url = buildApiUrl("/v1/venues/all/provider");
  const response = await fetch(url, { method: "GET", headers: getAuthHeaders(true) });
  if (!response.ok) throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);

  const json = await response.json();
  return Array.isArray(json) ? json : (json.content ?? []);
}

/**
 * Get all bookings for a venue provider.
 * @param {string} venueProviderId - Current venue provider's ID.
 * @param {number} page - Page number (optional, default 0).
 * @param {number} size - Page size (optional, default 20).
 * @returns {Promise<object>} - Paginated booking data.
 */
export async function getBookingsByVenueProviderId(venueProviderId, page = 0, size = 20) {
  const url = buildApiUrl(`/v1/bookings/venues/venue-provider/${encodeURIComponent(venueProviderId)}?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET", headers: getAuthHeaders(true) });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }

  const json = await response.json();
  return json;
}

/**
 * Create a new venue.
 * @returns {Promise<object>} - Created venue object.
 * @param venueJsonData
 * @param imageFiles
 */
export async function createVenue(venueJsonData, imageFiles) {
  const url = buildApiUrl("/v1/venues/create");
  const formData = new FormData();
  formData.append('venue', new Blob([JSON.stringify(venueJsonData)], {
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
    throw new Error(`Failed to create venue: ${response.status} ${response.statusText} ${txt}`);
  }
  return await response.json();
}

/**
 * Update an existing venue by ID.
 * @returns {Promise<object>} - Updated venue object.
 * @param venueId
 * @param formData
 */
export async function updateVenue(venueId, formData) {
  const url = buildApiUrl(`/v1/venues/${venueId}`);
  const headers = getAuthHeaders();
  delete headers['Content-Type']; // Let browser set multipart content type

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`Failed to update venue: ${response.status} ${response.statusText} ${txt}`);
  }
  return await response.json();
}

/**
 * Delete a venue by ID.
 * @param {number|string} id - Venue ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function deleteVenue(id) {
  const url = buildApiUrl(`/v1/venues/${id}`);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete venue: ${response.statusText}`);
  }
}

/**
 * Accept or reject a venue booking request.
 * @param {number|string} bookingId - Booking request ID.
 * @param {string} status - Status to set ("ACCEPTED" or "REJECTED").
 * @param {string} [reason] - Optional reason for rejection.
 * @returns {Promise<object>} - Updated booking object.
 */
export async function respondToVenueBookingRequest(bookingId, status, reason = "") {
  const url = buildApiUrl(`/v1/venues/bookings/${bookingId}/status`);
  const requestBody = { status };
  
  // Add reason if provided and status is REJECTED
  if (status === "REJECTED" && reason) {
    requestBody.cancellationReason = reason;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${status.toLowerCase()} venue booking: ${response.statusText}`);
  }

  return await response.json();
}
import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Create a new venue.
 * @param {object} venueData - Venue data to create.
 * @returns {Promise<object>} - Created venue object.
 */
export async function createVenue(venueData) {
  const url = buildApiUrl("/v1/venues/create");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),       // <<< add true to set application/json
    body: JSON.stringify(venueData),
  });

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`Failed to create venue: ${response.status} ${response.statusText} ${txt}`);
  }
  return await response.json();
}


/**
 * Get a single venue by ID.
 * @param {number|string} id - Venue ID.
 * @returns {Promise<object>} - Venue object.
 */
export async function getVenueById(id) {
  const url = buildApiUrl(`/v1/venues/${id}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch venue: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update an existing venue by ID.
 * @param {number|string} id - Venue ID.
 * @param {object} venueData - Venue data to update.
 * @returns {Promise<object>} - Updated venue object.
 */
export async function updateVenue(id, venueData) {
  const url = buildApiUrl(`/v1/venues/${id}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(venueData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update venue: ${response.statusText}`);
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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete venue: ${response.statusText}`);
  }
}

/**
 * Get all venues for the venue provider.
 * @returns {Promise<Array>} - Array of venue objects.
 */

function unwrapApiData(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.content)) return json.content;
  if (json && json.data && Array.isArray(json.data.content)) return json.data.content;
  return [];
}

export async function getAllVenues() {
  const url = buildApiUrl("/v1/venues/all");
  const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to fetch venues: ${response.status} ${response.statusText}`);

  const json = await response.json();
  // Spring Page -> take the content array
  return Array.isArray(json) ? json : (json.content ?? []);
}


/**
 * Cancel a booking as a venue provider.
 * @param {number|string} bookingId - Booking ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function cancelVenueBooking(bookingId) {
  const url = buildApiUrl(`/v1/venues/bookings/${bookingId}/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
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
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to ${status.toLowerCase()} venue booking: ${response.statusText}`);
  }

  return await response.json();
}


import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Get an event by its ID.
 * @param {number|string} id - Event ID.
 * @returns {Promise<object>} - Event object.
 */
export async function getEventById(id) {
  const url = buildApiUrl(`/v1/events/${id}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update an existing event by ID.
 * @param {number|string} id - Event ID.
 * @param {object} eventData - Event data to update.
 * @returns {Promise<object>} - Updated event object.
 */
export async function updateEvent(id, eventData) {
  const url = buildApiUrl(`/v1/events/${id}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(true),    // Add JSON header for PUT requests
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete an event by its ID.
 * @param {number|string} id - Event ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function cancelEvent(id) {
  const url = buildApiUrl(`/v1/events/${id}/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel event: ${response.statusText}`);
  }
}

export const deleteEvent = cancelEvent;

/**
 * Get all events (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated events response.
 */
export async function getAllEvents(page = 0, size = 10) {
  const url = buildApiUrl(`/v1/events/all?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json?.data?.content) return json.data.content;
  if (json?.content) return json.content;
  return json?.data ?? [];
}

/**
 * Create a new event.
 * @param {object} eventData - Event data to create.
 * @returns {Promise<object>} - Created event object.
 */
export async function createEvent(eventData) {
  const url = buildApiUrl("/v1/events/create");      // <<< correct path
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),                    // <<< JSON header
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    throw new Error(`Failed to create event: ${response.status} ${response.statusText} ${txt}`);
  }
  return await response.json();
}


/**
 * Get events filtered by event type.
 * @param {string} type - Event type (e.g., WEDDING, CONFERENCE, etc.).
 * @returns {Promise<Array>} - Array of event objects.
 */
export async function getEventsByType(type) {
  const url = buildApiUrl(`/v1/events/type/${encodeURIComponent(type)}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events by type: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get events created by the current organizer (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated events response.
 */
export async function getEventsByOrganizer(page = 0, size = 10) {
  const url = buildApiUrl(`/v1/events/organizer?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch organizer events: ${response.statusText}`);
  }

  const json = await response.json();
  if (Array.isArray(json)) return json;
  if (json?.data?.content) return json.data.content;
  if (json?.content) return json.content;
  return json?.data ?? [];
}
/**
 * Get an event by its ID.
 * @param {number|string} id - Event ID.
 * @returns {Promise<object>} - Event object.
 */
export async function getEventById(id) {
  const url = `http://localhost:8080/v1/events/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
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
  const url = `http://localhost:8080/v1/events/${id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
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
export async function deleteEvent(id) {
  const url = `http://localhost:8080/v1/events/${id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
}

/**
 * Get all events (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated events response.
 */
export async function getAllEvents(page = 0, size = 10) {
  const url = `http://localhost:8080/v1/events?page=${page}&size=${size}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a new event.
 * @param {object} eventData - Event data to create.
 * @returns {Promise<object>} - Created event object.
 */
export async function createEvent(eventData) {
  const url = `http://localhost:8080/v1/events`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get events filtered by event type.
 * @param {string} type - Event type (e.g., WEDDING, CONFERENCE, etc.).
 * @returns {Promise<Array>} - Array of event objects.
 */
export async function getEventsByType(type) {
  const url = `http://localhost:8080/v1/events/type/${encodeURIComponent(type)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events by type: ${response.statusText}`);
  }

  return await response.json();
}

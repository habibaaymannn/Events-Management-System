import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Update a user's role via the admin endpoint.
 * @param {string} userId - The user's ID.
 * @param {string} role - The new role to assign.
 * @returns {Promise<object>} - The updated user object.
 */
export async function updateUserRole(userId, role) {
  const url = buildApiUrl(`/v1/admin/users/${userId}/role?role=${encodeURIComponent(role)}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user role: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all users in the system (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated users response.
 */
export async function getAllUsers(page = 0, size = 10) {
  const url = buildApiUrl(`/v1/admin/users?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Deactivate a user via the admin endpoint.
 * @param {string} userId - The user's ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function deactivateUser(userId) {
  const url = buildApiUrl(`/v1/admin/users/${userId}/deactivate`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to deactivate user: ${response.statusText}`);
  }
}

/**
 * Flag an event via the admin endpoint.
 * @param {number|string} eventId - The event's ID.
 * @param {string} reason - The reason for flagging.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function flagEvent(eventId, reason) {
  const url = buildApiUrl(`/v1/admin/events/${eventId}/flag?reason=${encodeURIComponent(reason)}`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to flag event: ${response.statusText}`);
  }
}

/**
 * Cancel an event via the admin endpoint.
 * @param {number|string} eventId - The event's ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function cancelEvent(eventId) {
  const url = buildApiUrl(`/v1/admin/events/${eventId}/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel event: ${response.statusText}`);
  }
}

/**
 * Get all events in the system (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated events response.
 */
export async function getAllEvents(page = 0, size = 10) {
  const url = buildApiUrl(`/v1/admin/events?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all flagged events in the system (paginated).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated flagged events response.
 */
export async function getFlaggedEvents(page = 0, size = 10) {
  const url = buildApiUrl(`/v1/admin/events/flagged?page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch flagged events: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get events by status (paginated).
 * @param {string} status - Event status (DRAFT, PLANNING, CONFIRMED, CANCELLED).
 * @param {number} [page=0] - Page number.
 * @param {number} [size=10] - Page size.
 * @returns {Promise<object>} - Paginated events response.
 */
export async function getEventsByStatus(status, page = 0, size = 10) {
  const url = buildApiUrl(`/v1/admin/events/by-status?status=${encodeURIComponent(status)}&page=${page}&size=${size}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events by status: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get event type distribution.
 * @returns {Promise<object>} - Event type distribution object.
 */
export async function getEventTypeDistribution() {
  const url = buildApiUrl("/v1/admin/event-type-distribution");
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event type distribution: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get admin dashboard data.
 * @returns {Promise<object>} - Dashboard statistics.
 */
export async function getAdminDashboard() {
  const url = buildApiUrl("/v1/admin/dashboard");
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin dashboard: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get daily cancellations between start and end dates.
 * @param {string} start - Start date (YYYY-MM-DD).
 * @param {string} end - End date (YYYY-MM-DD).
 * @returns {Promise<object>} - Daily cancellations response.
 */
export async function getDailyCancellations(start, end) {
  const url = buildApiUrl(`/v1/admin/daily-cancellations?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch daily cancellations: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get daily bookings between start and end dates.
 * @param {string} start - Start date (YYYY-MM-DD).
 * @param {string} end - End date (YYYY-MM-DD).
 * @returns {Promise<object>} - Daily bookings response.
 */
export async function getDailyBookings(start, end) {
  const url = buildApiUrl(`/v1/admin/daily-bookings?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch daily bookings: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a new user via the admin endpoint.
 * @param {object} userData - User data to create.
 * @returns {Promise<object>} - Created user object.
 */
export async function createUser(userData) {
  const url = buildApiUrl("/v1/admin/users");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  return await response.json();
}


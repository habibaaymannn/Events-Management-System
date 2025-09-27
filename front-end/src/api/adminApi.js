import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';
import { keycloakSettings } from '../config/keycloakConfig';

/**
 * Update a user's role via the admin endpoint.
 * @param {string} userId - The user's ID.
 * @param {string} role - The new role to assign.
 * @returns {Promise<object>} - The updated user object.
 */
// api/adminApi.js
// api/adminApi.js
export async function updateUserRole(userId, role) {
  const url = buildApiUrl(
    `/v1/admin/users/${encodeURIComponent(userId)}/role?role=${encodeURIComponent(role)}`
  );
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(true),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to update role: ${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return await res.json(); // { role: "organizer" } or full user
  }
  // backend returned empty body → fall back so UI can still update
  return { role };
}


// const onChangeRole = async (userId, uiValue) => {
//   // map UI label to backend value if needed
//   const role = ({
//     'Admin': 'admin',
//     'Event Organizer': 'organizer',
//     'Event Attendee': 'attendee',
//     'Service Provider': 'service_provider',
//     'Venue Provider': 'venue_provider'
//   })[uiValue] || uiValue;

//   try {
//     const data = await updateUserRole(userId, role); // { role: "organizer" }
//     const confirmed = data?.role || role;

//     setUsers(prev => prev.map(u =>
//       u.id === userId
//         ? {
//             ...u,
//             role: confirmed,
//             attributes: { ...(u.attributes || {}), userType: [confirmed] } // keep list in sync
//           }
//         : u
//     ));
//   } catch (e) {
//     // toast error if you want
//   }
// };

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

  const json = await response.json();
  // Normalize to { content: [...] } so callers can keep using response.content
  return Array.isArray(json) ? { content: json } : json;
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

export async function resetUserPassword(userId) {
  const url = buildApiUrl(`/v1/admin/users/${userId}/reset-password`);
  const r = await fetch(url, { method: "POST", headers: getAuthHeaders(true) });
  if (!r.ok) throw new Error(`Failed to reset password: ${r.status} ${r.statusText}`);

  // Try to parse JSON (new backend behavior)
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await r.json(); // { emailSent, forgotPasswordEntryUrl, accountUrl }
  }

  // Fallback for 204 / empty body (old behavior): build useful links client-side
  const base = (keycloakSettings.url || "").replace(/\/$/, "");
  const realm = keycloakSettings.realm;
  const clientId = keycloakSettings.clientId;
  const redirect = encodeURIComponent(`${window.location.origin}/password-updated`);

  return {
    emailSent: true,
    forgotPasswordEntryUrl:
      `${base}/realms/${realm}/protocol/openid-connect/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${redirect}` +
      `&response_type=code&scope=openid`,
    accountUrl: `${base}/realms/${realm}/account`,
  };
}
export async function activateUser(userId) {
  const url = buildApiUrl(`/v1/admin/users/${userId}/activate`);
  const r = await fetch(url, { method: "POST", headers: getAuthHeaders(true) });
  if (!r.ok) throw new Error(`Failed to activate user: ${r.statusText}`);
}

export async function deleteUser(userId, { notify = false, reason = "" } = {}) {
  const qs = new URLSearchParams();
  if (notify) qs.set("notify", "true");
  if (notify && reason) qs.set("reason", reason);

  const url = buildApiUrl(`/v1/admin/users/${encodeURIComponent(userId)}${qs.toString() ? "?" + qs.toString() : ""}`);
  const res = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(true),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Failed to delete user: ${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : { deleted: true, notified: notify };
}


/**
 * Flag an event via the admin endpoint.
 * @param {number|string} eventId - The event's ID.
 * @param {string} reason - The reason for flagging.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function flagEvent(eventId, reason) {
  const url = buildApiUrl(`/v1/events/${eventId}/flag?reason=${encodeURIComponent(reason)}`);
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
  const url = buildApiUrl(`/v1/events/${eventId}/cancel`);
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
  const url = buildApiUrl(`/v1/events/all?page=${page}&size=${size}`);
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
  const url = buildApiUrl(`/v1/events/flagged?page=${page}&size=${size}`);
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
  const url = buildApiUrl(`/v1/events/by-status?status=${encodeURIComponent(status)}&page=${page}&size=${size}`);
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
export async function getDailyCancellations(startISO, endISO) {
  const url = buildApiUrl(`/v1/admin/daily-cancellations?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`daily cancellations failed: ${res.status} ${res.statusText}`);
  return await res.json();
}

/**
 * Get daily bookings between start and end dates.
 * @param {string} start - Start date (YYYY-MM-DD).
 * @param {string} end - End date (YYYY-MM-DD).
 * @returns {Promise<object>} - Daily bookings response.
 */
export async function getDailyBookings(startISO, endISO) {
  const url = buildApiUrl(`/v1/admin/daily-bookings?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`daily bookings failed: ${res.status} ${res.statusText}`);
  // Backend returns: { "2025-09-13": 3, "2025-09-14": 1, ... }
  return await res.json();
}


/**
 * Create a new user via the admin endpoint.
 * @param {object} userData - User data to create.
 * @returns {Promise<object>} - Created user object.
 */
 export async function createUser({ firstName, lastName, email, role, username, password }) {
   const url = buildApiUrl('/v1/admin/users');
   const response = await fetch(url, {
     method: 'POST',
     headers: {
       ...getAuthHeaders(true),
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ firstName, lastName, email, role, username, password }),
   });
   if (!response.ok) {
     const msg = await response.text();
     throw new Error(msg || `Failed to create user: ${response.statusText}`);
   }
   return await response.json();
 }

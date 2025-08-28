import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Update the status of a booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} status - New status (PENDING, BOOKED, ACCEPTED, REJECTED, CANCELLED).
 * @returns {Promise<object>} - Updated booking object.
 */
export async function updateBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/${bookingId}/status/${status}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to update booking status: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Book a venue for an organizer.
 * @param {object} bookingData - Venue booking data.
 * @returns {Promise<object>} - Created booking object.
 */
export async function bookVenue(bookingData) {
  const url = buildApiUrl("/v1/bookings/venues");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Failed to book venue: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Book a service for an organizer.
 * @param {object} bookingData - Service booking data.
 * @returns {Promise<object>} - Created booking object.
 */
export async function bookService(bookingData) {
  const url = buildApiUrl("/v1/bookings/services");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Failed to book service: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Book combined resources (venues and services) for an organizer.
 * @param {object} bookingData - Combined booking data with venues and services.
 * @returns {Promise<object>} - Created booking objects.
 */
export async function bookCombinedResources(bookingData) {
  const url = buildApiUrl("/v1/bookings/combined");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(`Failed to book combined resources: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get booking details by ID.
 * @param {number} bookingId - The booking ID.
 * @returns {Promise<object>} - Booking details object.
 */
export async function getBookingById(bookingId) {
  const url = buildApiUrl(`/v1/bookings/${bookingId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get booking details: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all bookings for a specific event.
 * @param {number} eventId - The event ID.
 * @returns {Promise<Array>} - Array of booking objects for the event.
 */
export async function getBookingsByEventId(eventId) {
  const url = buildApiUrl(`/v1/bookings/event/${eventId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get event bookings: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all bookings for a specific attendee.
 * @param {string} attendeeId - The attendee ID.
 * @returns {Promise<Array>} - Array of booking objects for the attendee.
 */
export async function getBookingsByAttendeeId(attendeeId) {
  const url = buildApiUrl(`/v1/bookings/attendee/${attendeeId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get attendee bookings: ${response.statusText}`);
  }

  return await response.json();
}

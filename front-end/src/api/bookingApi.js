import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

/**
 * Update the status of a booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} status - New status (PENDING, BOOKED, ACCEPTED, REJECTED, CANCELLED).
 * @returns {Promise<object>} - Updated booking object.
 */
export async function updateServiceBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/services/${bookingId}/status/${status}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(true),
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
  const url = buildApiUrl("/v1/bookings/venues/create"); // <<< add /create
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),                       // <<< JSON header
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error(`Failed to book venue: ${response.status} ${response.statusText}`);
  return await response.json();
}



/**
 * Book a service for an organizer.
 * @param {object} bookingData - Service booking data.
 * @returns {Promise<object>} - Created booking object.
 */
export async function bookService(bookingData) {
  const url = buildApiUrl("/v1/bookings/services/create"); // <<< add /create
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),                          // <<< JSON header
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error(`Failed to book service: ${response.status} ${response.statusText}`);
  return await response.json();
}

/**
 * Get booking details by ID.
 * @param {number} bookingId - The booking ID.
 * @returns {Promise<object>} - Booking details object.
 */
export async function getVenueBookingById(bookingId) {
  const url = buildApiUrl(`/v1/bookings/venues/${bookingId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Failed to get booking details: ${response.statusText}`);
  }

  return await response.json();
}
/**
 * Get booking details by ID.
 * @param {number} bookingId - The booking ID.
 * @returns {Promise<object>} - Booking details object.
 */
export async function getServiceBookingById(bookingId) {
  const url = buildApiUrl(`/v1/bookings/services/${bookingId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(true),
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
/**
 * Cancel booking
 * @param {Long} bookingId - The attendee ID.
 * @param cancellationReason
 */
export async function cancelVenueBooking(bookingId, cancellationReason = "") {
  const url = buildApiUrl(`/v1/bookings/venues/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      cancellationReason: cancellationReason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }

  return await response.json();
}
/**
 * Cancel booking
 * @param {Long} bookingId - The attendee ID.
 * @param cancellationReason
 */
export async function cancelServiceBooking(bookingId, cancellationReason = "") {
  const url = buildApiUrl(`/v1/bookings/services/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      cancellationReason: cancellationReason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }

  return await response.json();
}

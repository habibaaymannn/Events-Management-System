import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';

function unwrapApiData(json) { 
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && Array.isArray(json.content)) return json.content;
  if (json?.data && Array.isArray(json.data.content)) return json.data.content;
  return [];
}

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
 * Update the status of a venue booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} status - New status (PENDING, BOOKED, ACCEPTED, REJECTED, CANCELLED).
 * @returns {Promise<object>} - Updated booking object.
 */
export async function updateVenueBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/venues/${bookingId}/status/${status}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to update venue booking status: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update the status of a service booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} status - New status (PENDING, BOOKED, ACCEPTED, REJECTED, CANCELLED).
 * @returns {Promise<object>} - Updated booking object.
 */
export async function updateServiceBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/services/${bookingId}/status/${status}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to update service booking status: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Cancel a venue booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} reason - Cancellation reason.
 * @returns {Promise<object>} - Cancellation response.
 */
export async function cancelVenueBooking(bookingId, reason) {
  const url = buildApiUrl("/v1/bookings/venues/cancel");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      reason: reason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel venue booking: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Cancel a service booking.
 * @param {number|string} bookingId - Booking ID.
 * @param {string} reason - Cancellation reason.
 * @returns {Promise<object>} - Cancellation response.
 */
export async function cancelServiceBooking(bookingId, reason) {
  const url = buildApiUrl("/v1/bookings/services/cancel");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      reason: reason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel service booking: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Book a venue for an organizer.
 * @param {object} bookingData - Venue booking data with startTime, endTime, currency, amount, isCaptured, venueId, eventId.
 * @returns {Promise<object>} - Created booking object with paymentUrl for Stripe redirect.
 */
export async function bookVenue(bookingData) {
  const url = buildApiUrl("/v1/bookings/venues/create");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(bookingData),
  });
  if (!response.ok) throw new Error(`Failed to book venue: ${response.status} ${response.statusText}`);
  return await response.json();
}



/**
 * Book a service for an organizer.
 * @param {object} bookingData - Service booking data with startTime, endTime, currency, amount, isCaptured, serviceId, eventId.
 * @returns {Promise<object>} - Created booking object with paymentUrl for Stripe redirect.
 */
export async function bookService(bookingData) {
  const url = buildApiUrl("/v1/bookings/services/create");
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
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

/**
 * Get venue bookings by event ID
 * @param {number} eventId - Event ID
 * @returns {Promise<Array>} - Array of venue bookings for the event
 */
export async function getVenueBookingsByEventId(eventId) {
  const url = buildApiUrl(`/v1/bookings/venues/event/${eventId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get venue bookings: ${response.statusText}`);
  }
  
  const json = await response.json();
  return unwrapApiData(json);
}

/**
 * Get service bookings by event ID
 * @param {number} eventId - Event ID
 * @returns {Promise<Array>} - Array of service bookings for the event
 */
export async function getServiceBookingsByEventId(eventId) {
  const url = buildApiUrl(`/v1/bookings/services/event/${eventId}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get service bookings: ${response.statusText}`);
  }
  
  const json = await response.json();
  return unwrapApiData(json);
}

/**
 * Confirm payment after Stripe redirect
 * @param {string} bookingType - Type of booking ('VENUE' or 'SERVICE')
 * @param {string} sessionId - Stripe session ID
 * @param {boolean} canceled - Whether payment was canceled
 * @returns {Promise<object>} - Payment confirmation response
 */
export async function confirmPayment(bookingType, sessionId, canceled = false) {
  const params = new URLSearchParams({
    booking_type: bookingType,
    session_id: sessionId,
    canceled: canceled.toString()
  });
  
  const url = buildApiUrl(`/v1/payments/confirm?${params.toString()}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to confirm payment: ${response.statusText}`);
  }

  return await response.json();
}

// src/api/bookingApi.js

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
 * Create a payment session for a booking.
 * @param {string} bookingId - ID of the booking to create a payment session for.
 * @returns {Promise<string>} - Payment URL returned by the backend.
 * @throws {Error} - If the request fails or response is not OK.
 */
export async function createServicePaymentSession(bookingId) {
  const url = buildApiUrl(`/v1/payments/${bookingId}/create-payment-session`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
  });
  if (!response.ok) throw new Error(`Failed to create payment session: ${response.statusText}`);
  return await response.text(); // Returns the payment URL as string
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
  // Backend exposes attendee event bookings under /v1/bookings/events/attendee/{id}
  // Keeping your signature (no page/size params) — we use sensible defaults.
  const page = 0;
  const size = 50;

  const url = buildApiUrl(
    `/v1/bookings/events/attendee/${encodeURIComponent(attendeeId)}?page=${page}&size=${size}`
  );

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get attendee bookings: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  // Match your existing unwrap style
  if (Array.isArray(json)) return json;
  if (json?.data?.content) return json.data.content;
  if (json?.content) return json.content;
  return json?.data ?? [];
}


/**
 * Cancel booking
 * @param {Long} bookingId - The booking ID.
 * @param cancellationReason
 */
export async function cancelVenueBooking(bookingId, cancellationReason = "") {
  const url = buildApiUrl(`/v1/bookings/venues/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      reason: cancellationReason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true, message: 'Booking cancelled successfully' };
  }

  try {
    return await response.json();
  } catch (error) {
    // If JSON parsing fails, log the error and return success message
    console.warn('Failed to parse JSON response:', error);
    return { success: true, message: 'Booking cancelled successfully' };
  }
}
/**
 * Cancel booking
 * @param {Long} bookingId - The booking ID.
 * @param cancellationReason
 */
export async function cancelServiceBooking(bookingId, cancellationReason = "") {
  const url = buildApiUrl(`/v1/bookings/services/cancel`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      bookingId: bookingId,
      reason: cancellationReason
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true, message: 'Booking cancelled successfully' };
  }

  try {
    return await response.json();
  } catch (error) {
    // If JSON parsing fails, log the error and return success message
    console.warn('Failed to parse JSON response:', error);
    return { success: true, message: 'Booking cancelled successfully' };
  }
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

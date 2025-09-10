// src/api/bookingApi.js

import { buildApiUrl, getAuthHeaders } from '../config/apiConfig';



/** -------------------- CREATE BOOKINGS -------------------- **/

// Create an EVENT booking
export async function bookEvent(payload) {
  // payload: { eventId, attendeeId, startTime, endTime, ... }  // shape per your backend DTO
  const url = buildApiUrl(`/v1/bookings/events/create`);
  const r = await fetch(url, { method: "POST", headers: getAuthHeaders(true), body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`Failed to create event booking: ${r.statusText}`);
  return r.json();
}

// Create a SERVICE booking
export async function bookService(payload) {
  // payload: { serviceProviderId, organizerId, startTime, endTime, ... }
  const url = buildApiUrl(`/v1/bookings/services/create`);
  const r = await fetch(url, { method: "POST", headers: getAuthHeaders(true), body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`Failed to create service booking: ${r.statusText}`);
  return r.json();
}

// Create a VENUE booking
export async function bookVenue(payload) {
  // payload: { venueProviderId, organizerId, startTime, endTime, ... }
  const url = buildApiUrl(`/v1/bookings/venues/create`);
  const r = await fetch(url, { method: "POST", headers: getAuthHeaders(true), body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`Failed to create venue booking: ${r.statusText}`);
  return r.json();
}

/** -------------------- EVENT BOOKINGS -------------------- **/

export async function updateBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/events/${bookingId}/status/${encodeURIComponent(status)}`);
  const r = await fetch(url, { method: "PUT", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to update event booking: ${r.statusText}`);
  return r.json();
}

export async function getEventBookingsByEventId(eventId) {
  const url = buildApiUrl(`/v1/bookings/events/event/${encodeURIComponent(eventId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch event bookings: ${r.statusText}`);
  return r.json();
}

export async function getEventBookingsByAttendeeId(attendeeId) {
  const url = buildApiUrl(`/v1/bookings/events/attendee/${encodeURIComponent(attendeeId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch attendee event bookings: ${r.statusText}`);
  return r.json();
}

/** -------------------- SERVICE BOOKINGS -------------------- **/

export async function updateServiceBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/services/${bookingId}/status/${encodeURIComponent(status)}`);
  const r = await fetch(url, { method: "PUT", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to update service booking: ${r.statusText}`);
  return r.json();
}

export async function getServiceBookingsByProviderId(serviceProviderId) {
  const url = buildApiUrl(`/v1/bookings/services/service-provider/${encodeURIComponent(serviceProviderId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch service bookings: ${r.statusText}`);
  return r.json();
}

export async function getServiceBookingsByOrganizerId(organizerId) {
  const url = buildApiUrl(`/v1/bookings/services/organizer/${encodeURIComponent(organizerId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch service bookings: ${r.statusText}`);
  return r.json();
}

/** -------------------- VENUE BOOKINGS -------------------- **/

export async function updateVenueBookingStatus(bookingId, status) {
  const url = buildApiUrl(`/v1/bookings/venues/${bookingId}/status/${encodeURIComponent(status)}`);
  const r = await fetch(url, { method: "PUT", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to update venue booking: ${r.statusText}`);
  return r.json();
}

export async function getVenueBookingsByProviderId(venueProviderId) {
  const url = buildApiUrl(`/v1/bookings/venues/venue-provider/${encodeURIComponent(venueProviderId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch venue bookings: ${r.statusText}`);
  return r.json();
}

export async function getVenueBookingsByOrganizerId(organizerId) {
  const url = buildApiUrl(`/v1/bookings/venues/organizer/${encodeURIComponent(organizerId)}`);
  const r = await fetch(url, { method: "GET", headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`Failed to fetch venue bookings: ${r.statusText}`);
  return r.json();
}

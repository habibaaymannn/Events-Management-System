/**
 * Create a new venue.
 * @param {object} venueData - Venue data to create.
 * @returns {Promise<object>} - Created venue object.
 */
export async function createVenue(venueData) {
  const url = "http://localhost:8080/v1/venues";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
    body: JSON.stringify(venueData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create venue: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get a single venue by ID.
 * @param {number|string} id - Venue ID.
 * @returns {Promise<object>} - Venue object.
 */
export async function getVenueById(id) {
  const url = `http://localhost:8080/v1/venues/${id}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
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
  const url = `http://localhost:8080/v1/venues/${id}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
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
  const url = `http://localhost:8080/v1/venues/${id}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete venue: ${response.statusText}`);
  }
}

/**
 * Get all venues for the venue provider.
 * @returns {Promise<Array>} - Array of venue objects.
 */
export async function getAllVenues() {
  const url = `http://localhost:8080/v1/venues`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch venues: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Cancel a booking as a venue provider.
 * @param {number|string} bookingId - Booking ID.
 * @returns {Promise<void>} - Resolves if successful.
 */
export async function cancelVenueBooking(bookingId) {
  const url = `http://localhost:8080/v1/venues/bookings/${bookingId}/cancel`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed:
      // "Authorization": `Bearer ${yourToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }
}

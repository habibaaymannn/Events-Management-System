export const initializeDummyUsers = () => {
  // Check if users already exist
  const existingUsers = localStorage.getItem("users");
  
  if (!existingUsers || JSON.parse(existingUsers).length < 5) {
    const dummyUsers = [
      {
        id: 1,
        email: "admin@demo.com",
        role: "ADMIN",
        status: "ACTIVE",
        createdDate: "2024-01-15",
        name: "System Administrator"
      },
      {
        id: 2,
        email: "organizer@demo.com",
        role: "EVENT_ORGANIZER",
        status: "ACTIVE",
        createdDate: "2024-02-01",
        name: "Event Organizer Demo"
      },
      {
        id: 3,
        email: "venue.provider@demo.com",
        role: "VENUE_PROVIDER",
        status: "ACTIVE",
        createdDate: "2024-02-05",
        name: "Venue Provider Demo"
      },
      {
        id: 4,
        email: "service.provider@demo.com",
        role: "SERVICE_PROVIDER",
        status: "ACTIVE",
        createdDate: "2024-02-10",
        name: "Service Provider Demo"
      },
      {
        id: 5,
        email: "attendee@demo.com",
        role: "ATTENDEE",
        status: "ACTIVE",
        createdDate: "2024-02-15",
        name: "Event Attendee Demo"
      }
    ];
    
    localStorage.setItem("users", JSON.stringify(dummyUsers));
    console.log("Dummy users initialized:", dummyUsers);
    return dummyUsers;
  }
  
  return JSON.parse(existingUsers);
};

export const initializeDummyEvents = () => {
  const existingEvents = localStorage.getItem("organizerEvents");
  
  if (!existingEvents || JSON.parse(existingEvents).length === 0) {
    const dummyEvents = [
      {
        id: 1,
        name: "Corporate Annual Meeting",
        type: "CONFERENCE",
        startTime: "2024-12-15T09:00",
        endTime: "2024-12-15T17:00",
        retailPrice: "500",
        status: "CONFIRMED",
        venueId: "1",
        serviceIds: ["1"],
        createdAt: "2024-12-01T10:00:00.000Z"
      },
      {
        id: 2,
        name: "Wedding Celebration",
        type: "WEDDING",
        startTime: "2024-12-20T14:00",
        endTime: "2024-12-20T23:00",
        retailPrice: "2500",
        status: "PLANNING",
        venueId: "2",
        serviceIds: ["2", "3"],
        createdAt: "2024-12-02T10:00:00.000Z"
      },
      {
        id: 3,
        name: "Birthday Party",
        type: "BIRTHDAY_PARTY",
        startTime: "2024-11-30T18:00",
        endTime: "2024-11-30T22:00",
        retailPrice: "300",
        status: "COMPLETED",
        venueId: "1",
        serviceIds: ["1"],
        createdAt: "2024-11-01T10:00:00.000Z"
      },
      {
        id: 4,
        name: "Product Launch Event",
        type: "PRODUCT_LAUNCH",
        startTime: "2024-12-25T10:00",
        endTime: "2024-12-25T16:00",
        retailPrice: "1500",
        status: "ONGOING",
        venueId: "",
        serviceIds: ["2"],
        createdAt: "2024-12-03T10:00:00.000Z"
      },
      {
        id: 5,
        name: "Cancelled Event",
        type: "CONFERENCE",
        startTime: "2024-12-10T09:00",
        endTime: "2024-12-10T17:00",
        retailPrice: "800",
        status: "CANCELLED",
        venueId: "1",
        serviceIds: ["1", "2"],
        createdAt: "2024-11-15T10:00:00.000Z"
      }
    ];
    
    localStorage.setItem("organizerEvents", JSON.stringify(dummyEvents));
    console.log("Dummy events initialized:", dummyEvents);
    return dummyEvents;
  }
  
  return JSON.parse(existingEvents);
};

export const initializeAllDummyData = () => {
  const users = initializeDummyUsers();
  const events = initializeDummyEvents();
  
  console.log("All dummy data initialized:");
  console.log("Users:", users);
  console.log("Events:", events);
  
  return { users, events };
};

export const resetAllDummyData = () => {
  // Clear existing data
  localStorage.removeItem("users");
  localStorage.removeItem("organizerEvents");
  
  // Initialize fresh data
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
  
  const dummyEvents = [
    {
      id: 1,
      name: "Corporate Annual Meeting",
      type: "CONFERENCE", 
      startTime: "2024-12-15T09:00",
      endTime: "2024-12-15T17:00",
      retailPrice: "500",
      status: "CONFIRMED"
    },
    {
      id: 2,
      name: "Wedding Celebration", 
      type: "WEDDING",
      startTime: "2024-12-20T14:00",
      endTime: "2024-12-20T23:00", 
      retailPrice: "2500",
      status: "PLANNING"
    },
    {
      id: 3,
      name: "Birthday Party",
      type: "BIRTHDAY_PARTY",
      startTime: "2024-11-30T18:00",
      endTime: "2024-11-30T22:00",
      retailPrice: "300", 
      status: "COMPLETED"
    },
    {
      id: 4,
      name: "Product Launch Event",
      type: "PRODUCT_LAUNCH",
      startTime: "2024-12-25T10:00",
      endTime: "2024-12-25T16:00",
      retailPrice: "1500",
      status: "ONGOING"
    },
    {
      id: 5,
      name: "Cancelled Conference",
      type: "CONFERENCE",
      startTime: "2024-12-10T09:00", 
      endTime: "2024-12-10T17:00",
      retailPrice: "800",
      status: "CANCELLED"
    }
  ];
  
  localStorage.setItem("users", JSON.stringify(dummyUsers));
  localStorage.setItem("organizerEvents", JSON.stringify(dummyEvents));
  
  console.log("All dummy data reset successfully!");
  console.log("Users:", dummyUsers);
  console.log("Events:", dummyEvents);
  
  // Refresh the page to reload data
  window.location.reload();
};

// Make it available globally for console access
window.resetAllDummyData = resetAllDummyData;

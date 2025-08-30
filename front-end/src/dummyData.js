// Venues
export const dummyVenues = [
  {
    id: 1,
    name: "Grand Ballroom",
    type: "VILLA",
    location: "Downtown City Center",
    capacity_minimum: 100,
    capacity_maximum: 500,
    images: [],
    price: 5000,
    priceType: "per event",
    availability: ["2024-07-10", "2024-07-15", "2024-07-20"],
    bookings: [
      { date: "2024-07-10", user: "TechCorp Inc." },
      { date: "2024-07-15", user: "Sarah & Mike" }
    ]
  },
  {
    id: 2,
    name: "Garden Pavilion",
    type: "CHALET",
    location: "Green Park",
    capacity_minimum: 50,
    capacity_maximum: 200,
    images: [],
    price: 2500,
    priceType: "per event",
    availability: ["2024-07-12", "2024-07-18"],
    bookings: []
  },
  {
    id: 3,
    name: "School Hall",
    type: "SCHOOL_HALL",
    location: "Sunrise School",
    capacity_minimum: 80,
    capacity_maximum: 300,
    images: [],
    price: 1800,
    priceType: "per event",
    availability: ["2024-07-14", "2024-07-21"],
    bookings: [{ date: "2024-07-14", user: "BusinessSolutions Ltd" }]
  }
];

// Services
export const dummyServices = [
  {
    id: 1,
    name: "Premium Catering",
    description: "CATERING_SERVICES",
    price: 1200,
    location: "Downtown City Center",
    availability: "AVAILABLE"
  },
  {
    id: 2,
    name: "Floral Decor",
    description: "DECOR_AND_STYLING",
    price: 800,
    location: "Green Park",
    availability: "AVAILABLE"
  },
  {
    id: 3,
    name: "AV Equipment Rental",
    description: "AUDIO_VISUAL_SERVICES",
    price: 1500,
    location: "Sunrise School",
    availability: "UNAVAILABLE"
  }
];

// Events
export const dummyEvents = [
  {
    id: 1,
    name: "Tech Conference 2024",
    description: "Annual technology conference for industry leaders.",
    type: "CONFERENCE",
    startTime: "2024-07-10T09:00",
    endTime: "2024-07-10T17:00",
    venue: "Grand Ballroom",
    status: "CONFIRMED",
    retailPrice: 8000,
    flagged: false,
    flagReason: "",
    bookings: []
  },
  {
    id: 2,
    name: "Wedding Reception",
    description: "Reception for Sarah & Mike.",
    type: "WEDDING",
    startTime: "2024-07-15T18:00",
    endTime: "2024-07-15T23:00",
    venue: "Grand Ballroom",
    status: "PLANNING",
    retailPrice: 10000,
    flagged: false,
    flagReason: "",
    bookings: []
  },
  {
    id: 3,
    name: "Corporate Meeting",
    description: "Quarterly business review.",
    type: "SEMINAR",
    startTime: "2024-07-14T10:00",
    endTime: "2024-07-14T16:00",
    venue: "School Hall",
    status: "DRAFT",
    retailPrice: 3000,
    flagged: false,
    flagReason: "",
    bookings: []
  }
];

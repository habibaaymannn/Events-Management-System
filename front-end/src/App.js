import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GlobalLogout from "./components/common/GlobalLogout";
import VenueProviderDashboard from "./components/venue-provider/VenueProviderDashboard";
import ServiceProviderDashboard from "./components/service-provider/ServiceProviderDashboard";
import EventOrganizerDashboard from "./components/event-organizer/EventOrganizerDashboard";
import EventAttendeeDashboard from "./components/event-attendee/EventAttendeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import SetAvailability from "./components/venue-provider/SetAvailability";
import BookVenue from "./components/venue-provider/BookVenue";
import VenueDetails from "./components/venue-provider/VenueDetails";
import ServiceDetails from "./components/service-provider/ServiceDetails";
import ProtectedRoute from "./auth/ProtectedRoute";
import Bookings from "./components/venue-provider/Bookings";
import "./App.css";
import ServiceBookings from "./components/service-provider/ServiceBookings";

function roleHome(roles = []) {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("organizer")) return "/organizer";
  if (roles.includes("service_provider")) return "/service-provider";
  if (roles.includes("venue_provider")) return "/venue-provider";
  if (roles.includes("attendee")) return "/attendee";
  return "/unauthorized";
}

function App() {
  const kc = window.keycloak;
  const roles = kc?.tokenParsed?.realm_access?.roles || [];

  return (
    <Router>
      {/* Fixed top-right logout button, shown only when authenticated */}
      <GlobalLogout />
      <Routes>
        {/* root → send to their dashboard */}
        <Route path="/" element={<Navigate to={roleHome(roles)} replace />} />

        {/* Admin (admins only) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Organizer */}
        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute allowedRoles={["organizer", "admin"]}>
              <EventOrganizerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Service Provider */}
        <Route
          path="/service-provider/*"
          element={
            <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          }
        />
          <Route
              path="/service/:id"
              element={
                  <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
                      <ServiceDetails />
                  </ProtectedRoute>
              }
          />
          <Route
              path="/service-bookings"
              element={
                  <ProtectedRoute allowedRoles={["service_provider", "admin"]}>
                      <ServiceBookings />
                  </ProtectedRoute>
              }
          />

          {/* Venue Provider */}
        <Route
          path="/venue-provider/*"
          element={
            <ProtectedRoute allowedRoles={["venue_provider", "admin"]}>
              <VenueProviderDashboard />
            </ProtectedRoute>
          }
        />
          <Route
              path="/venue/:id"
              element={
                  <ProtectedRoute allowedRoles={["venue_provider", "admin"]}>
                      <VenueDetails />
                  </ProtectedRoute>
              }
          />
          <Route
              path="/venue-bookings"
              element={
                  <ProtectedRoute allowedRoles={["venue_provider", "admin"]}>
                      <Bookings />
                  </ProtectedRoute>
              }
          />


          {/* Attendee */}
        <Route
          path="/attendee/*"
          element={
            <ProtectedRoute allowedRoles={["attendee"]}>
              <EventAttendeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import VenueProviderDashboard from "./components/venue-provider/VenueProviderDashboard";
import ServiceProviderDashboard from "./components/service-provider/ServiceProviderDashboard";
import EventOrganizerDashboard from "./components/event-organizer/EventOrganizerDashboard";
import EventAttendeeDashboard from "./components/event-attendee/EventAttendeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import SetAvailability from "./components/venue-provider/SetAvailability";
import BookVenue from "./components/venue-provider/BookVenue";
import VenueDetails from "./components/venue-provider/VenueDetails";
import ProtectedRoute from "./auth/ProtectedRoute";
import "./App.css";

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

        {/* Venue Provider */}
        <Route
          path="/venue-provider/*"
          element={
            <ProtectedRoute allowedRoles={["venue_provider", "admin"]}>
              <VenueProviderDashboard />
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
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

function App() {
  const kc = window.keycloak;
  const roles = kc?.tokenParsed?.realm_access?.roles || [];

  const defaultDashboard = (() => {
    if (roles.includes("admin")) return "/admin";
    if (roles.includes("venue_provider")) return "/venue";
    if (roles.includes("service_provider")) return "/service";
    if (roles.includes("organizer")) return "/organizer";
    if (roles.includes("attendee")) return "/attendee";
    return "/unauthorized";
  })();

  return (
    <Router>
      <Routes>
        {/* Default route: send user to their role dashboard */}
        <Route path="/" element={<Navigate to={defaultDashboard} replace />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/venue/*"
          element={
            <ProtectedRoute allowedRoles={["venue_provider"]}>
              <VenueProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue/availability"
          element={
            <ProtectedRoute allowedRoles={["venue_provider"]}>
              <SetAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue/book"
          element={
            <ProtectedRoute allowedRoles={["venue_provider"]}>
              <BookVenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue/details"
          element={
            <ProtectedRoute allowedRoles={["venue_provider"]}>
              <VenueDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/service/*"
          element={
            <ProtectedRoute allowedRoles={["service_provider"]}>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EventOrganizerDashboard />
            </ProtectedRoute>
          }
        />

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

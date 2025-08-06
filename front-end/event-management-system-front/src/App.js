import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VenueProviderDashboard from "./components/VenueProviderDashboard";
import ServiceProviderDashboard from "./components/ServiceProviderDashboard";
import EventOrganizerDashboard from "./components/EventOrganizerDashboard";
import EventAttendeeDashboard from "./components/EventAttendeeDashboard";
import AdminDashboard from "./components/AdminDashboard";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/venue-provider">Venue Provider</Link></li>
            <li><Link to="/service-provider">Service Provider</Link></li>
            <li><Link to="/event-organizer">Event Organizer</Link></li>
            <li><Link to="/event-attendee">Event Attendee</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/venue-provider" element={<VenueProviderDashboard />} />
          <Route path="/service-provider" element={<ServiceProviderDashboard />} />
          <Route path="/event-organizer" element={<EventOrganizerDashboard />} />
          <Route path="/event-attendee" element={<EventAttendeeDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

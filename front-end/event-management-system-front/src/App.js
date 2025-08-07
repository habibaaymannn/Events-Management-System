import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import VenueProviderDashboard from "./components/venue-provider/VenueProviderDashboard";
import ServiceProviderDashboard from "./components/service-provider/ServiceProviderDashboard";
import EventOrganizerDashboard from "./components/event-organizer/EventOrganizerDashboard";
import EventAttendeeDashboard from "./components/event-attendee/EventAttendeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
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
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

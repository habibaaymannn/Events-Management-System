import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from "./components/auth/AuthPage";
import VenueProviderDashboard from "./components/venue-provider/VenueProviderDashboard";
import ServiceProviderDashboard from "./components/service-provider/ServiceProviderDashboard";
import EventOrganizerDashboard from "./components/event-organizer/EventOrganizerDashboard";
import EventAttendeeDashboard from "./components/event-attendee/EventAttendeeDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import SetAvailability from "./components/venue-provider/SetAvailability";
import BookVenue from "./components/venue-provider/BookVenue";
import VenueDetails from "./components/venue-provider/VenueDetails";
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  if (!user) {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route path="/*" element={<AuthPage setUser={setUser} />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* User Header */}
        <header style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          padding: '1rem 2rem',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
        }}>
          <div>
            <h3 style={{ margin: 0 }}>Event Management System</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
              Welcome, {user.email} ({user.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}
          >
            Logout
          </button>
        </header>

        <Routes>
          {user.role === 'venue-provider' && (
            <>
              <Route path="/*" element={<VenueProviderDashboard />} />
              <Route path="/venue/:id/availability" element={<SetAvailability />} />
              <Route path="/venue/:id/book" element={<BookVenue />} />
              <Route path="/venue/:id/details" element={<VenueDetails />} />
            </>
          )}
          {user.role === 'service-provider' && (
            <Route path="/*" element={<ServiceProviderDashboard />} />
          )}
          {user.role === 'event-organizer' && (
            <Route path="/*" element={<EventOrganizerDashboard />} />
          )}
          {user.role === 'event-attendee' && (
            <Route path="/*" element={<EventAttendeeDashboard />} />
          )}
          {user.role === 'admin' && (
            <Route path="/*" element={<AdminDashboard />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

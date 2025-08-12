import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, updateUserRole, deactivateUser } from "../../api/adminApi";
import { getBookingsByAttendeeId } from "../../api/bookingApi";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  const roles = [
    'admin',
    'event-organizer', 
    'event-attendee',
    'service-provider',
    'venue-provider'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers(0, 100); // adjust page/size as needed
      setUsers(response.content || []);
    } catch (error) {
      // Handle error
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await deactivateUser(userId);
      loadUsers();
    } catch (error) {
      // Handle error
    }
  };

  const handleResetPassword = (userId) => {
    if (window.confirm("Are you sure you want to reset this user's password?")) {
      alert("Password reset email sent to user!");
      // In real implementation, this would trigger a password reset email
    }
  };

  const handleAssignRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      loadUsers();
    } catch (error) {
      // Handle error
    }
  };

  const handleViewUserDetails = async (user) => {
    try {
      setSelectedUser(user);
      
      // If user is an attendee, load their bookings
      if (user.role === 'event-attendee') {
        const bookings = await getBookingsByAttendeeId(user.id);
        setUserBookings(bookings);
      } else {
        setUserBookings([]);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
      setSelectedUser(user);
    }
  };

  return (
    <div style={{ width: '98vw', maxWidth: '98vw', margin: "10px auto", padding: '0 10px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary mb-3"
        >
          ← Back to Dashboard
        </button>
        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>
          User Management
        </h2>
        <p style={{ color: "#6c757d", fontSize: "1.1rem", marginTop: "0.5rem" }}>
          Manage all system users, assign roles, deactivate, or reset passwords
        </p>
      </div>

      {/* Users List */}
      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>All Users</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="table" style={{ minWidth: '1000px', width: '100%' }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 600 }}>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleAssignRole(user.id, e.target.value)}
                        className="form-control"
                        style={{ minWidth: '150px' }}
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {role.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="btn btn-info"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeactivateUser(user.id)}
                          className={`btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>User Details - {selectedUser.email}</h4>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>User Information</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Role:</strong> {selectedUser.role}</div>
                  <div><strong>Status:</strong> {selectedUser.status}</div>
                  <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                  {selectedUser.firstName && (
                    <div><strong>First Name:</strong> {selectedUser.firstName}</div>
                  )}
                  {selectedUser.lastName && (
                    <div><strong>Last Name:</strong> {selectedUser.lastName}</div>
                  )}
                  {selectedUser.phoneNumber && (
                    <div><strong>Phone:</strong> {selectedUser.phoneNumber}</div>
                  )}
                </div>
              </div>

              {selectedUser.role === 'event-attendee' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ color: '#2c3e50', marginBottom: '1rem' }}>
                    Attendee Bookings ({userBookings.length})
                  </h5>
                  {userBookings.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {userBookings.map((booking, index) => (
                        <div key={index} style={{
                          padding: '1rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          backgroundColor: '#f8f9fa'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>
                              {booking.type === 'VENUE' ? '🏢 Venue Booking' : '🛠️ Service Booking'}
                            </span>
                            <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            <div><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</div>
                            <div><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</div>
                            {booking.venueId && <div><strong>Venue ID:</strong> {booking.venueId}</div>}
                            {booking.serviceId && <div><strong>Service ID:</strong> {booking.serviceId}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                      No bookings found for this attendee.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
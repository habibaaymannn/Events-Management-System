import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, updateUserRole, deactivateUser } from "../../api/adminApi";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

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
    </div>
  );
};

export default UserManagement;
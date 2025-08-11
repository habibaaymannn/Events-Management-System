import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    password: "",
    status: "active"
  });

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

  const loadUsers = () => {
    // Load from localStorage or create initial admin user
    const storedUsers = localStorage.getItem("systemUsers");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const initialUsers = [
        {
          id: 1,
          email: "admin@demo.com",
          role: "admin",
          status: "active",
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(initialUsers);
      localStorage.setItem("systemUsers", JSON.stringify(initialUsers));
    }
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem("systemUsers", JSON.stringify(updatedUsers));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      email: formData.email,
      role: formData.role,
      status: formData.status,
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    setFormData({ email: "", role: "", password: "", status: "active" });
    setShowAddUser(false);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, email: formData.email, role: formData.role, status: formData.status }
        : user
    );
    saveUsers(updatedUsers);
    
    setEditingUser(null);
    setFormData({ email: "", role: "", password: "", status: "active" });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      password: "",
      status: user.status
    });
  };

  const handleDeactivateUser = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'deactivated' : 'active' }
        : user
    );
    saveUsers(updatedUsers);
  };

  const handleResetPassword = (userId) => {
    if (window.confirm("Are you sure you want to reset this user's password?")) {
      alert("Password reset email sent to user!");
      // In real implementation, this would trigger a password reset email
    }
  };

  const handleAssignRole = (userId, newRole) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    );
    saveUsers(updatedUsers);
  };

  const getUserStats = () => {
    const stats = {
      admins: users.filter(u => u.role === 'admin').length,
      eventOrganizers: users.filter(u => u.role === 'event-organizer').length,
      eventAttendees: users.filter(u => u.role === 'event-attendee').length,
      serviceProviders: users.filter(u => u.role === 'service-provider').length,
      venueProviders: users.filter(u => u.role === 'venue-provider').length,
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      deactivated: users.filter(u => u.status === 'deactivated').length
    };
    return stats;
  };

  const stats = getUserStats();

  return (
    <div className="admin-page">
      <div className="page-header">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary" 
          style={{ position: 'absolute', left: '2rem', top: '2rem' }}
        >
          ← Back to Dashboard
        </button>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage all system users, roles, and permissions</p>
      </div>

      {/* User Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card text-center">
          <h3 className="text-primary">{stats.total}</h3>
          <p className="text-muted">Total Users</p>
        </div>
        <div className="card text-center">
          <h3 className="text-success">{stats.active}</h3>
          <p className="text-muted">Active Users</p>
        </div>
        <div className="card text-center">
          <h3 className="text-danger">{stats.deactivated}</h3>
          <p className="text-muted">Deactivated Users</p>
        </div>
        <div className="card text-center">
          <h3 className="text-warning">{stats.admins}</h3>
          <p className="text-muted">Administrators</p>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="card mb-4">
        <h4 className="mb-3">User Breakdown by Role</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div className="status-badge status-pending">
            Admins: {stats.admins}
          </div>
          <div className="status-badge status-confirmed">
            Event Organizers: {stats.eventOrganizers}
          </div>
          <div className="status-badge status-completed">
            Event Attendees: {stats.eventAttendees}
          </div>
          <div className="status-badge status-cancelled">
            Service Providers: {stats.serviceProviders}
          </div>
          <div className="status-badge status-pending">
            Venue Providers: {stats.venueProviders}
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <button
        onClick={() => setShowAddUser(!showAddUser)}
        className="btn btn-primary"
        style={{ marginBottom: 24 }}
      >
        {showAddUser ? "Cancel" : "Create New User"}
      </button>

      {/* Add/Edit User Form */}
      {(showAddUser || editingUser) && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
            {editingUser ? "Edit User" : "Create New User"}
          </h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
            <div className="form-group">
              <input
                required
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-control"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            {!editingUser && (
              <div className="form-group">
                <input
                  required={!editingUser}
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-control"
                />
              </div>
            )}
            <div className="form-group">
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-control"
              >
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">
                {editingUser ? "Update User" : "Create User"}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddUser(false);
                  setEditingUser(null);
                  setFormData({ email: "", role: "", password: "", status: "active" });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="card" style={{ width: '100%', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>All Users</h3>
        <div style={{ overflowX: "auto", width: '100%' }}>
          <table className="admin-table" style={{ minWidth: '1000px', width: '100%' }}>
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
                          onClick={() => handleEditUser(user)}
                          className="btn btn-warning"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Edit
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
    </div>
  );
};

export default UserManagement;
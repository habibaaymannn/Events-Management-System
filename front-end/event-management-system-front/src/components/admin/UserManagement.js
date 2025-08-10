import React, { useState } from "react";

const initialUsers = [
  { id: 1, name: "Alice", role: "Organizer", status: "Active" },
  { id: 2, name: "Bob", role: "Attendee", status: "Active" },
  { id: 3, name: "Charlie", role: "Service Provider", status: "Inactive" },
];

const roles = ["Admin", "Organizer", "Attendee", "Service Provider", "Venue Provider"];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = (id, role) => {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  const handleDeactivate = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "Inactive" } : u));
  };

  const handleActivate = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "Active" } : u));
  };

  const handleResetPassword = (id) => {
    alert("Password reset link sent to user ID: " + id);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h3 className="page-title">User Management</h3>
        <p className="page-subtitle">Manage user roles, permissions, and account status</p>
      </div>

      <div className="admin-section">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>{u.status}</td>
                <td>
                  {u.status === "Active" ? (
                    <>
                      <button onClick={() => handleDeactivate(u.id)}>
                        Deactivate
                      </button>
                      <button onClick={() => handleResetPassword(u.id)}>
                        Reset Password
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleActivate(u.id)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
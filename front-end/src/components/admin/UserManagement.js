import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  createUser,
  resetUserPassword,
  activateUser,
  deleteUser,
} from "../../api/adminApi";
import { getBookingsByAttendeeId } from "../../api/bookingApi";
import "./user-management.overrides.css";

const UserManagement = () => {
  const navigate = useNavigate();
  // Track per-user reset results (so each row can show its own banner)
  const [resetResults, setResetResults] = useState({}); 
  // shape: { [userId]: { emailSent: boolean, forgotPasswordEntryUrl: string, accountUrl: string } }
  const [resetLoading, setResetLoading] = useState({});

  // Lists / selection
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  // Create user modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "attendee",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete flow
  const [deleteFlow, setDeleteFlow] = useState({
    open: false,
    step: "confirm", // 'confirm' | 'notify' | 'reason'
    user: null,
    notify: false,
    reason: "Violation of terms of service.",
  });

  const startDeleteFlow = (user) =>
    setDeleteFlow({
      open: true,
      step: "confirm",
      user,
      notify: false,
      reason: "Violation of terms of service.",
    });

  const closeDeleteFlow = () => setDeleteFlow((df) => ({ ...df, open: false }));
  const proceedFromConfirm = () =>
    setDeleteFlow((df) => ({ ...df, step: "notify" }));

  const chooseNotify = (notify) => {
    if (!notify) performDelete(false, "");
    else setDeleteFlow((df) => ({ ...df, notify: true, step: "reason" }));
  };

  const performDelete = async (notify, reason) => {
    try {
      await deleteUser(deleteFlow.user.id, { notify, reason });
      setUsers((prev) => prev.filter((u) => u.id !== deleteFlow.user.id));
      closeDeleteFlow();
      showToast(
        `Deleted ${deleteFlow.user.email || deleteFlow.user.username}${
          notify ? " (user notified)" : ""
        }`,
        "success"
      );
    } catch (e) {
      showToast(e.message || "Failed to delete user.", "error");
    }
  };


const deriveRole = (u) => {
  // 1) explicit field from backend (normalize case)
  if (u.role && typeof u.role === "string") return u.role.toLowerCase();

  // 2) our custom KC attribute
  const attr = u.attributes?.userType?.[0];
  if (attr) return String(attr).toLowerCase();

  // 3) fallback: infer from realm roles if backend returns them
  const rr = (u.realmRoles || u.roles || u.roleMappings || []).map((r) => String(r).toLowerCase());
  if (rr.includes("admin")) return "admin";
  if (rr.includes("organizer")) return "organizer";
  if (rr.includes("service_provider")) return "service_provider";
  if (rr.includes("venue_provider")) return "venue_provider";

  // default
  return "attendee";
};

  // Roles
  const roles = [
    { value: "admin", label: "Admin" },
    { value: "organizer", label: "Event Organizer" },
    { value: "attendee", label: "Event Attendee" },
    { value: "service_provider", label: "Service Provider" },
    { value: "venue_provider", label: "Venue Provider" },
  ];

  // Helpers
  const mapFrontendRoleToBackend = (frontendRole) => {
    const map = {
      admin: "admin",
      organizer: "organizer",
      attendee: "attendee",
      service_provider: "service_provider",
      venue_provider: "venue_provider",
    };
    return map[frontendRole] || "attendee";
  };

  const mapBackendRoleToFrontendSelect = (backendRole) => {
    const r = String(backendRole || "").toLowerCase();
    const map = {
      admin: "admin",
      organizer: "organizer",
      attendee: "attendee",
      service_provider: "service_provider",
      venue_provider: "venue_provider",
    };
    return map[r] || "attendee";
  };
  

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers(0, 100);
      const normalized = (response.content || []).map((u) => ({
        ...u,
         role: deriveRole(u),
      }));
      setUsers(normalized);
    } catch {
      /* no-op */
    }
  };

  // Actions
  const handleAssignRole = async (userId, newRole) => {
    try {
      const backendRole = mapFrontendRoleToBackend(newRole);
      const data = await updateUserRole(userId, backendRole);
      const confirmedRole =
        data?.role || data?.attributes?.userType?.[0] || backendRole;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: confirmedRole,
                attributes: {
                  ...(u.attributes || {}),
                  userType: [confirmedRole],
                },
              }
            : u
        )
      );
    } catch (err) {
      console.error("Error updating user role:", err);
      showToast("Failed to update role", "error");
    }
  };




  const handleSendReset = async (userId, email) => {
  try {
    setResetLoading((m) => ({ ...m, [userId]: true }));
    const res = await resetUserPassword(userId);
    setResetResults((m) => ({ ...m, [userId]: res }));
    // UX: quick confirmation
    const msg = res?.emailSent 
      ? `Password reset email was sent to ${email}.`
      : `Tried to send reset email to ${email}. If it didn’t arrive, use the links shown.`;
    // If you have a toast system, use it instead:
    // toast.success(msg)
    alert(msg);
  } catch (e) {
    console.error(e);
    alert(e.message || "Failed to send reset email");
  } finally {
    setResetLoading((m) => ({ ...m, [userId]: false }));
  }
};

  const handleDeactivateUser = async (userId) => {
    try {
      await deactivateUser(userId);
      loadUsers();
    } catch {
      showToast("Failed to deactivate user", "error");
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId);
      loadUsers();
    } catch {
      showToast("Failed to activate user", "error");
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("Send password reset email to this user?")) return;
    try {
      const res = await resetUserPassword(userId);
      const msg = [
        "✅ Reset email sent via Keycloak.",
        "",
        "If the user can’t find the email, share this link so they can trigger reset from the login screen:",
        res.forgotPasswordEntryUrl,
        "",
        "They can also manage their account here:",
        res.accountUrl,
      ].join("\n");
      window.prompt("Copy this info (Ctrl+C):", msg);
    } catch (e) {
      alert(e.message || "Failed to send reset email");
    }
  };

  const validate = () => {
    const e = {};
    if (!createFormData.firstName.trim()) e.firstName = "Required";
    if (!createFormData.lastName.trim()) e.lastName = "Required";
    if (!createFormData.username.trim()) e.username = "Required";
    if (!createFormData.email.trim()) e.email = "Required";
    if (!createFormData.password || createFormData.password.length < 8)
      e.password = "Min 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateUser = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setCreateLoading(true);
    setCreateError("");
    try {
      const backendRole = mapFrontendRoleToBackend(createFormData.role);
      const payload = { ...createFormData, role: backendRole };
      await createUser(payload);

      setShowCreateForm(false);
      setCreateFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "attendee",
        username: "",
        password: "",
      });
      loadUsers();
      showToast("User created successfully!", "success");
    } catch (err) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateFormChange = (e) => {
    setCreateFormData((d) => ({ ...d, [e.target.name]: e.target.value }));
    setCreateError("");
  };

  const handleViewUserDetails = async (user) => {
    try {
      setSelectedUser(user);
      if (user.role === "attendee") {
        const bookings = await getBookingsByAttendeeId(user.id);
        setUserBookings(bookings || []);
      } else {
        setUserBookings([]);
      }
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setUserBookings([]);
    }
  };

  // Render
  return (
    <div style={{ width: "98vw", maxWidth: "98vw", margin: "10px auto", padding: "0 10px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => navigate("/")} className="btn btn-secondary mb-3">
          ← Back to Dashboard
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ margin: 0, color: "#2c3e50", fontSize: "2.5rem", fontWeight: 700 }}>User Management</h2>
            <p style={{ color: "#6c757d", fontSize: "1.1rem", marginTop: "0.5rem" }}>
              Manage all system users, assign roles, deactivate, or reset passwords
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
            style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
          >
            + Create New User
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Create New User</h4>
              <button className="modal-close" onClick={() => setShowCreateForm(false)}>×</button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: "1.5rem" }}>
              {createError && (
                <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "0.75rem", borderRadius: 4, marginBottom: "1rem" }}>
                  {createError}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={createFormData.firstName}
                    onChange={handleCreateFormChange}
                    className="form-control"
                    required
                  />
                  {errors.firstName && <small className="err">{errors.firstName}</small>}
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={createFormData.lastName}
                    onChange={handleCreateFormChange}
                    className="form-control"
                    required
                  />
                  {errors.lastName && <small className="err">{errors.lastName}</small>}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateFormChange}
                  className="form-control"
                  required
                />
                {errors.email && <small className="err">{errors.email}</small>}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="label">Role *</label>
                <select
                  name="role"
                  value={createFormData.role}
                  onChange={handleCreateFormChange}
                  className="form-control"
                  required
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label className="label">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={createFormData.username}
                    onChange={handleCreateFormChange}
                    className="form-control"
                    required
                    autoComplete="username"
                  />
                  {errors.username && <small className="err">{errors.username}</small>}
                </div>
                <div>
                  <label className="label">Password *</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={createFormData.password}
                      onChange={handleCreateFormChange}
                      className="form-control"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="btn btn-outline-secondary"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <small className="err">{errors.password}</small>}
                  <small style={{ display: "block", color: "#6c757d", marginTop: 4 }}>
                    Minimum 8 characters.
                  </small>
                </div>
              </div>

              <div className="note-info" style={{ marginBottom: "1.5rem" }}>
                <strong>Note:</strong> We now collect a real password and send it to the backend.
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} className="btn btn-primary">
                  {createLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="card" style={{ width: "100%", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>All Users</h3>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="table" style={{ minWidth: "1000px", width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
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
                  <td colSpan="6" style={{ textAlign: "center", color: "#6c757d", padding: "2rem" }}>
                    No users found. Create some users to get started!
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={mapBackendRoleToFrontendSelect(user.role)}
                          onChange={(e) => handleAssignRole(user.id, e.target.value)}
                          className="form-control"
                          style={{ minWidth: "150px" }}
                        >
                          {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            user.enabled !== false ? "status-confirmed" : "status-cancelled"
                          }`}
                        >
                          {user.enabled !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleViewUserDetails(user)}
                            className="btn btn-info"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            View Details
                          </button>

                          <button
                            onClick={() =>
                              user.enabled !== false ? handleDeactivateUser(user.id) : handleActivateUser(user.id)
                            }
                            className={`btn ${user.enabled !== false ? "btn-dark-orange" : "btn-success"}`}
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            {user.enabled !== false ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            className="btn btn-sm"
                            onClick={() => handleSendReset(user.id, user.email)}
                            disabled={!!resetLoading[user.id]}
                            title="Send a reset-password email"
                            style={{
                              background: "#712C81",
                              color: "white",
                              borderRadius: 8,
                              padding: "6px 10px",
                              opacity: resetLoading[user.id] ? 0.6 : 1,
                              cursor: resetLoading[user.id] ? "not-allowed" : "pointer",
                            }}
                          >
                            {resetLoading[user.id] ? "Sending..." : "Send reset email"}
                          </button>

                          <button
                            onClick={() => startDeleteFlow(user)}
                            className="btn btn-glow-danger"
                            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {resetResults[user.id] && (
                      <tr>
                        <td colSpan={6}>
                          <div
                            style={{
                              marginTop: 8,
                              padding: 10,
                              borderRadius: 10,
                              background: "rgba(113,44,129,0.08)",
                              border: "1px solid rgba(113,44,129,0.25)",
                            }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                              {resetResults[user.id].emailSent
                                ? "Reset email sent successfully."
                                : "Reset email may not have been sent. You can still share these links:"}
                            </div>
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                              {!!resetResults[user.id].forgotPasswordEntryUrl && (
                                <a
                                  href={resetResults[user.id].forgotPasswordEntryUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ textDecoration: "underline", color: "#712C81" }}
                                >
                                  Forgot Password entry (public)
                                </a>
                              )}
                              {!!resetResults[user.id].accountUrl && (
                                <a
                                  href={resetResults[user.id].accountUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ textDecoration: "underline", color: "#712C81" }}
                                >
                                  Account Console
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h5 style={{ color: "#2c3e50", marginBottom: "1rem" }}>User Information</h5>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Role:</strong> {selectedUser.role}</div>
                  <div><strong>Status:</strong> {selectedUser.enabled !== false ? "Active" : "Inactive"}</div>
                  <div><strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</div>
                  {selectedUser.firstName && <div><strong>First Name:</strong> {selectedUser.firstName}</div>}
                  {selectedUser.lastName && <div><strong>Last Name:</strong> {selectedUser.lastName}</div>}
                  {selectedUser.phoneNumber && <div><strong>Phone:</strong> {selectedUser.phoneNumber}</div>}
                </div>
              </div>

              {selectedUser.role === "attendee" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h5 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
                    Attendee Bookings ({userBookings.length})
                  </h5>
                  {userBookings.length > 0 ? (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {userBookings.map((booking, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "1rem",
                            marginBottom: "0.5rem",
                            border: "1px solid #e9ecef",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <span style={{ fontWeight: "bold" }}>
                              {booking.type === "VENUE" ? "🏢 Venue Booking" : "🛠️ Service Booking"}
                            </span>
                            <span className={`status-badge status-${String(booking.status || "").toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                            <div><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</div>
                            <div><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</div>
                            {booking.venueId && <div><strong>Venue ID:</strong> {booking.venueId}</div>}
                            {booking.serviceId && <div><strong>Service ID:</strong> {booking.serviceId}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#6c757d", fontStyle: "italic" }}>
                      No bookings found for this attendee.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Delete Flow Modal */}
      {deleteFlow.open && (
        <div className="modal-overlay" onClick={closeDeleteFlow}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {deleteFlow.step === "confirm" && (
              <>
                <div className="modal-header">
                  <h4>Delete User</h4>
                  <button className="modal-close" onClick={closeDeleteFlow}>×</button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <p>
                    Are you sure you want to permanently delete{" "}
                    <strong>{deleteFlow.user?.email || deleteFlow.user?.username || "this user"}</strong>?
                  </p>
                  <div className="delete-flow-actions">
                    <button className="btn btn-secondary" onClick={closeDeleteFlow}>No</button>
                    <button className="btn btn-glow-danger" onClick={proceedFromConfirm}>Yes, delete</button>
                  </div>
                </div>
              </>
            )}

            {deleteFlow.step === "notify" && (
              <>
                <div className="modal-header">
                  <h4>Notify the user?</h4>
                  <button className="modal-close" onClick={closeDeleteFlow}>×</button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <p>Would you like to send an email informing the user that their account was terminated?</p>
                  <div className="delete-flow-actions">
                    <button className="btn btn-secondary" onClick={closeDeleteFlow}>Cancel</button>
                    <button className="btn btn-outline-secondary" onClick={() => chooseNotify(false)}>Don’t notify</button>
                    <button className="btn btn-primary" onClick={() => chooseNotify(true)}>Notify</button>
                  </div>
                </div>
              </>
            )}

            {deleteFlow.step === "reason" && (
              <>
                <div className="modal-header">
                  <h4>Reason (optional)</h4>
                  <button className="modal-close" onClick={closeDeleteFlow}>×</button>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <p style={{ marginBottom: 8 }}>
                    Enter a reason to include in the email. A default is provided:
                  </p>
                  <textarea
                    className="delete-flow-textarea"
                    value={deleteFlow.reason}
                    onChange={(e) => setDeleteFlow((df) => ({ ...df, reason: e.target.value }))}
                    placeholder="e.g. Violation of terms of service."
                  />
                  <div className="delete-flow-actions">
                    <button className="btn btn-secondary" onClick={closeDeleteFlow}>Cancel</button>
                    <button className="btn btn-outline-secondary" onClick={() => performDelete(true, "")}>
                      Skip reason &amp; delete
                    </button>
                    <button className="btn btn-glow-danger" onClick={() => performDelete(true, deleteFlow.reason || "")}>
                      Send &amp; delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

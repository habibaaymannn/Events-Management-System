import React, { useState } from 'react';
import { getAllUsers } from '../../api/adminApi';
import './AuthPage.css';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'event-attendee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'attendee', label: 'Event Attendee', description: 'Browse and join events' },
    { value: 'organizer', label: 'Event Organizer', description: 'Create and manage events' },
    { value: 'venue_provider', label: 'Venue Provider', description: 'Manage venues for events' }, // Fixed
    { value: 'service_provider', label: 'Service Provider', description: 'Provide event services' }, // Fixed
    { value: 'admin', label: 'System Admin', description: 'System administration' }
  ];

  
  const mapBackendRoleToFrontend = (backendRole) => {
    const roleMapping = {
      'admin': 'admin',
      'organizer': 'event-organizer',
      'attendee': 'event-attendee',
      'service_provider': 'service-provider',
      'venue_provider': 'venue-provider'
    };
    return roleMapping[backendRole] || 'event-attendee';
  };

  
  const mapRegistrationRoleToFrontend = (regRole) => {
    const roleMapping = {
      'attendee': 'event-attendee',
      'organizer': 'event-organizer',
      'venue_provider': 'venue-provider',
      'service_provider': 'service-provider',
      'admin': 'admin'
    };
    return roleMapping[regRole] || 'event-attendee';
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        // First check if user exists in backend via getAllUsers endpoint
        try {
          const response = await getAllUsers(0, 1000); // Get large page to find user
          const backendUsers = response.content || [];
          
          // Find user by email in backend
          const backendUser = backendUsers.find(u => u.email === formData.email);
          
          if (backendUser) {
            // For backend users, we'll use a simple password check (in production, this would be proper authentication)
            // For now, assume password is 'password123' for all backend users
            if (formData.password === 'password123') {
              console.log("Backend user found:", backendUser);
              const frontendRole = mapBackendRoleToFrontend(backendUser.role);
              setUser({
                id: backendUser.id,
                email: backendUser.email,
                role: frontendRole,
                firstName: backendUser.firstName,
                lastName: backendUser.lastName,
                userType: frontendRole // Ensure userType is set
              });
              return;
            }
          }
        } catch (error) {
          console.log("Backend check failed, falling back to local users:", error);
        }

        // Then check created users in localStorage
        const createdUsers = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        const createdUser = createdUsers.find(u => u.email === formData.email && u.password === formData.password);
        
        if (createdUser) {
          console.log("Created user found:", createdUser);
          setUser({
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            userType: createdUser.role // Ensure userType is set
          });
          return;
        }

        // Then check demo credentials
        const demoCredentials = [
          { email: 'admin@demo.com', password: 'admin123', role: 'admin' },
          { email: 'venue@demo.com', password: 'venue123', role: 'venue-provider' },
          { email: 'service@demo.com', password: 'service123', role: 'service-provider' },
          { email: 'organizer@demo.com', password: 'organizer123', role: 'event-organizer' },
          { email: 'attendee@demo.com', password: 'attendee123', role: 'event-attendee' }
        ];

        const demoUser = demoCredentials.find(u => u.email === formData.email && u.password === formData.password);
        
        if (demoUser) {
          console.log("Demo user found:", demoUser);
          setUser({
            id: Date.now(),
            email: demoUser.email,
            role: demoUser.role,
            userType: demoUser.role // Ensure userType is set
          });
          return;
        }

        // Finally check registered users (local registration)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          console.log("Registered user found:", user);
          setUser({
            id: user.id,
            email: user.email,
            role: user.role,
            userType: user.role // Ensure userType is set
          });
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Handle Registration
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === formData.email)) {
          setError('User with this email already exists');
          return;
        }

        // Create new user with frontend role format
        const frontendRole = mapRegistrationRoleToFrontend(formData.role);
        const newUser = {
          id: Date.now(),
          email: formData.email,
          password: formData.password,
          role: frontendRole, // Use frontend role format
          userType: frontendRole, // Ensure userType is set
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login after registration
        setUser({
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          userType: newUser.role // Ensure userType is set
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-logo">Event Management System</h1>
            <p className="auth-tagline">Your complete event management solution</p>
          </div>

          <div className="auth-form-container">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFormData({ ...formData, confirmPassword: '' });
                }}
              >
                Login
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Your Role</label>
                    <div className="role-selection">
                      {roles.map(role => (
                        <label key={role.value} className="role-option">
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={handleInputChange}
                          />
                          <div className="role-content">
                            <div className="role-title">{role.label}</div>
                            <div className="role-description">{role.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner">⏳</span>
                ) : (
                  isLogin ? 'Login' : 'Register'
                )}
              </button>
            </form>

            {isLogin && (
              <div className="auth-demo">
                <p className="demo-title">Demo Accounts (Email / Password):</p>
                <div className="demo-accounts">
                  <div className="demo-grid">
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => setFormData({ 
                        ...formData, 
                        email: 'admin@demo.com', 
                        password: 'admin123' 
                      })}
                    >
                      Admin
                      <span>admin@demo.com / admin123</span>
                    </button>
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => setFormData({ 
                        ...formData, 
                        email: 'venue@demo.com', 
                        password: 'venue123' 
                      })}
                    >
                      Venue Provider
                      <span>venue@demo.com / venue123</span>
                    </button>
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => setFormData({ 
                        ...formData, 
                        email: 'service@demo.com', 
                        password: 'service123' 
                      })}
                    >
                      Service Provider
                      <span>service@demo.com / service123</span>
                    </button>
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => setFormData({ 
                        ...formData, 
                        email: 'organizer@demo.com', 
                        password: 'organizer123' 
                      })}
                    >
                      Event Organizer
                      <span>organizer@demo.com / organizer123</span>
                    </button>
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => setFormData({ 
                        ...formData, 
                        email: 'attendee@demo.com', 
                        password: 'attendee123' 
                      })}
                    >
                      Event Attendee
                      <span>attendee@demo.com / attendee123</span>
                    </button>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6c757d', textAlign: 'center' }}>
                    <strong>Backend users: Use password "password123"</strong>
                    <br />
                    <strong>Or use created users with their assigned passwords</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

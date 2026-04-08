import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { authAPI, adminAPI, apiUtils } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      let response;

      if (isAdminLogin) {
        // Try admin login first
        response = await adminAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Regular user login
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      }

      if (response.data.user && response.data.token) {
        // Store user data and authentication token in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userName', response.data.user.first_name || response.data.user.username);
        localStorage.setItem('authToken', response.data.token);

        console.log('Login successful:', {
          user: response.data.user,
          token: response.data.token ? 'Token received' : 'No token',
          isAdmin: response.data.is_admin || false
        });

        setLoading(false);

        // Redirect based on user role
        if (response.data.is_admin || response.data.user.is_admin) {
          navigate('/admin/dashboard');
        } else {
          // Check if there's a redirect path from protected route
          const from = location.state?.from?.pathname || '/';
          navigate(from);
        }
      } else {
        setError('Login failed: No authentication token received');
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);

      // If admin login failed, suggest trying regular login
      if (isAdminLogin && errorMessage.includes('Admin privileges required')) {
        setError('Admin access denied. Try logging in as a regular user.');
        setIsAdminLogin(false);
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <h1>BikeCare</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>

          <div className="login-type-toggle">
            <button
              type="button"
              className={`toggle-btn ${!isAdminLogin ? 'active' : ''}`}
              onClick={() => setIsAdminLogin(false)}
            >
              User Login
            </button>
            <button
              type="button"
              className={`toggle-btn ${isAdminLogin ? 'active' : ''}`}
              onClick={() => setIsAdminLogin(true)}
            >
              Admin Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

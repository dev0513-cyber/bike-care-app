import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('userName') || 'Guest';

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left: Logo */}
        <Link to="/" className="nav-logo">
          BikeCare
        </Link>

        {/* Center: Nav Links */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/book-service" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Book Service
          </Link>
          <Link to="/doorstep-service" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Doorstep Service
          </Link>
          <Link to="/service-history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Service History
          </Link>
          <Link to="/estimate-price" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Estimate Price
          </Link>
          <Link to="/resell-value" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Resell Value
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>

          {/* Mobile User/Auth Section */}
          <div className="mobile-nav-right">
            {isLoggedIn ? (
              <div className="nav-user-section">
                <Link to="/profile" className="nav-link profile-link" onClick={() => setIsMenuOpen(false)}>
                  👤 Profile
                </Link>
                <span className="nav-user-name">👋 {userName}</span>
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-auth-section">
                <Link to="/login" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="nav-btn nav-btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: User/Auth Section */}
        <div className="nav-right" style={{display: 'flex !important'}}>
          {isLoggedIn ? (
            <div className="nav-user-section">
              <Link to="/profile" className="nav-link profile-link" onClick={() => setIsMenuOpen(false)}>
                👤 Profile
              </Link>
              <span className="nav-user-name">👋 {userName}</span>
              <button
                className="nav-btn logout-btn"
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-section">
              <Link to="/login" className="nav-btn" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="nav-btn nav-btn-primary" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

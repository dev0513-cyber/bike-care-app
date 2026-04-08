import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>BikeCare Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li>
              <button 
                className={`nav-link ${isActivePage('/admin/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/admin/dashboard')}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${isActivePage('/admin/users') ? 'active' : ''}`}
                onClick={() => navigate('/admin/users')}
              >
                <span className="nav-icon">👥</span>
                Users
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${isActivePage('/admin/services') ? 'active' : ''}`}
                onClick={() => navigate('/admin/services')}
              >
                <span className="nav-icon">🔧</span>
                Services
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${isActivePage('/admin/contacts') ? 'active' : ''}`}
                onClick={() => navigate('/admin/contacts')}
              >
                <span className="nav-icon">📧</span>
                Contacts
              </button>
            </li>
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="nav-link logout" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header-bar">
          <div className="admin-breadcrumb">
            <span>Admin Panel</span>
            {location.pathname !== '/admin/dashboard' && (
              <>
                <span className="breadcrumb-separator">›</span>
                <span className="current-page">
                  {location.pathname.split('/').pop().charAt(0).toUpperCase() + 
                   location.pathname.split('/').pop().slice(1)}
                </span>
              </>
            )}
          </div>
          <div className="admin-user-info">
            <span>Welcome, {localStorage.getItem('userName') || 'Admin'}</span>
          </div>
        </div>
        
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

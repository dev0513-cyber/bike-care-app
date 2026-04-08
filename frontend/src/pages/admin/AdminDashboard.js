import React, { useState, useEffect } from 'react';
import { adminAPI, apiUtils } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the BikeCare Admin Panel</p>
      </div>

      <div className="dashboard-stats">
        <div className="stats-grid">
          {/* User Statistics */}
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Users</h3>
              <div className="stat-number">{dashboardData?.users?.total || 0}</div>
              <div className="stat-details">
                <span>Admin: {dashboardData?.users?.admin || 0}</span>
                <span>Regular: {dashboardData?.users?.regular || 0}</span>
                <span>New this month: {dashboardData?.users?.new_this_month || 0}</span>
              </div>
            </div>
          </div>

          {/* Service Statistics */}
          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-content">
              <h3>Services</h3>
              <div className="stat-number">{dashboardData?.services?.total_services || 0}</div>
              <div className="stat-details">
                <span>Bike Services: {dashboardData?.services?.total_bike_services || 0}</span>
                <span>Doorstep: {dashboardData?.services?.total_doorstep_services || 0}</span>
                <span>Pending: {dashboardData?.services?.pending || 0}</span>
                <span>Completed: {dashboardData?.services?.completed || 0}</span>
              </div>
            </div>
          </div>

          {/* Contact Statistics */}
          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-content">
              <h3>Contacts</h3>
              <div className="stat-number">{dashboardData?.contacts?.total || 0}</div>
              <div className="stat-details">
                <span>Unresolved: {dashboardData?.contacts?.unresolved || 0}</span>
                <span>Resolved: {dashboardData?.contacts?.resolved || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Recent Activity</h3>
              <div className="stat-number">{dashboardData?.services?.recent_services || 0}</div>
              <div className="stat-details">
                <span>Services this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/admin/users'}
          >
            Manage Users
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin/services'}
          >
            Manage Services
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin/contacts'}
          >
            Manage Contacts
          </button>
          <button 
            className="btn btn-outline"
            onClick={fetchDashboardData}
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Notification from '../components/Notification';
import { serviceAPI, apiUtils } from '../services/api';

const ServiceHistory = () => {
  const [filter, setFilter] = useState('all');
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch service history from backend
  useEffect(() => {
    console.log('🔄 ServiceHistory component mounted, fetching data...');
    fetchServiceHistory();
  }, []);

  // Add a refresh function that can be called externally
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing service history...');
      fetchServiceHistory(); // Refresh when user comes back to the page
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchServiceHistory = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching service history...');
      const response = await serviceAPI.getServiceHistory();

      console.log('📊 API Response:', response);
      console.log('📋 Services data:', response.data);

      if (response.data && response.data.services) {
        console.log('✅ Services found:', response.data.services.length);
        // Remove duplicates based on id and service_category to prevent key conflicts
        const uniqueServices = response.data.services.filter((service, index, self) =>
          index === self.findIndex(s => s.id === service.id && s.service_category === service.service_category)
        );
        console.log('🔧 Unique services after deduplication:', uniqueServices.length);
        setServiceHistory(uniqueServices);
      } else {
        console.log('No services data in response');
        setServiceHistory([]);
      }
    } catch (error) {
      console.error('Service history fetch error:', error);
      setError(apiUtils.formatErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'in progress':
        return 'status-in progress';
      default:
        return 'status-default';
    }
  };

  const filteredHistory = serviceHistory.filter(service => {
    if (filter === 'all') return true;
    return service.status.toLowerCase() === filter;
  });

  // Calculate totals
  const completedServices = filteredHistory.filter(service => service.status.toLowerCase() === 'completed');
  const totalServices = completedServices.length;

  // Estimate total spent based on service types (since backend doesn't store amounts yet)
  const getServicePrice = (serviceType) => {
    const prices = {
      'basic': 500,
      'standard': 800,
      'premium': 1200,
      'oil-change': 300,
      'brake-service': 600,
      'chain-cleaning': 200,
      'tire-replacement': 1500,
      'engine-tuning': 2000,
      'breakdown': 800,
      'maintenance': 600,
      'tire-repair': 300,
      'battery': 500,
      'brake-adjustment': 350,
      'chain-service': 250,
      'full-service': 1500
    };
    return prices[serviceType] || 800;
  };

  const totalSpent = completedServices.reduce((total, service) => {
    return total + getServicePrice(service.service_type);
  }, 0);

  // Get most recent vehicle and service date
  const mostRecentService = serviceHistory[0];
  const primaryVehicle = mostRecentService?.vehicle_display_name || 'No vehicles';
  const lastServiceDate = mostRecentService?.date ? new Date(mostRecentService.date).toLocaleDateString() : 'No services yet';

  return (
    <div className="service-history">
      <div className="container">
        <div className="page-header">
          <h1>Service History</h1>
          <p>Track all your bike services and maintenance records</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center" style={{ padding: '2rem' }}>
            <p>Loading service history...</p>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <Notification
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {success && (
          <Notification
            type="success"
            message={success}
            onClose={clearMessages}
          />
        )}

        {/* Show message if no services found */}
        {!loading && !error && serviceHistory.length === 0 && (
          <Card className="empty-state-card" style={{ marginBottom: '2rem', padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <h3>📭 No Service History Found</h3>
            <p>You haven't booked any services yet.</p>
            <p>Start by booking your first service!</p>
            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => window.location.href = '/book-service'}
                style={{
                  marginRight: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📝 Book Service
              </button>
              <button
                onClick={fetchServiceHistory}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="summary-cards">
          <Card className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>{totalServices}</h3>
              <p>Total Services</p>
            </div>
          </Card>
          <Card className="summary-card">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <h3>₹{totalSpent}</h3>
              <p>Total Spent</p>
            </div>
          </Card>
          <Card className="summary-card">
            <div className="summary-icon">🔧</div>
            <div className="summary-content">
              <h3>{primaryVehicle}</h3>
              <p>Primary Vehicle</p>
            </div>
          </Card>
          <Card className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h3>{lastServiceDate}</h3>
              <p>Last Service</p>
            </div>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="filter-section">
          <h3>Filter Services</h3>
          <div className="filter-buttons">
            <Button
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilter('all')}
            >
              All Services
            </Button>
            <Button
              variant={filter === 'completed' ? 'primary' : 'secondary'}
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'secondary'}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'secondary'}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </div>

        {/* Service History List */}
        <div className="history-section">
          <h3>Service Records</h3>
          {filteredHistory.length === 0 ? (
            <Card className="no-services">
              <div className="no-services-content">
                <div className="no-services-icon">📋</div>
                <h3>No services found</h3>
                <p>No services match the selected filter.</p>
              </div>
            </Card>
          ) : (
            <div className="history-list">
              {filteredHistory.map((service, index) => (
                <Card key={`${service.service_category}-${service.id}-${index}`} className="history-card">
                  <div className="history-header">
                    <div className="history-id">
                      <strong>#{service.id}</strong>
                      <span className={`status-badge ${getStatusColor(service.status)}`}>
                        {service.status_display || service.status}
                      </span>
                    </div>
                    <div className="history-date">
                      {new Date(service.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="history-content">
                    <div className="history-main">
                      <h4>{service.service_type_display || service.serviceType}</h4>
                      <p className="history-description">
                        {service.description || `${service.service_type_display || service.serviceType} - ${service.service_category === 'doorstep_service' ? 'Doorstep Service' : 'Regular Service'}`}
                      </p>
                      <div className="history-details">
                        {service.vehicle_display_name && (
                          <span className="detail-item">
                            <strong>Vehicle:</strong> {service.vehicle_display_name}
                            {service.vehicle_registration && ` (${service.vehicle_registration})`}
                          </span>
                        )}
                        <span className="detail-item">
                          <strong>Location:</strong> {service.address}
                        </span>
                        {service.service_category === 'doorstep_service' && service.time_slot && (
                          <span className="detail-item">
                            <strong>Time Slot:</strong> {service.time_slot}
                          </span>
                        )}
                        {service.service_category === 'doorstep_service' && service.contact_number && (
                          <span className="detail-item">
                            <strong>Contact:</strong> {service.contact_number}
                          </span>
                        )}
                        {service.emergency_service && (
                          <span className="detail-item emergency">
                            <strong>🚨 Emergency Service</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="history-sidebar">
                      <div className="history-amount">₹{getServicePrice(service.service_type)}</div>
                      <div className="service-category">
                        {service.service_category === 'doorstep_service' ? '🏠 Doorstep' : '🏢 Center'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceHistory;

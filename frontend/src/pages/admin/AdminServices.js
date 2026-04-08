import React, { useState, useEffect } from 'react';
import { adminAPI, apiUtils } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminServices = () => {
  const [services, setServices] = useState({
    bike_services: [],
    doorstep_services: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceType, setServiceType] = useState('bike');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState('bike');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getServices();
      setServices(response.data);
      setError('');
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      if (serviceType === 'bike') {
        await adminAPI.deleteBikeService(selectedService.id);
        setServices(prev => ({
          ...prev,
          bike_services: prev.bike_services.filter(service => service.id !== selectedService.id)
        }));
      } else {
        await adminAPI.deleteDoorstepService(selectedService.id);
        setServices(prev => ({
          ...prev,
          doorstep_services: prev.doorstep_services.filter(service => service.id !== selectedService.id)
        }));
      }
      setShowDeleteDialog(false);
      setSelectedService(null);
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const handleEditService = (service, type) => {
    setSelectedService(service);
    setServiceType(type);
    setEditFormData({
      status: service.status,
      notes: service.notes || service.special_instructions || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (serviceType === 'bike') {
        response = await adminAPI.updateBikeService(selectedService.id, editFormData);
        setServices(prev => ({
          ...prev,
          bike_services: prev.bike_services.map(service => 
            service.id === selectedService.id ? response.data.service : service
          )
        }));
      } else {
        response = await adminAPI.updateDoorstepService(selectedService.id, {
          status: editFormData.status,
          special_instructions: editFormData.notes
        });
        setServices(prev => ({
          ...prev,
          doorstep_services: prev.doorstep_services.map(service => 
            service.id === selectedService.id ? response.data.service : service
          )
        }));
      }
      setShowEditModal(false);
      setSelectedService(null);
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'in_progress': 'purple',
      'completed': 'green',
      'cancelled': 'red',
      'technician_assigned': 'teal'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Service Management</h1>
        <p>Manage all service bookings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        <div className="service-tabs">
          <button 
            className={`tab-button ${activeTab === 'bike' ? 'active' : ''}`}
            onClick={() => setActiveTab('bike')}
          >
            Bike Services ({services.bike_services.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'doorstep' ? 'active' : ''}`}
            onClick={() => setActiveTab('doorstep')}
          >
            Doorstep Services ({services.doorstep_services.length})
          </button>
        </div>

        <div className="table-container">
          {activeTab === 'bike' ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Bike Model</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.bike_services.map(service => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.user ? `${service.user.first_name} ${service.user.last_name}`.trim() || service.user.email : 'Guest'}</td>
                    <td>{service.service_type_display || service.service_type}</td>
                    <td>{service.bike_model_display || service.bike_model}</td>
                    <td>{new Date(service.preferred_date).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(service.status) }}
                      >
                        {service.status_display}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditService(service, 'bike')}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setSelectedService(service);
                            setServiceType('bike');
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Address</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.doorstep_services.map(service => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.user ? `${service.user.first_name} ${service.user.last_name}`.trim() || service.user.email : 'Guest'}</td>
                    <td>{service.service_type_display || service.service_type}</td>
                    <td>{service.address}</td>
                    <td>{service.time_slot}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(service.status) }}
                      >
                        {service.status_display}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditService(service, 'doorstep')}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setSelectedService(service);
                            setServiceType('doorstep');
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit {serviceType === 'bike' ? 'Bike' : 'Doorstep'} Service</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateService} className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  {serviceType === 'doorstep' && (
                    <option value="technician_assigned">Technician Assigned</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>{serviceType === 'bike' ? 'Notes' : 'Special Instructions'}</label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="4"
                  placeholder="Add any notes or special instructions..."
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Update Service
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Service"
        message={`Are you sure you want to delete this ${serviceType} service? This action cannot be undone.`}
        onConfirm={handleDeleteService}
        onClose ={() => {
          setShowDeleteDialog(false);
          setSelectedService(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminServices;

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { authAPI, vehicleAPI, apiUtils } from '../services/api';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, vehicleId: null, vehicleName: '' });
  const [vehicleForm, setVehicleForm] = useState({
    bike_model: '',
    custom_model_name: '',
    registration_number: '',
    year: new Date().getFullYear(),
    fuel_type: 'petrol',
    engine_capacity: '',
    color: '',
    purchase_date: '',
    last_service_date: '',
    next_service_due: '',
    km_run: 0,
    is_primary: false,
    notes: ''
  });

  const bikeModels = [
    { value: 'honda-cb-shine', label: 'Honda CB Shine' },
    { value: 'hero-splendor', label: 'Hero Splendor Plus' },
    { value: 'bajaj-pulsar-150', label: 'Bajaj Pulsar 150' },
    { value: 'tvs-apache', label: 'TVS Apache RTR 160' },
    { value: 'yamaha-fz', label: 'Yamaha FZ-S' },
    { value: 're-classic', label: 'Royal Enfield Classic 350' },
    { value: 'ktm-duke', label: 'KTM Duke 200' },
    { value: 'suzuki-gixxer', label: 'Suzuki Gixxer' },
    { value: 'honda-activa', label: 'Honda Activa' },
    { value: 'tvs-jupiter', label: 'TVS Jupiter' },
    { value: 'bajaj-avenger', label: 'Bajaj Avenger' },
    { value: 'yamaha-r15', label: 'Yamaha R15' },
    { value: 'other', label: 'Other' }
  ];

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  useEffect(() => {
    console.log('UserProfile component mounted');
    fetchUserProfile();
    fetchVehicles();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Profile fetch error:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('Fetching vehicles...');
      const response = await vehicleAPI.getVehicles();
      console.log('Vehicles response:', response.data);
      setVehicles(response.data);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Vehicles fetch error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Failed to load vehicles: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        setError('Failed to connect to server. Please check if the backend is running.');
      } else {
        setError('Failed to load vehicles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;

    // Format registration number to uppercase
    if (name === 'registration_number') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    // Ensure numeric fields are properly handled
    if (name === 'year' || name === 'engine_capacity' || name === 'km_run') {
      processedValue = value === '' ? '' : value;
    }

    // Debug logging for bike_model changes
    if (name === 'bike_model') {
      console.log('Bike model changed:', value);
    }

    setVehicleForm(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm({
      bike_model: '',
      custom_model_name: '',
      registration_number: '',
      year: new Date().getFullYear(),
      fuel_type: 'petrol',
      engine_capacity: '',
      color: '',
      purchase_date: '',
      last_service_date: '',
      next_service_due: '',
      km_run: 0,
      is_primary: false,
      notes: ''
    });
    setShowAddVehicle(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      bike_model: vehicle.bike_model || '',
      custom_model_name: vehicle.custom_model_name || '',
      registration_number: vehicle.registration_number || '',
      year: vehicle.year || new Date().getFullYear(),
      fuel_type: vehicle.fuel_type || 'petrol',
      engine_capacity: vehicle.engine_capacity || '',
      color: vehicle.color || '',
      purchase_date: vehicle.purchase_date || '',
      last_service_date: vehicle.last_service_date || '',
      next_service_due: vehicle.next_service_due || '',
      km_run: vehicle.km_run || 0,
      is_primary: vehicle.is_primary || false,
      notes: vehicle.notes || ''
    });
    setShowAddVehicle(true);
  };

  const handleSubmitVehicle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('Form submission started with data:', vehicleForm);

    // Validate required fields
    if (!vehicleForm.bike_model || vehicleForm.bike_model.trim() === '') {
      setError('Please select a bike model');
      console.log('Validation failed: bike_model is empty');
      return;
    }

    if (!vehicleForm.registration_number || vehicleForm.registration_number.trim() === '') {
      setError('Please enter registration number');
      console.log('Validation failed: registration_number is empty');
      return;
    }

    if (!vehicleForm.year) {
      setError('Please enter year');
      console.log('Validation failed: year is empty');
      return;
    }

    if (vehicleForm.bike_model === 'other' && (!vehicleForm.custom_model_name || vehicleForm.custom_model_name.trim() === '')) {
      setError('Please enter custom model name');
      console.log('Validation failed: custom_model_name is empty for "other" bike model');
      return;
    }

    try {
      // Prepare data for API
      const vehicleData = {
        bike_model: vehicleForm.bike_model,
        custom_model_name: vehicleForm.custom_model_name || null,
        registration_number: vehicleForm.registration_number.toUpperCase(),
        year: parseInt(vehicleForm.year),
        fuel_type: vehicleForm.fuel_type,
        engine_capacity: vehicleForm.engine_capacity ? parseInt(vehicleForm.engine_capacity) : null,
        color: vehicleForm.color || null,
        purchase_date: vehicleForm.purchase_date || null,
        last_service_date: vehicleForm.last_service_date || null,
        next_service_due: vehicleForm.next_service_due || null,
        km_run: parseInt(vehicleForm.km_run) || 0,
        is_primary: vehicleForm.is_primary,
        notes: vehicleForm.notes || null
      };

      console.log('Submitting vehicle data:', vehicleData);
      console.log('Current form state:', vehicleForm);

      if (editingVehicle) {
        await vehicleAPI.updateVehicle(editingVehicle.id, vehicleData);
        setSuccess('Vehicle updated successfully!');
      } else {
        await vehicleAPI.createVehicle(vehicleData);
        setSuccess('Vehicle added successfully!');
      }

      setShowAddVehicle(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Vehicle submission error:', error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          setError(errorMessages.join('; '));
        } else {
          setError(errorData.message || 'Failed to save vehicle');
        }
      } else {
        setError('Failed to save vehicle. Please try again.');
      }
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    setDeleteConfirm({
      show: true,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.bike_model === 'other' ? vehicle.custom_model_name : vehicle.bike_model} - ${vehicle.registration_number}`
    });
  };

  const confirmDeleteVehicle = async () => {
    try {
      await vehicleAPI.deleteVehicle(deleteConfirm.vehicleId);
      setSuccess('Vehicle deleted successfully!');
      fetchVehicles();
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const handleSetPrimary = async (vehicleId) => {
    try {
      await vehicleAPI.setPrimaryVehicle(vehicleId);
      setSuccess('Primary vehicle updated!');
      fetchVehicles();
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const testConnection = async () => {
    try {
      setError('');
      setSuccess('');

      // Check authentication state
      const token = localStorage.getItem('authToken');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userEmail = localStorage.getItem('userEmail');

      console.log('Authentication state:', {
        token: token ? `${token.substring(0, 10)}...` : 'No token',
        isLoggedIn,
        userEmail
      });

      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('Testing API connection...');
      const response = await vehicleAPI.getVehicles();
      console.log('Connection test successful:', response);
      setSuccess(`✅ Database connection successful! Found ${response.data.length} vehicles.`);
    } catch (error) {
      console.error('Connection test failed:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(`Connection failed: ${error.response.status} - ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError('Cannot connect to backend server. Please ensure Django is running on http://127.0.0.1:8000');
      } else {
        setError('Connection test failed');
      }
    }
  };

  const addSampleVehicle = async () => {
    try {
      setError('');
      setSuccess('');

      const sampleVehicle = {
        bike_model: 'honda-cb-shine',
        registration_number: `TEST${Date.now()}`,
        year: 2022,
        fuel_type: 'petrol',
        engine_capacity: 125,
        color: 'Red',
        km_run: 5000,
        is_primary: vehicles.length === 0,
        notes: 'Sample vehicle for testing'
      };

      console.log('Adding sample vehicle:', sampleVehicle);
      await vehicleAPI.createVehicle(sampleVehicle);
      setSuccess('✅ Sample vehicle added successfully!');
      fetchVehicles();
    } catch (error) {
      console.error('Failed to add sample vehicle:', error);
      if (error.response && error.response.data) {
        setError(`Failed to add sample vehicle: ${JSON.stringify(error.response.data)}`);
      } else {
        setError('Failed to add sample vehicle');
      }
    }
  };

  return (
    <div className="user-profile">
      <div className="container">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account and vehicles</p>
        </div>

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

        {/* User Information */}
        <Card className="profile-card">
          <h3>Account Information</h3>
          {user ? (
            <div className="user-info">
              <div className="info-item">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="info-item">
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </div>
              <div className="info-item">
                <strong>Member since:</strong> {new Date(user.date_joined).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p>Loading user information...</p>
          )}
        </Card>

        {/* Vehicles Section */}
        <Card className="vehicles-section">
          <div className="section-header">
            <h3>My Vehicles</h3>
            <div className="header-actions">
              <Button variant="primary" onClick={handleAddVehicle}>
                + Add Vehicle
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <LoadingSpinner size="large" />
              <p>Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <p>No vehicles added yet. Add your first vehicle to get started!</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map(vehicle => (
                <Card key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-header">
                    <h4>{vehicle.display_name}</h4>
                    {vehicle.is_primary && <span className="primary-badge">Primary</span>}
                  </div>
                  <div className="vehicle-details">
                    <p><strong>Registration:</strong> {vehicle.registration_number}</p>
                    <p><strong>Year:</strong> {vehicle.year}</p>
                    <p><strong>Fuel Type:</strong> {vehicle.fuel_type_display}</p>
                    {vehicle.engine_capacity && (
                      <p><strong>Engine:</strong> {vehicle.engine_capacity} CC</p>
                    )}
                    {vehicle.color && (
                      <p><strong>Color:</strong> {vehicle.color}</p>
                    )}
                    <p><strong>KM Run:</strong> {vehicle.km_run.toLocaleString()} km</p>
                  </div>
                  <div className="vehicle-actions">
                    {!vehicle.is_primary && (
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => handleSetPrimary(vehicle.id)}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteVehicle(vehicle)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Add/Edit Vehicle Modal */}
        {showAddVehicle && (
          <div className="modal-overlay" onClick={() => setShowAddVehicle(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddVehicle(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitVehicle} className="vehicle-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bike Model *</label>
                    <select
                      name="bike_model"
                      value={vehicleForm.bike_model}
                      onChange={handleVehicleFormChange}
                      required
                    >
                      <option value="">Select Model</option>
                      {bikeModels.map(model => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {vehicleForm.bike_model === 'other' && (
                    <div className="form-group">
                      <FormInput
                        label="Custom Model Name *"
                        name="custom_model_name"
                        value={vehicleForm.custom_model_name}
                        onChange={handleVehicleFormChange}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input
                      type="text"
                      name="registration_number"
                      value={vehicleForm.registration_number}
                      onChange={handleVehicleFormChange}
                      placeholder="e.g., MH12AB1234"
                      maxLength="15"
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Enter vehicle registration number (letters and numbers only)
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleFormChange}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      placeholder="e.g., 2022"
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      Manufacturing year (1990 - {new Date().getFullYear() + 1})
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select
                      name="fuel_type"
                      value={vehicleForm.fuel_type}
                      onChange={handleVehicleFormChange}
                    >
                      {fuelTypes.map(fuel => (
                        <option key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <FormInput
                      label="Engine Capacity (CC)"
                      name="engine_capacity"
                      type="number"
                      value={vehicleForm.engine_capacity}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <FormInput
                      label="Color"
                      name="color"
                      value={vehicleForm.color}
                      onChange={handleVehicleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <FormInput
                      label="KM Run"
                      name="km_run"
                      type="number"
                      min="0"
                      value={vehicleForm.km_run}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <FormInput
                      label="Purchase Date"
                      name="purchase_date"
                      type="date"
                      value={vehicleForm.purchase_date}
                      onChange={handleVehicleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <FormInput
                      label="Last Service Date"
                      name="last_service_date"
                      type="date"
                      value={vehicleForm.last_service_date}
                      onChange={handleVehicleFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={vehicleForm.is_primary}
                      onChange={handleVehicleFormChange}
                    />
                    Set as primary vehicle
                  </label>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={vehicleForm.notes}
                    onChange={handleVehicleFormChange}
                    rows="3"
                    placeholder="Any additional notes about your vehicle..."
                  />
                </div>

                <div className="form-actions">
                  <Button type="button" variant="secondary" onClick={() => setShowAddVehicle(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, vehicleId: null, vehicleName: '' })}
          onConfirm={confirmDeleteVehicle}
          title="Delete Vehicle"
          message={`Are you sure you want to delete "${deleteConfirm.vehicleName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default UserProfile;

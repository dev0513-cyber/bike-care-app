import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Notification from '../components/Notification';
import { serviceAPI, vehicleAPI, apiUtils } from '../services/api';

const DoorstepService = () => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    address: '',
    landmark: '',
    timeSlot: '',
    contactNumber: '',
    emergencyService: false,
    specialInstructions: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getVehicles();
      setVehicles(response.data);

      // Auto-select primary vehicle if available
      const primaryVehicle = response.data.find(v => v.is_primary);
      if (primaryVehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleId: primaryVehicle.id.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setError('Failed to load your vehicles. Please try again.');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const serviceTypes = [
    { value: 'breakdown', label: 'Breakdown Service - ₹800' },
    { value: 'maintenance', label: 'Regular Maintenance - ₹600' },
    { value: 'oil-change', label: 'Oil Change - ₹400' },
    { value: 'tire-repair', label: 'Tire Repair - ₹300' },
    { value: 'battery', label: 'Battery Service - ₹500' },
    { value: 'brake-adjustment', label: 'Brake Adjustment - ₹350' },
    { value: 'chain-service', label: 'Chain Service - ₹250' },
    { value: 'full-service', label: 'Complete Service - ₹1500' }
  ];

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      // Validate vehicle selection
      if (!formData.vehicleId) {
        setError('Please select a vehicle for the service.');
        setLoading(false);
        return;
      }

      // Prepare data for backend
      const serviceData = {
        vehicle_id: parseInt(formData.vehicleId),
        service_type: formData.serviceType,
        address: formData.address,
        landmark: formData.landmark,
        time_slot: formData.timeSlot,
        contact_number: formData.contactNumber,
        emergency_service: formData.emergencyService,
        special_instructions: formData.specialInstructions
      };

      // Call backend API
      const response = await serviceAPI.scheduleDoorstepService(serviceData);

      if (response.data) {
        setLoading(false);
        setSuccess('Doorstep service scheduled successfully! Our technician will contact you soon.');

        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess('');
          setFormData({
            vehicleId: vehicles.find(v => v.is_primary)?.id.toString() || '',
            serviceType: '',
            address: '',
            landmark: '',
            timeSlot: '',
            contactNumber: '',
            emergencyService: false,
            specialInstructions: ''
          });
        }, 3000);
      }
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <div className="doorstep-service">
      <div className="container">
        <div className="page-header">
          <h1>Doorstep Service</h1>
          <p>Professional bike service at your location - home, office, or anywhere convenient</p>
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

        <div className="doorstep-content">
          <div className="service-form-section">
            <Card className="doorstep-form-card">
              <h2>Schedule Doorstep Service</h2>
              
              <form onSubmit={handleSubmit} className="doorstep-form">
                <div className="form-group">
                  <label>Select Vehicle *</label>
                  {vehicles.length === 0 ? (
                    <div className="no-vehicles-message">
                      <p>No vehicles found. Please add a vehicle first.</p>
                      <Link to="/profile" className="btn btn-primary">
                        Add Vehicle
                      </Link>
                    </div>
                  ) : (
                    <select
                      name="vehicleId"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.display_name} ({vehicle.registration_number})
                          {vehicle.is_primary ? ' - Primary' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <FormInput
                  label="Service Type"
                  type="select"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  options={serviceTypes}
                  placeholder="Select the service you need"
                  required
                />

                <FormInput
                  label="Service Address"
                  type="textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address where service is needed"
                  required
                />

                <FormInput
                  label="Landmark"
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark for easy location (optional)"
                />

                <div className="form-row">
                  <FormInput
                    label="Preferred Time Slot"
                    type="select"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    options={timeSlots}
                    placeholder="Select convenient time"
                    required
                  />
                  <FormInput
                    label="Contact Number"
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Your contact number"
                    required
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emergencyService"
                      checked={formData.emergencyService}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Emergency Service (Same day service +₹200)
                  </label>
                </div>

                <FormInput
                  label="Special Instructions"
                  type="textarea"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any specific instructions for our technician (parking, access, etc.)"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={loading}
                  className="doorstep-submit-btn"
                >
                  {loading ? 'Scheduling...' : 'Schedule Service'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="service-info-section">
            <Card className="doorstep-benefits">
              <h3>Doorstep Service Benefits</h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">🏠</span>
                  <div>
                    <h4>Convenience</h4>
                    <p>Service at your preferred location</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⏰</span>
                  <div>
                    <h4>Time Saving</h4>
                    <p>No need to travel to service centers</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔧</span>
                  <div>
                    <h4>Expert Service</h4>
                    <p>Certified technicians with tools</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💰</span>
                  <div>
                    <h4>Transparent Pricing</h4>
                    <p>No hidden charges or surprises</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="service-coverage">
              <h3>Service Coverage</h3>
              <div className="coverage-info">
                <div className="coverage-item">
                  <strong>Service Areas:</strong>
                  <p>All major residential and commercial areas</p>
                </div>
                <div className="coverage-item">
                  <strong>Response Time:</strong>
                  <p>Within 2-4 hours for regular service</p>
                </div>
                <div className="coverage-item">
                  <strong>Emergency Service:</strong>
                  <p>Same day service available</p>
                </div>
                <div className="coverage-item">
                  <strong>Service Hours:</strong>
                  <p>8:00 AM to 8:00 PM, 7 days a week</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoorstepService;

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Notification from '../components/Notification';
import { serviceAPI, vehicleAPI, apiUtils } from '../services/api';

const BookService = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    doorstepService: false,
    address: '',
    notes: ''
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch user vehicles and pre-fill form data from URL parameters
  useEffect(() => {
    fetchVehicles();

    const serviceType = searchParams.get('serviceType');
    const doorstepService = searchParams.get('doorstepService') === 'true';

    if (serviceType || doorstepService) {
      setFormData(prev => ({
        ...prev,
        serviceType: serviceType || prev.serviceType,
        doorstepService: doorstepService
      }));
    }
  }, [searchParams]);

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
    { value: 'basic', label: 'Basic Service - ₹500' },
    { value: 'standard', label: 'Standard Service - ₹800' },
    { value: 'premium', label: 'Premium Service - ₹1200' },
    { value: 'oil-change', label: 'Oil Change - ₹300' },
    { value: 'brake-service', label: 'Brake Service - ₹600' },
    { value: 'chain-cleaning', label: 'Chain Cleaning - ₹200' },
    { value: 'tire-replacement', label: 'Tire Replacement - ₹1500' },
    { value: 'engine-tuning', label: 'Engine Tuning - ₹2000' }
  ];

  const timeSlots = [
    { value: '9:00 AM - 11:00 AM', label: '9:00 AM - 11:00 AM' },
    { value: '11:00 AM - 1:00 PM', label: '11:00 AM - 1:00 PM' },
    { value: '1:00 PM - 3:00 PM', label: '1:00 PM - 3:00 PM' },
    { value: '3:00 PM - 5:00 PM', label: '3:00 PM - 5:00 PM' },
    { value: '5:00 PM - 7:00 PM', label: '5:00 PM - 7:00 PM' }
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

      // Find the selected vehicle to get bike_model
      const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicleId);
      if (!selectedVehicle) {
        setError('Selected vehicle not found. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      // Prepare data for backend
      const serviceData = {
        vehicle_id: parseInt(formData.vehicleId),
        bike_model: selectedVehicle.bike_model, // Explicitly include bike_model for backward compatibility
        service_type: formData.serviceType,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        doorstep_service: formData.doorstepService,
        address: formData.doorstepService ? formData.address : '',
        notes: formData.notes
      };

      console.log('Booking service with data:', serviceData);
      console.log('Selected vehicle:', selectedVehicle);

      // Call backend API
      const response = await serviceAPI.bookService(serviceData);

      if (response.data) {
        setLoading(false);
        setSuccess('Service booked successfully! You can view your booking in Service History.');

        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess('');
          setFormData({
            vehicleId: vehicles.find(v => v.is_primary)?.id.toString() || '',
            serviceType: '',
            preferredDate: '',
            preferredTime: '',
            doorstepService: false,
            address: '',
            notes: ''
          });
        }, 3000);
      }
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <div className="book-service">
      <div className="container">
        <div className="page-header">
          <h1>Book Service</h1>
          <p>Schedule professional bike maintenance at your convenience</p>
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

        <div className="book-service-content">
          <div className="service-form-section">
            <Card className="service-form-card">
              <h2>Service Details</h2>
              
              <form onSubmit={handleSubmit} className="service-form">
                <div className="form-row">
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
                    placeholder="Select service type"
                    required
                  />
                </div>

                <div className="form-row">
                  <FormInput
                    label="Preferred Date"
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                  />
                  <FormInput
                    label="Preferred Time"
                    type="select"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    options={timeSlots}
                    placeholder="Select time slot"
                    required
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="doorstepService"
                      checked={formData.doorstepService}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Doorstep Service (+₹100)
                  </label>
                </div>

                {formData.doorstepService && (
                  <FormInput
                    label="Service Address"
                    type="textarea"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your complete address for doorstep service"
                    required={formData.doorstepService}
                  />
                )}

                <FormInput
                  label="Additional Notes"
                  type="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific requirements or issues with your bike?"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={loading}
                  className="service-submit-btn"
                >
                  {loading ? 'Booking...' : 'Book Service'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="service-info-section">
            <Card className="service-info-card">
              <h3>Service Information</h3>
              <div className="service-features">
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>Expert certified technicians</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>Genuine parts and accessories</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>30-day service warranty</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span>Transparent pricing</span>
                </div>
              </div>
            </Card>
            <Card className="pricing-card">
              <h3>Service Packages</h3>
              <div className="pricing-list">
                <div className="pricing-item">
                  <span className="service-name">Basic Service</span>
                  <span className="service-price">₹500</span>
                </div>
                <div className="pricing-item">
                  <span className="service-name">Standard Service</span>
                  <span className="service-price">₹800</span>
                </div>
                <div className="pricing-item">
                  <span className="service-name">Premium Service</span>
                  <span className="service-price">₹1200</span>
                </div>
                <div className="pricing-note">
                  *Prices may vary based on bike model and additional requirements
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;

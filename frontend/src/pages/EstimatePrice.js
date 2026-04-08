import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Notification from '../components/Notification';
import { serviceAPI, vehicleAPI, apiUtils } from '../services/api';

const EstimatePrice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_id: '',
    serviceType: '',
    doorstepService: false,
    urgentService: false
  });
  const [vehicles, setVehicles] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');

  // Fetch user's vehicles
  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const response = await vehicleAPI.getVehicles();
      setVehicles(response.data);

      // Auto-select primary vehicle if available
      const primaryVehicle = response.data.find(v => v.is_primary);
      if (primaryVehicle && !formData.vehicle_id) {
        setFormData(prev => ({ ...prev, vehicle_id: primaryVehicle.id }));
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setError('Failed to load your vehicles. Please ensure you have added vehicles to your profile.');
    } finally {
      setVehiclesLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const serviceTypes = [
    { value: 'basic', label: 'Basic Service', basePrice: 500 },
    { value: 'standard', label: 'Standard Service', basePrice: 800 },
    { value: 'premium', label: 'Premium Service', basePrice: 1200 },
    { value: 'oil-change', label: 'Oil Change', basePrice: 300 },
    { value: 'brake-service', label: 'Brake Service', basePrice: 600 },
    { value: 'chain-cleaning', label: 'Chain Cleaning & Lubrication', basePrice: 200 },
    { value: 'tire-replacement', label: 'Tire Replacement', basePrice: 1500 },
    { value: 'engine-tuning', label: 'Engine Tuning', basePrice: 2000 },
    { value: 'electrical-check', label: 'Electrical System Check', basePrice: 400 },
    { value: 'carburetor-cleaning', label: 'Carburetor Cleaning', basePrice: 700 }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateEstimate = async () => {
    setLoading(true);
    setError('');

    if (!formData.vehicle_id) {
      setError('Please select a vehicle');
      setLoading(false);
      return;
    }

    try {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
      // Prepare data for backend
      const estimateData = {
        bike_model: selectedVehicle.bike_model === 'other' ? selectedVehicle.custom_model_name : selectedVehicle.bike_model,
        service_type: formData.serviceType,
        doorstep_service: formData.doorstepService,
        urgent_service: formData.urgentService,
        vehicle_id: formData.vehicle_id
      };

      // Call backend API
      const response = await serviceAPI.getPriceEstimate(estimateData);

      if (response.data && response.data.estimate) {
        const backendEstimate = response.data.estimate;

        setEstimate({
          bikeModel: backendEstimate.bike_model,
          serviceType: backendEstimate.service_type,
          basePrice: Math.round(backendEstimate.base_price),
          doorstepCharge: backendEstimate.doorstep_charge,
          urgentCharge: backendEstimate.urgent_charge,
          subtotal: Math.round(backendEstimate.subtotal),
          tax: Math.round(backendEstimate.tax),
          total: Math.round(backendEstimate.total),
          estimatedTime: backendEstimate.estimated_time,
          warranty: backendEstimate.warranty
        });
      }

      setLoading(false);
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
    setWarning('');
  };

  const handleBookService = async () => {
    clearMessages();

    if (!estimate) {
      setWarning('Please get a price estimate first');
      return;
    }

    try {
      setLoading(true);

      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
      // Book the service directly using the estimate data
      const serviceData = {
        vehicle_id: formData.vehicle_id,
        bike_model: selectedVehicle.bike_model === 'other' ? selectedVehicle.custom_model_name : selectedVehicle.bike_model,
        service_type: formData.serviceType,
        preferred_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        preferred_time: '10:00 AM',
        doorstep_service: formData.doorstepService,
        address: formData.doorstepService ? 'Address from estimate booking' : '',
        notes: `Booked directly from price estimate. Total: ₹${estimate.total}`
      };

      const response = await serviceAPI.bookService(serviceData);

      if (response.data) {
        setSuccess(`Service booked successfully! Service Type: ${estimate.serviceType}, Total: ₹${estimate.total}. You can view your booking in Service History.`);

        // Navigate to service history after a short delay
        setTimeout(() => {
          navigate('/service-history');
        }, 2000);
      }

    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      setError(`Booking failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="estimate-price">
      <div className="container">
        <div className="page-header">
          <h1>Estimate Price</h1>
          <p>Get instant price estimates for bike services and repairs</p>
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
            autoClose={false}
          />
        )}

        {warning && (
          <Notification
            type="warning"
            message={warning}
            onClose={clearMessages}
          />
        )}

        <div className="estimate-content">
          <div className="estimate-form-section">
            <Card className="estimate-form-card">
              <h2>Service Details</h2>
              <form className="estimate-form">
                {vehiclesLoading ? (
                  <div className="loading-container">
                    <p>Loading your vehicles...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="no-vehicles-message">
                    <p>No vehicles found in your profile.</p>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/profile')}
                      size="small"
                    >
                      Add Vehicle to Profile
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Select Your Vehicle *</label>
                      <select
                        name="vehicle_id"
                        value={formData.vehicle_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Choose your vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.bike_model === 'other'
                              ? vehicle.custom_model_name
                              : vehicle.bike_model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            } - {vehicle.registration_number}
                            {vehicle.is_primary && ' (Primary)'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="urgentService"
                      checked={formData.urgentService}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Urgent Service (+₹200)
                  </label>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={calculateEstimate}
                  disabled={!formData.vehicle_id || !formData.serviceType || loading || vehiclesLoading}
                  className="estimate-btn"
                >
                  {loading ? 'Calculating...' : 'Get Price Estimate'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="estimate-result-section">
            {estimate ? (
              <Card className="estimate-result-card">
                <h2>Price Estimate</h2>
                <div className="estimate-details">
                  <div className="estimate-header">
                    <h3>{estimate.bikeModel}</h3>
                    <p>{estimate.serviceType}</p>
                  </div>
                  
                  <div className="estimate-breakdown">
                    <div className="breakdown-item">
                      <span>Base Service Price</span>
                      <span>₹{estimate.basePrice}</span>
                    </div>
                    {estimate.doorstepCharge > 0 && (
                      <div className="breakdown-item">
                        <span>Doorstep Service</span>
                        <span>₹{estimate.doorstepCharge}</span>
                      </div>
                    )}
                    {estimate.urgentCharge > 0 && (
                      <div className="breakdown-item">
                        <span>Urgent Service</span>
                        <span>₹{estimate.urgentCharge}</span>
                      </div>
                    )}
                    <div className="breakdown-item subtotal">
                      <span>Subtotal</span>
                      <span>₹{estimate.subtotal}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>GST (18%)</span>
                      <span>₹{estimate.tax}</span>
                    </div>
                    <div className="breakdown-item total">
                      <span>Total Amount</span>
                      <span>₹{estimate.total}</span>
                    </div>
                  </div>
                  
                  <div className="estimate-info">
                    <div className="info-item">
                      <span className="info-icon">⏱️</span>
                      <div>
                        <strong>Estimated Time</strong>
                        <p>{estimate.estimatedTime}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">🛡️</span>
                      <div>
                        <strong>Warranty</strong>
                        <p>{estimate.warranty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="large"
                    className="book-now-btn"
                    onClick={handleBookService}
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Book This Service'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="estimate-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">💰</div>
                  <h3>Price Estimate</h3>
                  <p>Select your bike model and service type to get an instant price estimate</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Popular Services */}
        <section className="popular-services">
          <h2>Popular Services</h2>
          <div className="popular-grid">
            <Card className="popular-card">
              <h3>Basic Service</h3>
              <div className="popular-price">Starting from ₹500</div>
              <p>Essential maintenance for your bike</p>
            </Card>
            <Card className="popular-card">
              <h3>Oil Change</h3>
              <div className="popular-price">Starting from ₹300</div>
              <p>Fresh engine oil for smooth performance</p>
            </Card>
            <Card className="popular-card">
              <h3>Premium Service</h3>
              <div className="popular-price">Starting from ₹1200</div>
              <p>Complete bike service and inspection</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EstimatePrice;

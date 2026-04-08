import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Notification from '../components/Notification';
import { serviceAPI, vehicleAPI, apiUtils } from '../services/api';

const ResellValue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicle_id: '',
    condition: '',
    location: '',
    hasAccidents: false,
    modifications: false
  });
  const [vehicles, setVehicles] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  
  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new condition' },
    { value: 'good', label: 'Good - Minor wear and tear' },
    { value: 'fair', label: 'Fair - Visible wear, needs minor repairs' },
    { value: 'poor', label: 'Poor - Significant wear, needs major repairs' }
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Other'
  ];

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateResellValue = async () => {
    setLoading(true);
    clearMessages();

    if (!formData.vehicle_id) {
      setError('Please select a vehicle');
      setLoading(false);
      return;
    }

    try {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
      // Prepare data for backend
      const resellData = {
        bike_model: selectedVehicle.bike_model === 'other' ? selectedVehicle.custom_model_name : selectedVehicle.bike_model,
        year: selectedVehicle.year,
        km_run: selectedVehicle.km_run,
        condition: formData.condition,
        location: formData.location,
        has_accidents: formData.hasAccidents,
        modifications: formData.modifications,
        vehicle_id: formData.vehicle_id
      };

      // Call backend API
      const response = await serviceAPI.getResellValue(resellData);

      if (response.data && response.data.valuation) {
        const backendValuation = response.data.valuation;

        setValuation({
          bikeModel: backendValuation.bike_model,
          originalPrice: backendValuation.original_price,
          estimatedValue: Math.round(backendValuation.estimated_value),
          minValue: Math.round(backendValuation.min_value),
          maxValue: Math.round(backendValuation.max_value),
          depreciationPercent: backendValuation.depreciation_percent,
          bikeAge: backendValuation.bike_age,
          marketDemand: backendValuation.market_demand,
          tips: backendValuation.tips
        });
      }

      setLoading(false);
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
      setLoading(false);
    }
  };



  return (
    <div className="resell-value">
      <div className="container">
        <div className="page-header">
          <h1>Resell Value Calculator</h1>
          <p>Get an accurate estimate of your bike's current market value</p>
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

        <div className="resell-content">
          <div className="resell-form-section">
            <Card className="resell-form-card">
              <h2>Bike Information</h2>
              <form className="resell-form">
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
                            } - {vehicle.registration_number} ({vehicle.year})
                            {vehicle.is_primary && ' (Primary)'}
                          </option>
                        ))}
                      </select>
                      <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        Vehicle details (year, KM run) will be used from your profile
                      </small>
                    </div>
                  </>
                )}

                <FormInput
                  label="Overall Condition"
                  type="select"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  options={conditions}
                  placeholder="Select bike condition"
                  required
                />

                <FormInput
                  label="Location"
                  type="select"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  options={locations}
                  placeholder="Select your city"
                  required
                />

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasAccidents"
                      checked={formData.hasAccidents}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Has accident history
                  </label>
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="modifications"
                      checked={formData.modifications}
                      onChange={handleChange}
                    />
                    <span className="checkmark"></span>
                    Has modifications/aftermarket parts
                  </label>
                </div>



                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={calculateResellValue}
                  disabled={!formData.vehicle_id || !formData.condition || loading || vehiclesLoading}
                  className="calculate-btn"
                >
                  {loading ? 'Calculating...' : 'Calculate Resell Value'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="resell-result-section">
            {valuation ? (
              <Card className="valuation-result-card">
                <h2>Valuation Report</h2>
                <div className="valuation-details">
                  <div className="valuation-header">
                    <h3>{valuation.bikeModel}</h3>
                    <p>{formData.year} Model • {formData.kmRun} KM</p>
                  </div>
                  
                  <div className="value-range">
                    <div className="value-item">
                      <span className="value-label">Minimum Value</span>
                      <span className="value-amount min">₹{valuation.minValue.toLocaleString()}</span>
                    </div>
                    <div className="value-item main-value">
                      <span className="value-label">Estimated Value</span>
                      <span className="value-amount">₹{valuation.estimatedValue.toLocaleString()}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-label">Maximum Value</span>
                      <span className="value-amount max">₹{valuation.maxValue.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="valuation-info">
                    <div className="info-row">
                      <span>Original Price:</span>
                      <span>₹{valuation.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <span>Depreciation:</span>
                      <span>{valuation.depreciationPercent}%</span>
                    </div>
                    <div className="info-row">
                      <span>Bike Age:</span>
                      <span>{valuation.bikeAge} years</span>
                    </div>
                    <div className="info-row">
                      <span>Market Demand:</span>
                      <span className={`demand-${valuation.marketDemand.toLowerCase()}`}>
                        {valuation.marketDemand}
                      </span>
                    </div>
                  </div>
                  
                  <div className="selling-tips">
                    <h4>Selling Tips</h4>
                    <ul>
                      {valuation.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="valuation-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">📊</div>
                  <h3>Resell Value</h3>
                  <p>Fill in your bike details to get an accurate market valuation</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Market Trends */}
        <section className="market-trends">
          <h2>Market Trends</h2>
          <div className="trends-grid">
            <Card className="trend-card">
              <h3>Commuter Bikes</h3>
              <div className="trend-indicator positive">↗️ +5%</div>
              <p>High demand for fuel-efficient bikes</p>
            </Card>
            <Card className="trend-card">
              <h3>Sports Bikes</h3>
              <div className="trend-indicator neutral">→ 0%</div>
              <p>Stable market with steady demand</p>
            </Card>
            <Card className="trend-card">
              <h3>Cruiser Bikes</h3>
              <div className="trend-indicator positive">↗️ +8%</div>
              <p>Growing popularity among enthusiasts</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResellValue;

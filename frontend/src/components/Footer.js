import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span>BikeCare</span>
            </div>
            <p className="footer-description">
              Professional bike service. Quality, reliability, and convenience combined.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><Link to="/book-service">Book Service</Link></li>
              <li><Link to="/doorstep-service">Doorstep Service</Link></li>
              <li><Link to="/estimate-price">Price Estimate</Link></li>
              <li><Link to="/resell-value">Resell Value</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Company</h3>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/service-history">Service History</Link></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Info</h3>
            <div className="contact-info">
              <p>📞 +91 9989495674</p>
              <p>📧 support@bikecare.com</p>
              <p>📍 123 Bapunagar Road, Ahmedabad, Gujrat 380001</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 BikeCare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

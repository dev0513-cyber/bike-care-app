import React, { useState } from 'react';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { contactAPI, apiUtils } from '../services/api';
import Notification from '../components/Notification';

function openWhatsApp(phone, message) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// usage:



const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const contactInfo = [
    {
      icon: '📞',
      title: 'Phone',
      details: ['+91 1234567890', '+91 9989495674'],
      description: 'Call us for immediate assistance'
    },
    {
      icon: '📧',
      title: 'Email',
      details: ['support@bikecare.com', 'info@bikecare.com'],
      description: 'Send us an email anytime'
    },
    {
      icon: '📍',
      title: 'Address',
      details: ['123 Bapunagar Road,', 'Ahmedabad, Gujarat 380001'],
      description: 'Visit our main office'
    },
    {
      icon: '🕒',
      title: 'Business Hours',
      details: ['Mon-Fri: 8:00 AM - 8:00 PM', 'Sat-Sun: 9:00 AM - 6:00 PM'],
      description: 'We are here to help'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setNotification({
        type: 'error',
        message: 'Please fill in all fields'
      });
      setLoading(false);
      return;
    }

    try {
      await contactAPI.submitContact(formData);

      setNotification({
        type: 'success',
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: apiUtils.formatErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="contact">
      <div className="container">
        {/* Header */}
        <section className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with our team. We're here to help with any questions or concerns.</p>
        </section>



        {/* ChatBot Section */}

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <div className="contact-form-container">
            <div className="contact-form-header">
              <h2>Send Us a Message</h2>
              <p>Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            <Card className="contact-form-card">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <FormInput
                      label="Full Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <FormInput
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <FormInput
                    label="Subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please describe your question or concern in detail..."
                    rows="6"
                    className="form-textarea"
                    required
                  />
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={loading}
                    className="contact-submit-btn"
                  >
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </Button>

                </div>
              </form>
            </Card>
            <Button
            className="contact-submit-btn"
            onClick={() =>
              openWhatsApp(
                "919876543210",
                "Hello! I'd like to know more about your BikeCare plans."
              )
            }
          >
            Message on WhatsApp
          </Button>


            <div className="contact-form-info">
              <div className="info-item">
                <span className="info-icon">⚡</span>
                <div className="info-content">
                  <h4>Quick Response</h4>
                  <p>We typically respond within 2-4 hours during business hours</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <div className="info-content">
                  <h4>Secure & Private</h4>
                  <p>Your information is safe and will never be shared with third parties</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">💬</span>
                <div className="info-content">
                  <h4>Expert Support</h4>
                  <p>Our motorcycle service experts are here to help with any questions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="contact-info-section">
          <h2>Get in Touch</h2>
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <Card key={`contact-${info.title}-${index}`} className="contact-info-card">
                <div className="contact-info-icon">{info.icon}</div>
                <h3>{info.title}</h3>
                <div className="contact-details">
                  {info.details.map((detail, idx) => (
                    <p key={`detail-${detail}-${idx}`}>{detail}</p>
                  ))}
                </div>
                <p className="contact-description">{info.description}</p>
              </Card>
            ))}
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <Card className="faq-card">
              <h3>How quickly can you service my bike?</h3>
              <p>Most services can be completed within 24-48 hours of booking, depending on the type of service and parts availability.</p>
            </Card>
            <Card className="faq-card">
              <h3>Do you provide doorstep service in all areas?</h3>
              <p>We currently serve 25+ cities. Check our service areas or contact us to see if we serve your location.</p>
            </Card>
            <Card className="faq-card">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and digital payment methods for your convenience.</p>
            </Card>
            <Card className="faq-card">
              <h3>Is there a warranty on your services?</h3>
              <p>Yes, we provide a 30-day warranty on all our services and a 90-day warranty on parts we install.</p>
            </Card>
          </div>
        </section>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default Contact;

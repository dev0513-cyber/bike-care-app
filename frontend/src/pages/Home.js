import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

const Home = () => {
  const features = [
    {
      icon: '🔧',
      title: 'Book Service',
      description: 'Schedule professional bike maintenance and repairs at your convenience.',
      link: '/book-service'
    },
    {
      icon: '🏠',
      title: 'Doorstep Service',
      description: 'Get your bike serviced at your home or office. No need to travel.',
      link: '/doorstep-service'
    },
    {
      icon: '💰',
      title: 'Estimate Price',
      description: 'Get instant price estimates for various bike services and repairs.',
      link: '/estimate-price'
    },
    {
      icon: '📊',
      title: 'Resell Value',
      description: 'Check the current market value of your bike for resale purposes.',
      link: '/resell-value'
    },
    {
      icon: '📋',
      title: 'Service History',
      description: 'Track all your bike services and maintenance records in one place.',
      link: '/service-history'
    }
  ];

  const testimonials = [
    {
      name: 'Harsh Patel',
      text: 'Excellent service! They fixed my bike right at my doorstep. Highly recommended!',
      rating: 5
    },
    {
      name: 'Shrusti Kamra',
      text: 'Professional and reliable. The price estimation was accurate and fair.',
      rating: 5
    },
    {
      name: 'Rushi panchal',
      text: 'Great experience! The service history feature helps me keep track of everything.',
      rating: 4
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Professional Bike Service
              <span className="highlight"> At Your Doorstep</span>
            </h1>
            <p className="hero-subtitle">
              Quality bike maintenance and repairs with the convenience of home service. 
              Expert technicians, transparent pricing, and reliable service you can trust.
            </p>
            <div className="hero-buttons">
              <Link to="/book-service">
                <Button variant="primary" size="large">
                  Book Service Now
                </Button>
              </Link>
              <Link to="/estimate-price">
                <Button variant="secondary" size="large">
                  Get Price Estimate
                </Button>
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-bikes-grid">
              
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Everything you need for your bike maintenance and care</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link to={feature.link} key={`feature-${feature.title}-${index}`} className="feature-link">
                <Card hoverable className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Real feedback from satisfied bike owners</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <Card key={`testimonial-${testimonial.name}-${index}`} className="testimonial-card">
                <div className="testimonial-rating">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">- {testimonial.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Bikes Section */}
      <section className="popular-bikes">
        <div className="container">
          <div className="section-header">
            <h2>Popular Bike Models</h2>
            <p>We service all major motorcycle brands and models</p>
          </div>
          <div className="bikes-grid">
            <Card className="bike-card">
              <div className="bike-info">
                <h3>Honda CB Shine</h3>
                <p>Reliable commuter bike with excellent fuel efficiency</p>
                <div className="bike-specs">
                  <span>125cc • Petrol • 65 kmpl</span>
                </div>
              </div>
            </Card>

            <Card className="bike-card">
              <div className="bike-info">
                <h3>Yamaha FZ-S</h3>
                <p>Sporty design with powerful performance</p>
                <div className="bike-specs">
                  <span>149cc • Petrol • 45 kmpl</span>
                </div>
              </div>
            </Card>

            <Card className="bike-card">
              <div className="bike-info">
                <h3>Royal Enfield Classic 350</h3>
                <p>Classic cruiser with vintage charm</p>
                <div className="bike-specs">
                  <span>349cc • Petrol • 35 kmpl</span>
                </div>
              </div>
            </Card>

            <Card className="bike-card">
              <div className="bike-info">
                <h3>KTM Duke 200</h3>
                <p>Street fighter with aggressive styling</p>
                <div className="bike-specs">
                  <span>199cc • Petrol • 35 kmpl</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

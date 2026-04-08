import React from 'react';
import Card from '../components/Card';

const About = () => {
  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We never compromise on the quality of our service and parts used.'
    },
    {
      icon: '⚡',
      title: 'Fast & Reliable',
      description: 'Quick turnaround times without sacrificing attention to detail.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Using the latest tools and techniques for bike maintenance.'
    },
    {
      icon: '🤝',
      title: 'Customer Focus',
      description: 'Your satisfaction is our top priority in everything we do.'
    }
  ];

  const team = [
    {
      name: 'Dev Parmar',
      role: 'Founder & CEO',
      description: 'Passionate Rider with 5+ years in bike maintenance industry.'
    },
    {
      name: 'Vivek Patil',
      role: 'Head Technician',
      description: 'Expert mechanic specializing in high-end and electric bikes.'
    },
    {
      name: 'Meet Rathod',
      role: 'Operations Manager',
      description: 'Ensures smooth operations and customer satisfaction.'
    }
  ];

  return (
    <div className="about">
      <div className="container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>About BikeCare</h1>
            <p className="about-subtitle">
              Revolutionizing bike maintenance with professional doorstep service
            </p>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="mission-vision">
          <div className="mission-vision-grid">
            <Card className="mission-card">
              <div className="mission-vision-icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                At BikeCare, we believe that bike maintenance shouldn't be a hassle. Our mission is to
                provide professional, convenient, and reliable bike service.
                We're passionate about keeping you on the road with well-maintained, safe bikes.
              </p>
            </Card>

            <Card className="vision-card">
              <div className="mission-vision-icon">🚀</div>
              <h2>Our Vision</h2>
              <p>
                To become the leading bike service platform that makes bike maintenance accessible,
                convenient, and affordable for every rider. We envision a world where bike owners
                never have to worry about finding reliable service or transportation to bike shops.
              </p>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="values">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <Card key={`value-${value.title}-${index}`} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <Card key={`team-${member.name}-${index}`} className="team-card">
                <div className="team-avatar">👤</div>
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15000+</div>
              <div className="stat-label">Services Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Expert Technicians</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Cities Served</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

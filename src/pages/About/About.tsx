import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="page-content">
        <div className="container">
          <div className="about-hero">
            <h1 className="section-title">About Energy Waves</h1>
            <p className="section-subtitle">
              We are revolutionizing the way people interact with energy management through cutting-edge technology and innovative solutions.
            </p>
          </div>

          <div className="about-content">
            <div className="about-grid">
              <div className="about-card">
                <h3>Our Mission</h3>
                <p>
                  To create a sustainable future through intelligent energy management solutions that empower individuals and organizations to make informed decisions about their energy consumption.
                </p>
              </div>

              <div className="about-card">
                <h3>Our Vision</h3>
                <p>
                  A world where energy is managed efficiently, sustainably, and intelligently, creating a better future for generations to come.
                </p>
              </div>

              <div className="about-card">
                <h3>Our Values</h3>
                <p>
                  Innovation, sustainability, transparency, and user-centric design are at the core of everything we do.
                </p>
              </div>
            </div>

            <div className="team-section">
              <h2>Meet Our Team</h2>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-avatar">👨‍💻</div>
                  <h4>John Doe</h4>
                  <p>CEO & Founder</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">👩‍🔬</div>
                  <h4>Jane Smith</h4>
                  <p>CTO</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">👨‍🎨</div>
                  <h4>Mike Johnson</h4>
                  <p>Lead Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

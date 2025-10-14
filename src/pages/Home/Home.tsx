import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EnergyWaves from '../../components/EnergyWaves/EnergyWaves';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('home');

  // Note: Removed auto-redirect for authenticated users
  // Users can now view the home page regardless of auth status
  // They can navigate to dashboard/admin via navbar or direct link

  useEffect(() => {
    // Add scroll event listener for wave animations
    const handleScroll = () => {
      document.body.classList.add('scrolling');
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('wheel', handleScroll);
    window.addEventListener('touchmove', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
    };
  }, []);

  // Smooth scroll and section detection
  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('id');
          if (sectionId) {
            setActiveSection(sectionId);
          }
          
          // Animate elements in view
          const elements = entry.target.querySelectorAll('.animate-on-scroll');
          elements.forEach((el) => {
            el.classList.add('animate');
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Handle form submission
  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };
    
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', data);
    alert('Thank you for your message! We will get back to you soon.');
    e.currentTarget.reset();
  };

  return (
    <div className="home-page">
      <EnergyWaves />
      
      {/* Hero Section */}
      <section id="home" className={`section hero ${activeSection === 'home' ? 'active' : ''}`}>
        <div className="section-content hero-content">
          <h1 className="hero-title">The Waves</h1>
          <p className="hero-subtitle">
            Experience the flow of energy through your body
          </p>
          <a href="#about" className="cta-button">Explore More</a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`section about ${activeSection === 'about' ? 'active' : ''}`}>
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">About Our Vision</h2>
          <p className="section-subtitle animate-on-scroll">
            We create immersive digital experiences that blend technology with natural energy patterns
          </p>
          
          <div className="about-grid">
            <div className="about-card animate-on-scroll">
              <h3>Innovation</h3>
              <p>We push the boundaries of web design by incorporating fluid animations and interactive elements that respond to user behavior.</p>
            </div>
            <div className="about-card animate-on-scroll">
              <h3>Design</h3>
              <p>Our minimalist approach focuses on clean aesthetics and smooth user experiences that feel both modern and timeless.</p>
            </div>
            <div className="about-card animate-on-scroll">
              <h3>Technology</h3>
              <p>We leverage cutting-edge web technologies to create responsive, performant, and engaging digital experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section id="calendar" className={`section calendar ${activeSection === 'calendar' ? 'active' : ''}`}>
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Upcoming Events</h2>
          <p className="section-subtitle animate-on-scroll">
            Join us for exciting workshops and presentations
          </p>
          
          <div className="preview-container animate-on-scroll">
            <p className="preview-text">
              Explore our comprehensive calendar to stay up-to-date with all upcoming events, 
              workshops, and important dates.
            </p>
            <Link to="/calendar" className="preview-button">
              View Full Calendar
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className={`section blog ${activeSection === 'blog' ? 'active' : ''}`}>
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Latest Insights</h2>
          <p className="section-subtitle animate-on-scroll">
            Thoughts on design, technology, and creative innovation
          </p>
          
          <div className="preview-container animate-on-scroll">
            <p className="preview-text">
              Discover our latest articles, tutorials, and insights on web development, 
              design trends, and innovative technologies.
            </p>
            <Link to="/blog" className="preview-button">
              Read Our Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`section contact ${activeSection === 'contact' ? 'active' : ''}`}>
        <div className="section-content">
          <h2 className="section-title animate-on-scroll">Get In Touch</h2>
          <p className="section-subtitle animate-on-scroll">
            Ready to create something amazing together?
          </p>
          
          <form className="contact-form animate-on-scroll" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" required></textarea>
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="page-content">
        <div className="container">
          <div className="contact-hero">
            <h1 className="section-title">Contact Us</h1>
            <p className="section-subtitle">
              Get in touch with our team. We'd love to hear from you and answer any questions you may have.
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-card">
                  <div className="contact-icon">📧</div>
                  <h3>Email</h3>
                  <p>info@energywaves.com</p>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">📞</div>
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">📍</div>
                  <h3>Address</h3>
                  <p>123 Energy Street<br />Tech City, TC 12345</p>
                </div>
              </div>

              <div className="contact-form-container">
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input form-textarea"
                      rows={6}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-large">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

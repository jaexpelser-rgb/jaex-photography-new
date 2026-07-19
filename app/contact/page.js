'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-header">
            <h1>Contact Us</h1>
            <p>Get in touch with us for bookings and inquiries</p>
          </div>

          <div className="two-columns">
            <div>
              <h2 style={{ marginBottom: '24px' }}>Get In Touch</h2>
              {submitted && (
                <div className="alert alert-success">
                  Thank you for your message! We will get back to you soon.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
              </form>
            </div>

            <div>
              <h2 style={{ marginBottom: '24px' }}>Contact Details</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <div className="icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>{settings.contactEmail || 'contact@example.com'}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="icon">📱</div>
                  <div>
                    <h3>Phone</h3>
                    <p>{settings.contactPhone || '+1 (555) 123-4567'}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="icon">📍</div>
                  <div>
                    <h3>Address</h3>
                    <p>{settings.contactAddress || '123 Photography Lane, Creative City, CC 12345'}</p>
                  </div>
                </div>
              </div>

              <div className="neon-divider"></div>

              <h2 style={{ marginBottom: '16px' }}>Banking Details</h2>
              <div className="banking-details">
                <div className="banking-row">
                  <span className="banking-label">Bank</span>
                  <span className="banking-value">{settings.bankName || 'Bank Name'}</span>
                </div>
                <div className="banking-row">
                  <span className="banking-label">Account Number</span>
                  <span className="banking-value">{settings.bankAccountNumber || '1234567890'}</span>
                </div>
                <div className="banking-row">
                  <span className="banking-label">Branch</span>
                  <span className="banking-value">{settings.bankBranch || 'Branch Name'}</span>
                </div>
                <div className="banking-row">
                  <span className="banking-label">Account Holder</span>
                  <span className="banking-value">{settings.bankAccountHolder || 'Account Holder Name'}</span>
                </div>
                <div className="banking-row">
                  <span className="banking-label">Sort Code</span>
                  <span className="banking-value">{settings.bankSortCode || '12-34-56'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}

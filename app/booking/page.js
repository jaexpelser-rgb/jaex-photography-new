'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Booking() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '',
    location: '', sessionType: 'portrait', message: '', termsAccepted: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(data => setUser(data.user));
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please login or register to make a booking');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, termsAccepted: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Booking submitted successfully! We will contact you soon.');
      setFormData({
        name: '', email: '', phone: '', date: '', time: '',
        location: '', sessionType: 'portrait', message: '', termsAccepted: false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const termsText = settings.termsAndConditions || 'Terms and conditions not available.';

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-header">
            <h1>Book a Session</h1>
            <p>Schedule your photography session with us</p>
          </div>

          {!user ? (
            <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
              <div className="card">
                <h2 style={{ marginBottom: '16px' }}>Login Required</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Please login or register to make a booking.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <a href="/login" className="btn btn-primary">Login</a>
                  <a href="/register" className="btn btn-secondary">Register</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="two-columns">
              <div>
                <h2 style={{ marginBottom: '24px' }}>Session Information</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Session Type *</label>
                    <select name="sessionType" value={formData.sessionType} onChange={handleChange}>
                      <option value="portrait">Portrait</option>
                      <option value="wedding">Wedding</option>
                      <option value="event">Event</option>
                      <option value="family">Family</option>
                      <option value="commercial">Commercial</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Date *</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Studio or address for outdoor shoot" />
                  </div>
                  <div className="form-group">
                    <label>Additional Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your vision for the shoot..." />
                  </div>

                  <div className="form-group">
                    <label>Terms & Conditions *</label>
                    <div className="terms-box">{termsText}</div>
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                      />
                      <label htmlFor="termsAccepted">
                        I have read and accept the terms and conditions *
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </form>
              </div>

              <div>
                <h2 style={{ marginBottom: '24px' }}>Pricing</h2>
                <div className="card" style={{ marginBottom: '24px' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    A deposit of <strong style={{ color: 'var(--neon-cyan)' }}>${settings.bookingDeposit || '50'}</strong> is required to confirm your booking.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {settings.bookingCancellation || 'Cancellations must be made at least 48 hours before the scheduled session.'}
                  </p>
                </div>

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
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}

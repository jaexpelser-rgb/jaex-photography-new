'use client';

import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <div className="spinner" />;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'banking', label: 'Banking' },
    { id: 'terms', label: 'Terms & Conditions' },
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>Website Settings</h1>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>

      {message && <div className={`alert ${message.includes('!') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

      <div className="category-filter" style={{ justifyContent: 'flex-start', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`category-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>General Settings</h2>
          <div className="form-group">
            <label>Website Name</label>
            <input type="text" value={settings.siteName || ''} onChange={e => handleChange('siteName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Website Description</label>
            <input type="text" value={settings.siteDescription || ''} onChange={e => handleChange('siteDescription', e.target.value)} />
          </div>
          <div className="form-group">
            <label>About Text</label>
            <textarea value={settings.aboutText || ''} onChange={e => handleChange('aboutText', e.target.value)} rows={4} />
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Contact Information</h2>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={settings.contactEmail || ''} onChange={e => handleChange('contactEmail', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" value={settings.contactPhone || ''} onChange={e => handleChange('contactPhone', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={settings.contactAddress || ''} onChange={e => handleChange('contactAddress', e.target.value)} rows={2} />
          </div>
          <div className="neon-divider" />
          <h3 style={{ marginBottom: '16px' }}>Social Media Links</h3>
          <div className="form-group">
            <label>Instagram URL</label>
            <input type="url" value={settings.socialInstagram || ''} onChange={e => handleChange('socialInstagram', e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="form-group">
            <label>Facebook URL</label>
            <input type="url" value={settings.socialFacebook || ''} onChange={e => handleChange('socialFacebook', e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="form-group">
            <label>Twitter URL</label>
            <input type="url" value={settings.socialTwitter || ''} onChange={e => handleChange('socialTwitter', e.target.value)} placeholder="https://twitter.com/..." />
          </div>
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Banking Details</h2>
          <div className="form-group">
            <label>Bank Name</label>
            <input type="text" value={settings.bankName || ''} onChange={e => handleChange('bankName', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input type="text" value={settings.bankAccountNumber || ''} onChange={e => handleChange('bankAccountNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Branch</label>
            <input type="text" value={settings.bankBranch || ''} onChange={e => handleChange('bankBranch', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Account Holder Name</label>
            <input type="text" value={settings.bankAccountHolder || ''} onChange={e => handleChange('bankAccountHolder', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Sort Code</label>
            <input type="text" value={settings.bankSortCode || ''} onChange={e => handleChange('bankSortCode', e.target.value)} />
          </div>
          <div className="neon-divider" />
          <h3 style={{ marginBottom: '16px' }}>Booking Deposit</h3>
          <div className="form-group">
            <label>Deposit Amount ($)</label>
            <input type="number" value={settings.bookingDeposit || '50'} onChange={e => handleChange('bookingDeposit', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Cancellation Policy</label>
            <textarea value={settings.bookingCancellation || ''} onChange={e => handleChange('bookingCancellation', e.target.value)} rows={3} />
          </div>
        </div>
      )}

      {activeTab === 'terms' && (
        <div className="card">
          <h2 style={{ marginBottom: '24px' }}>Terms & Conditions</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            This text will be displayed to users when they make a booking. They must accept these terms before submitting a booking.
          </p>
          <div className="form-group">
            <label>Terms and Conditions Text</label>
            <textarea
              value={settings.termsAndConditions || ''}
              onChange={e => handleChange('termsAndConditions', e.target.value)}
              rows={20}
              style={{ fontFamily: 'monospace', lineHeight: '1.8' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

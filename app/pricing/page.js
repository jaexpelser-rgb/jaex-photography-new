'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Pricing() {
  const [settings, setSettings] = useState({});
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      try {
        setPackages(JSON.parse(data.pricingPackages || '[]'));
      } catch {
        setPackages([]);
      }
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-header">
            <h1>{settings.pricingPageTitle || 'Packages & Pricing'}</h1>
            <p>{settings.pricingPageSubtitle || 'Professional photography packages tailored to your needs'}</p>
          </div>

          {settings.pricingLoyaltyText && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 40px', textAlign: 'center', borderColor: 'var(--neon-pink)' }}>
              <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>🎉 Loyalty Rewards Program</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{settings.pricingLoyaltyText}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {packages.map((pkg, index) => (
              <div
                key={index}
                className="card"
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  padding: '32px 24px',
                  borderColor: pkg.badge ? 'var(--neon-cyan)' : undefined,
                  transform: pkg.badge ? 'scale(1.02)' : undefined,
                }}
              >
                {pkg.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--rainbow-gradient)',
                    color: '#000',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                  }}>
                    {pkg.badge}
                  </div>
                )}
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', marginTop: pkg.badge ? '8px' : 0 }}>{pkg.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>{pkg.description}</p>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  background: 'var(--rainbow-gradient-text)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '24px',
                }}>
                  ${pkg.price}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', textAlign: 'left' }}>
                  {(pkg.features || []).map((feature, i) => (
                    <li key={i} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{ color: 'var(--neon-green)' }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <a href="/booking" className={`btn ${pkg.badge ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }}>
                  Book Now
                </a>
              </div>
            ))}
          </div>

          {packages.length === 0 && (
            <div className="empty-state">
              <h3>Packages coming soon</h3>
              <p>Contact us for custom pricing</p>
            </div>
          )}

          <div className="neon-divider" style={{ margin: '60px auto', maxWidth: '600px' }} />

          <div className="two-columns" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div>
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
            <div>
              <h2 style={{ marginBottom: '16px' }}>Payment Info</h2>
              <div className="card">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  A deposit of <strong style={{ color: 'var(--neon-cyan)' }}>${settings.bookingDeposit || '50'}</strong> is required to confirm your booking.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                  {settings.bookingCancellation || 'Cancellations must be made at least 48 hours before the scheduled session.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}

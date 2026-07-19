'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Setup() {
  const router = useRouter();
  const [adminExists, setAdminExists] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(data => {
      if (data.user && data.user.role === 'admin') {
        router.push('/admin');
      }
    });
    fetch('/api/settings').then(() => {
      fetch('/api/setup/check').then(r => r.json()).then(data => {
        setAdminExists(data.adminExists);
      }).catch(() => setAdminExists(false));
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) return <div className="spinner" />;

  if (adminExists) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '16px' }}>Setup Complete</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Admin account already exists. Use the login page instead.
          </p>
          <a href="/login" className="btn btn-primary" style={{ width: '100%' }}>Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔧 Initial Setup</h1>
        <p className="subtitle">Create your admin account to get started</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Jaex" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

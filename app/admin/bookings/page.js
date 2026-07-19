'use client';

import { useState, useEffect } from 'react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    fetch('/api/bookings').then(r => r.json()).then(setBookings);
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadBookings();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    loadBookings();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div>
      <div className="admin-header">
        <h1>Booking Management</h1>
      </div>

      <div className="category-filter" style={{ justifyContent: 'flex-start', marginBottom: '24px' }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
          <button
            key={f}
            className={`category-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td>{b.date} {b.time}</td>
                  <td>{b.sessionType}</td>
                  <td>{b.location}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {b.status === 'pending' && (
                        <>
                          <button className="btn btn-sm" style={{ background: 'var(--neon-green)', color: '#000' }} onClick={() => updateStatus(b.id, 'confirmed')}>
                            Confirm
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b.id, 'cancelled')}>
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b.id, 'cancelled')}>
                          Cancel
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(b.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

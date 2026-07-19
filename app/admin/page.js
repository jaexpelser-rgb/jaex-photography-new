'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ photos: 0, albums: 0, bookings: 0, pendingBookings: 0, comments: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
      fetch('/api/comments').then(r => r.json()),
      fetch('/api/albums').then(r => r.json()),
    ]).then(([gallery, bookings, comments, albums]) => {
      setStats({
        photos: gallery.length,
        albums: albums.length,
        bookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        comments: comments.length,
      });
      setRecentBookings(bookings.slice(0, 5));
      setRecentAlbums(albums.slice(0, 5));
    });
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Photos</h3>
          <div className="value">{stats.photos}</div>
        </div>
        <div className="stat-card">
          <h3>Client Albums</h3>
          <div className="value">{stats.albums}</div>
        </div>
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <div className="value">{stats.bookings}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Bookings</h3>
          <div className="value">{stats.pendingBookings}</div>
        </div>
        <div className="stat-card">
          <h3>Comments</h3>
          <div className="value">{stats.comments}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ marginBottom: '16px' }}>Recent Bookings</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings yet</td></tr>
                ) : recentBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.date}</td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '16px' }}>Recent Albums</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Album</th>
                  <th>Client</th>
                  <th>Photos</th>
                </tr>
              </thead>
              <tbody>
                {recentAlbums.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No albums yet</td></tr>
                ) : recentAlbums.map(a => (
                  <tr key={a.id}>
                    <td>{a.albumName}</td>
                    <td>{a.clientName}</td>
                    <td>{a.photoCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

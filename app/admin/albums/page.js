'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '', clientEmail: '', albumName: '', sessionDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { loadAlbums(); }, []);

  const loadAlbums = () => {
    fetch('/api/albums').then(r => r.json()).then(setAlbums);
  };

  const openModal = () => {
    setFormData({ clientName: '', clientEmail: '', albumName: '', sessionDate: '' });
    setShowModal(true);
    setMessage('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Album created! Access code: ${data.accessCode}`);
      loadAlbums();
      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this album and all its photos? This cannot be undone.')) return;
    await fetch(`/api/albums/${id}`, { method: 'DELETE' });
    loadAlbums();
  };

  const openPhotos = async (album) => {
    setSelectedAlbum(album);
    const res = await fetch(`/api/albums/${album.id}`);
    const data = await res.json();
    setAlbumPhotos(data.photos || []);
    setShowPhotos(true);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length || !selectedAlbum) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('albumId', selectedAlbum.id);
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const res = await fetch('/api/albums/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`${data.uploaded} photos uploaded!`);
      openPhotos(selectedAlbum);
      loadAlbums();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    await fetch(`/api/albums/photos/${photoId}`, { method: 'DELETE' });
    openPhotos(selectedAlbum);
    loadAlbums();
  };

  const copyAccessLink = (album) => {
    const url = `${window.location.origin}/portal?album=${album.id}&code=${album.accessCode}`;
    navigator.clipboard.writeText(url);
    setMessage('Access link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Client Albums</h1>
        <button className="btn btn-primary" onClick={openModal}>+ New Album</button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {albums.length === 0 ? (
        <div className="empty-state">
          <h3>No albums yet</h3>
          <p>Create an album for your client to access their photos.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Album Name</th>
                <th>Client</th>
                <th>Email</th>
                <th>Photos</th>
                <th>Access Code</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {albums.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: '600' }}>{a.albumName}</td>
                  <td>{a.clientName}</td>
                  <td>{a.clientEmail}</td>
                  <td>{a.photoCount}</td>
                  <td><code style={{ color: 'var(--neon-cyan)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px' }}>{a.accessCode}</code></td>
                  <td>{a.sessionDate || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openPhotos(a)}>Photos</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => copyAccessLink(a)}>Copy Link</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Album</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Client Name *</label>
                <input type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Client Email *</label>
                <input type="email" value={formData.clientEmail} onChange={e => setFormData({...formData, clientEmail: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Album Name *</label>
                <input type="text" value={formData.albumName} onChange={e => setFormData({...formData, albumName: e.target.value})} placeholder="e.g. Wedding Smith 2026" required />
              </div>
              <div className="form-group">
                <label>Session Date</label>
                <input type="date" value={formData.sessionDate} onChange={e => setFormData({...formData, sessionDate: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Album'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPhotos && selectedAlbum && (
        <div className="modal-overlay" onClick={() => setShowPhotos(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2>{selectedAlbum.albumName}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Client: {selectedAlbum.clientName} | Code: <code style={{ color: 'var(--neon-cyan)' }}>{selectedAlbum.accessCode}</code>
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowPhotos(false)}>Close</button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : '📁 Upload Photos'}
                <input
                  type="file"
                  ref={fileRef}
                  multiple
                  accept="image/*"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>

            {albumPhotos.length === 0 ? (
              <div className="empty-state">
                <h3>No photos yet</h3>
                <p>Upload photos for this client.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {albumPhotos.map(photo => (
                  <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
                    <img
                      src={`/albums/${selectedAlbum.id}/${photo.filename}`}
                      alt={photo.originalName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: 'rgba(255,0,68,0.9)', border: 'none', color: 'white',
                        width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

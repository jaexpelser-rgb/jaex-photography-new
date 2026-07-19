'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClientPortal() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/albums/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId: selectedAlbum.id, accessCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhotos(data.photos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = (photo) => {
    const link = document.createElement('a');
    link.href = `/albums/${selectedAlbum.id}/${photo.filename}`;
    link.download = photo.originalName || photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    for (const photo of photos) {
      downloadPhoto(photo);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-header">
            <h1>Client Photo Portal</h1>
            <p>Access and download your photos from your session</p>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>Access Your Photos</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Enter your Album ID and Access Code (provided by your photographer) to view and download your photos.
              </p>

              <form onSubmit={handleAccess}>
                <div className="form-group">
                  <label>Album ID</label>
                  <input
                    type="text"
                    value={selectedAlbum ? selectedAlbum.id : ''}
                    onChange={(e) => {
                      setSelectedAlbum({ id: e.target.value });
                      setPhotos([]);
                      setAccessCode('');
                    }}
                    placeholder="Enter album ID (e.g. abc123)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Access Code</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code (e.g. ABC123)"
                    maxLength={6}
                    required
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Accessing...' : 'Access Photos'}
                </button>
              </form>
            </div>
          </div>

          {photos.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <div className="neon-divider" style={{ maxWidth: '600px', margin: '0 auto 40px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', maxWidth: '1000px', margin: '0 auto 24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem' }}>{selectedAlbum?.albumName || 'Your Photos'}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{photos.length} photos available for download</p>
                </div>
                <button className="btn btn-primary" onClick={downloadAll}>
                  ⬇ Download All
                </button>
              </div>

              <div className="gallery-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {photos.map(photo => (
                  <div key={photo.id} className="gallery-item" onClick={() => setViewPhoto(photo)}>
                    <img src={`/albums/${selectedAlbum.id}/${photo.filename}`} alt={photo.originalName} />
                    <div className="overlay">
                      <h3>{photo.originalName}</h3>
                      <p>{(photo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={(e) => { e.stopPropagation(); downloadPhoto(photo); }}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {viewPhoto && (
        <div className="lightbox" onClick={() => setViewPhoto(null)}>
          <button className="lightbox-close">&times;</button>
          <img
            src={`/albums/${selectedAlbum.id}/${viewPhoto.filename}`}
            alt={viewPhoto.originalName}
            onClick={e => e.stopPropagation()}
          />
          <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <p style={{ color: '#aaa', marginBottom: '12px' }}>{viewPhoto.originalName}</p>
            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); downloadPhoto(viewPhoto); }}>
              ⬇ Download Photo
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

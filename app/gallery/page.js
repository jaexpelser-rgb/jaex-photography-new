'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    fetch('/api/gallery').then(r => r.json()).then(data => {
      setPhotos(data);
      const cats = [...new Set(data.map(p => p.category))];
      setCategories(cats);
    });
  }, []);

  const filtered = activeCategory === 'all'
    ? photos
    : photos.filter(p => p.category === activeCategory);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="page-header">
            <h1>Gallery</h1>
            <p>Browse through our collection of photographs</p>
          </div>

          {categories.length > 0 && (
            <div className="category-filter">
              <button
                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No photos yet</h3>
              <p>Check back soon for new photographs!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filtered.map(photo => (
                <div
                  key={photo.id}
                  className="gallery-item"
                  onClick={() => setLightboxPhoto(photo)}
                >
                  <img src={photo.imageUrl} alt={photo.title} />
                  <div className="overlay">
                    <h3>{photo.title}</h3>
                    <p>{photo.description || photo.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {lightboxPhoto && (
        <div className="lightbox" onClick={() => setLightboxPhoto(null)}>
          <button className="lightbox-close">&times;</button>
          <img src={lightboxPhoto.imageUrl} alt={lightboxPhoto.title} onClick={e => e.stopPropagation()} />
          <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '1.3rem' }}>{lightboxPhoto.title}</h3>
            {lightboxPhoto.description && <p style={{ color: '#aaa', marginTop: '8px' }}>{lightboxPhoto.description}</p>}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

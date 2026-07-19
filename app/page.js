'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Home() {
  const [settings, setSettings] = useState({});
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
    fetch('/api/gallery').then(r => r.json()).then(data => {
      setFeaturedPhotos(data.filter(p => p.featured));
    });
  }, []);

  const nextSlide = useCallback(() => {
    if (featuredPhotos.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % featuredPhotos.length);
  }, [featuredPhotos.length]);

  const prevSlide = useCallback(() => {
    if (featuredPhotos.length === 0) return;
    setCurrentSlide(prev => (prev - 1 + featuredPhotos.length) % featuredPhotos.length);
  }, [featuredPhotos.length]);

  useEffect(() => {
    if (isPaused || featuredPhotos.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, featuredPhotos.length]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero with Auto-Sliding Gallery */}
        <section
          style={{
            position: 'relative',
            height: '80vh',
            minHeight: '500px',
            overflow: 'hidden',
            background: '#000',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {featuredPhotos.length > 0 ? (
            <>
              {/* Slides */}
              {featuredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: index === currentSlide ? 1 : 0,
                    transition: 'opacity 1s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.5)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    zIndex: 2,
                  }}>
                    <h2 style={{
                      fontSize: '2.5rem',
                      marginBottom: '8px',
                      textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                    }}>{photo.title}</h2>
                    {photo.description && (
                      <p style={{
                        color: 'var(--text-secondary)',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                        fontSize: '1.1rem',
                      }}>{photo.description}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Gradient overlay at bottom */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '200px',
                background: 'linear-gradient(transparent, var(--bg-primary))',
                zIndex: 1,
              }} />

              {/* Navigation Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,255,0.3)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.boxShadow = 'none'; }}
              >
                &#10094;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  background: 'rgba(0,0,0,0.5)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--neon-cyan)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,255,0.3)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.boxShadow = 'none'; }}
              >
                &#10095;
              </button>

              {/* Dots */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 3,
              }}>
                {featuredPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      width: index === currentSlide ? '30px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      border: 'none',
                      background: index === currentSlide ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: index === currentSlide ? '0 0 10px rgba(0,255,255,0.5)' : 'none',
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* No featured photos - show default hero */
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(ellipse at center, rgba(255,0,255,0.1) 0%, rgba(0,0,0,1) 70%)',
            }} />
          )}

          {/* Hero Content (always on top) */}
          <div className="container" style={{
            position: 'relative',
            zIndex: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: '24px' }}>
              <img src="/logo.png" alt="Jaex Photography" style={{ height: '120px', width: 'auto' }} />
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              textShadow: '0 2px 30px rgba(0,0,0,0.8)',
            }}>{settings.siteName || 'Jaex Photography'}</h1>
            <p style={{
              fontSize: '1.3rem',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}>{settings.siteDescription || 'Professional Photography Services'}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/gallery" className="btn btn-primary">View Gallery</Link>
              <Link href="/booking" className="btn btn-secondary">Book a Session</Link>
            </div>
          </div>
        </section>

        {/* Featured Work Grid */}
        {featuredPhotos.length > 0 && (
          <section className="page">
            <div className="container">
              <div className="page-header">
                <h2>Featured Work</h2>
                <p>A selection of our best photography</p>
              </div>
              <div className="gallery-grid">
                {featuredPhotos.slice(0, 6).map(photo => (
                  <Link key={photo.id} href="/gallery" className="gallery-item">
                    <img src={photo.imageUrl} alt={photo.title} />
                    <div className="overlay">
                      <h3>{photo.title}</h3>
                      <p>{photo.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="page">
          <div className="container">
            <div className="two-columns">
              <div>
                <h2 style={{ marginBottom: '16px' }}>About Us</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {settings.aboutText || 'Welcome to Jaex Photography. We capture life\'s most precious moments with creativity and passion. Every shot tells a story, every frame preserves a memory.'}
                </p>
              </div>
              <div className="contact-info">
                <h2 style={{ marginBottom: '16px' }}>Contact Info</h2>
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
            </div>
          </div>
        </section>

        <section className="page" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="page-header">
              <h2>Ready to Capture Your Moments?</h2>
              <p>Book a photography session today</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/booking" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                Book Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}

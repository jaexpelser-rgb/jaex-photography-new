'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'general', featured: false, sortOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    fetch('/api/gallery').then(r => r.json()).then(setPhotos);
  };

  const openModal = (photo = null) => {
    if (photo) {
      setEditingPhoto(photo);
      setFormData({
        title: photo.title,
        description: photo.description,
        category: photo.category,
        featured: photo.featured === 1,
        sortOrder: photo.sortOrder,
      });
    } else {
      setEditingPhoto(null);
      setFormData({ title: '', description: '', category: 'general', featured: false, sortOrder: 0 });
      setImageFile(null);
    }
    setShowModal(true);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('featured', formData.featured.toString());
    fd.append('sortOrder', formData.sortOrder.toString());
    if (imageFile) fd.append('image', imageFile);

    try {
      const url = editingPhoto ? `/api/gallery/${editingPhoto.id}` : '/api/gallery';
      const res = await fetch(url, { method: editingPhoto ? 'PUT' : 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(editingPhoto ? 'Photo updated!' : 'Photo uploaded!');
      loadPhotos();
      setTimeout(() => { setShowModal(false); setMessage(''); }, 1500);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this photo?')) return;
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    loadPhotos();
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Gallery Management</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Photo</button>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <h3>No photos yet</h3>
          <p>Upload your first photo to get started!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map(photo => (
            <div key={photo.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{photo.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {photo.category} {photo.featured ? '⭐ Featured' : ''}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openModal(photo)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(photo.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPhoto ? 'Edit Photo' : 'Upload Photo'}</h2>
            {message && <div className={`alert ${message.includes('!') ? 'alert-success' : 'alert-error'}`}>{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. portrait, wedding, nature" />
              </div>
              <div className="form-group">
                <label>Image {!editingPhoto && '*'}</label>
                <input type="file" accept="image/*" ref={fileRef} onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} />
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                <label htmlFor="featured">Featured Photo</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

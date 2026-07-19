'use client';

import { useState, useEffect } from 'react';

export default function AdminPricing() {
  const [settings, setSettings] = useState({});
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(data);
      try {
        setPackages(JSON.parse(data.pricingPackages || '[]'));
      } catch {
        setPackages([]);
      }
      setLoading(false);
    });
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePackage = (index, field, value) => {
    setPackages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addFeature = (index) => {
    setPackages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], features: [...(updated[index].features || []), ''] };
      return updated;
    });
  };

  const updateFeature = (pkgIndex, featureIndex, value) => {
    setPackages(prev => {
      const updated = [...prev];
      const features = [...(updated[pkgIndex].features || [])];
      features[featureIndex] = value;
      updated[pkgIndex] = { ...updated[pkgIndex], features };
      return updated;
    });
  };

  const removeFeature = (pkgIndex, featureIndex) => {
    setPackages(prev => {
      const updated = [...prev];
      const features = [...(updated[pkgIndex].features || [])];
      features.splice(featureIndex, 1);
      updated[pkgIndex] = { ...updated[pkgIndex], features };
      return updated;
    });
  };

  const addPackage = () => {
    setPackages(prev => [...prev, { name: 'New Package', price: '0', description: '', features: ['Feature 1'], badge: '' }]);
    setEditingIndex(packages.length);
  };

  const removePackage = (index) => {
    if (!confirm('Remove this package?')) return;
    setPackages(prev => prev.filter((_, i) => i !== index));
    setEditingIndex(-1);
  };

  const handleSave = async () => {
    setMessage('');
    const updatedSettings = {
      ...settings,
      pricingPackages: JSON.stringify(packages),
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data);
      setMessage('Pricing saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="admin-header">
        <h1>Pricing & Packages</h1>
        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Page Settings</h2>
        <div className="form-group">
          <label>Page Title</label>
          <input type="text" value={settings.pricingPageTitle || ''} onChange={e => updateSetting('pricingPageTitle', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Page Subtitle</label>
          <input type="text" value={settings.pricingPageSubtitle || ''} onChange={e => updateSetting('pricingPageSubtitle', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Loyalty Rewards Text</label>
          <textarea value={settings.pricingLoyaltyText || ''} onChange={e => updateSetting('pricingLoyaltyText', e.target.value)} rows={3} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Packages</h2>
        <button className="btn btn-primary" onClick={addPackage}>+ Add Package</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {packages.map((pkg, index) => (
          <div key={index} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Package {index + 1}</h3>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => removePackage(index)}
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              >
                Remove
              </button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input type="text" value={pkg.name} onChange={e => updatePackage(index, 'name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input type="text" value={pkg.price} onChange={e => updatePackage(index, 'price', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={pkg.description} onChange={e => updatePackage(index, 'description', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Badge (optional, e.g. POPULAR, BEST VALUE)</label>
              <input type="text" value={pkg.badge || ''} onChange={e => updatePackage(index, 'badge', e.target.value)} placeholder="Leave empty for no badge" />
            </div>

            <div className="form-group">
              <label>Features</label>
              {(pkg.features || []).map((feature, fi) => (
                <div key={fi} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={feature}
                    onChange={e => updateFeature(index, fi, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-sm btn-danger" onClick={() => removeFeature(index, fi)} style={{ padding: '4px 8px' }}>×</button>
                </div>
              ))}
              <button className="btn btn-sm btn-secondary" onClick={() => addFeature(index)}>+ Add Feature</button>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="empty-state">
          <h3>No packages yet</h3>
          <p>Click "Add Package" to create your first pricing package.</p>
        </div>
      )}
    </div>
  );
}

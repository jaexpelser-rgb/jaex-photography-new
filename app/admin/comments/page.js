'use client';

import { useState, useEffect } from 'react';

export default function AdminComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = () => {
    fetch('/api/comments').then(r => r.json()).then(setComments);
  };

  const toggleApproval = async (id, approved) => {
    await fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: !approved }),
    });
    loadComments();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    loadComments();
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Comment Management</h1>
      </div>

      {comments.length === 0 ? (
        <div className="empty-state">
          <h3>No comments yet</h3>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(c => (
                <tr key={c.id}>
                  <td>{c.userName || 'Unknown'}</td>
                  <td style={{ maxWidth: '400px' }}>{c.content}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.approved ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {c.approved ? 'Approved' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => toggleApproval(c.id, c.approved)}>
                        {c.approved ? 'Hide' : 'Approve'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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

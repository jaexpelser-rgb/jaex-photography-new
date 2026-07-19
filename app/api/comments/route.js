import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const galleryId = url.searchParams.get('galleryId');

    const db = getDb();
    let comments;
    if (galleryId) {
      comments = db.prepare(
        `SELECT c.*, u.name as userName FROM comments c
         LEFT JOIN users u ON c.userId = u.id
         WHERE c.galleryId = ? AND c.approved = 1
         ORDER BY c.createdAt DESC`
      ).all(galleryId);
    } else {
      const user = requireAuth(request, { adminOnly: true });
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      comments = db.prepare(
        `SELECT c.*, u.name as userName FROM comments c
         LEFT JOIN users u ON c.userId = u.id
         ORDER BY c.createdAt DESC`
      ).all();
    }
    return Response.json(comments);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = requireAuth(request);
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { galleryId, content } = await request.json();

    if (!content || !content.trim()) {
      return Response.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      'INSERT INTO comments (id, userId, galleryId, content) VALUES (?, ?, ?, ?)'
    ).run(id, user.id, galleryId || null, content.trim());

    const comment = db.prepare(
      `SELECT c.*, u.name as userName FROM comments c
       LEFT JOIN users u ON c.userId = u.id
       WHERE c.id = ?`
    ).get(id);

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

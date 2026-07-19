import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const albums = db.prepare('SELECT * FROM client_albums ORDER BY createdAt DESC').all();
    return Response.json(albums);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { clientName, clientEmail, albumName, sessionDate } = body;

    if (!clientName || !clientEmail || !albumName) {
      return Response.json({ error: 'Client name, email, and album name are required' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    db.prepare(
      'INSERT INTO client_albums (id, clientName, clientEmail, albumName, accessCode, sessionDate) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, clientName, clientEmail, albumName, accessCode, sessionDate || null);

    const album = db.prepare('SELECT * FROM client_albums WHERE id = ?').get(id);
    return Response.json(album, { status: 201 });
  } catch (error) {
    console.error('Album POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

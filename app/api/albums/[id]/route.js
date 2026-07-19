import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = getDb();
    const album = db.prepare('SELECT * FROM client_albums WHERE id = ?').get(id);
    if (!album) {
      return Response.json({ error: 'Album not found' }, { status: 404 });
    }
    const photos = db.prepare('SELECT * FROM album_photos WHERE albumId = ? ORDER BY sortOrder ASC').all(id);
    return Response.json({ ...album, photos });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { clientName, clientEmail, albumName, sessionDate, accessCode } = body;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM client_albums WHERE id = ?').get(id);
    if (!existing) {
      return Response.json({ error: 'Album not found' }, { status: 404 });
    }

    db.prepare(
      'UPDATE client_albums SET clientName = ?, clientEmail = ?, albumName = ?, sessionDate = ?, accessCode = ? WHERE id = ?'
    ).run(
      clientName || existing.clientName,
      clientEmail || existing.clientEmail,
      albumName || existing.albumName,
      sessionDate ?? existing.sessionDate,
      accessCode || existing.accessCode,
      id
    );

    const album = db.prepare('SELECT * FROM client_albums WHERE id = ?').get(id);
    return Response.json(album);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = getDb();

    const photos = db.prepare('SELECT * FROM album_photos WHERE albumId = ?').all(id);
    for (const photo of photos) {
      const filePath = require('path').join(process.cwd(), 'public', 'albums', photo.filename);
      const { unlink } = require('fs/promises');
      await unlink(filePath).catch(() => {});
    }

    db.prepare('DELETE FROM album_photos WHERE albumId = ?').run(id);
    db.prepare('DELETE FROM client_albums WHERE id = ?').run(id);
    return Response.json({ message: 'Album deleted' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

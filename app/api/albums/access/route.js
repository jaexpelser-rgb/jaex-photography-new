import { getDb } from '../../../../lib/db';

export async function POST(request) {
  try {
    const { albumId, accessCode } = await request.json();

    if (!albumId || !accessCode) {
      return Response.json({ error: 'Album ID and access code are required' }, { status: 400 });
    }

    const db = getDb();
    const album = db.prepare(
      'SELECT id, clientName, clientEmail, albumName, accessCode, sessionDate, photoCount, createdAt FROM client_albums WHERE id = ? AND accessCode = ?'
    ).get(albumId, accessCode.trim().toUpperCase());

    if (!album) {
      return Response.json({ error: 'Invalid access code or album not found' }, { status: 401 });
    }

    const photos = db.prepare('SELECT id, filename, originalName, fileSize FROM album_photos WHERE albumId = ? ORDER BY sortOrder ASC').all(albumId);

    return Response.json({ album, photos });
  } catch (error) {
    console.error('Album access error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

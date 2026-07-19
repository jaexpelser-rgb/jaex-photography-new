import { getDb } from '../../../../../lib/db';
import { requireAuth } from '../../../../../lib/auth';

export async function DELETE(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = getDb();

    const photo = db.prepare('SELECT * FROM album_photos WHERE id = ?').get(id);
    if (!photo) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }

    const filePath = require('path').join(process.cwd(), 'public', 'albums', photo.filename);
    const { unlink } = require('fs/promises');
    await unlink(filePath).catch(() => {});

    db.prepare('DELETE FROM album_photos WHERE id = ?').run(id);
    db.prepare('UPDATE client_albums SET photoCount = photoCount - 1 WHERE id = ?').run(photo.albumId);

    return Response.json({ message: 'Photo deleted' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

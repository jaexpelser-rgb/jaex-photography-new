import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const albumId = formData.get('albumId');
    const files = formData.getAll('files');

    if (!albumId || !files.length) {
      return Response.json({ error: 'Album ID and files are required' }, { status: 400 });
    }

    const db = getDb();
    const album = db.prepare('SELECT * FROM client_albums WHERE id = ?').get(albumId);
    if (!album) {
      return Response.json({ error: 'Album not found' }, { status: 404 });
    }

    const albumDir = path.join(process.cwd(), 'public', 'albums', albumId);
    await mkdir(albumDir, { recursive: true });

    const insertPhoto = db.prepare(
      'INSERT INTO album_photos (id, albumId, filename, originalName, fileSize, sortOrder) VALUES (?, ?, ?, ?, ?, ?)'
    );

    let sortOrder = db.prepare('SELECT MAX(sortOrder) as maxOrder FROM album_photos WHERE albumId = ?').get(albumId)?.maxOrder || 0;

    const uploaded = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      await writeFile(path.join(albumDir, filename), buffer);

      sortOrder++;
      const id = uuidv4();
      insertPhoto.run(id, albumId, filename, file.name, file.size, sortOrder);
      uploaded.push({ id, filename, originalName: file.name });
    }

    db.prepare('UPDATE client_albums SET photoCount = photoCount + ? WHERE id = ?').run(uploaded.length, albumId);

    return Response.json({ uploaded: uploaded.length, photos: uploaded }, { status: 201 });
  } catch (error) {
    console.error('Album upload error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

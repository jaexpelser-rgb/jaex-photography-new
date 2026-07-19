import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const db = getDb();
    const photo = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!photo) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }
    return Response.json(photo);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!existing) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get('title') || existing.title;
    const description = formData.get('description') ?? existing.description;
    const category = formData.get('category') || existing.category;
    const featured = formData.get('featured') === 'true' ? 1 : 0;
    const sortOrder = parseInt(formData.get('sortOrder') ?? existing.sortOrder);
    const image = formData.get('image');

    let imageUrl = existing.imageUrl;
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = require('path').extname(image.name) || '.jpg';
      const { v4: uuidv4 } = require('uuid');
      const filename = `${uuidv4()}${ext}`;
      const { writeFile, mkdir } = require('fs/promises');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    db.prepare(
      'UPDATE gallery SET title = ?, description = ?, category = ?, featured = ?, sortOrder = ?, imageUrl = ? WHERE id = ?'
    ).run(title, description, category, featured, sortOrder, imageUrl, id);

    const photo = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    return Response.json(photo);
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    if (!existing) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);

    if (existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
      const filePath = require('path').join(process.cwd(), 'public', existing.imageUrl);
      const { unlink } = require('fs/promises');
      await unlink(filePath).catch(() => {});
    }

    return Response.json({ message: 'Photo deleted' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const db = getDb();
    const photos = db.prepare('SELECT * FROM gallery ORDER BY sortOrder ASC, createdAt DESC').all();
    return Response.json(photos);
  } catch (error) {
    console.error('Gallery GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description') || '';
    const category = formData.get('category') || 'general';
    const featured = formData.get('featured') === 'true' ? 1 : 0;
    const sortOrder = parseInt(formData.get('sortOrder') || '0');
    const image = formData.get('image');

    if (!title || !image) {
      return Response.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(image.name) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const id = uuidv4();
    const db = getDb();
    db.prepare(
      'INSERT INTO gallery (id, title, description, imageUrl, category, sortOrder, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, title, description, `/uploads/${filename}`, category, sortOrder, featured);

    const photo = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    return Response.json(photo, { status: 201 });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

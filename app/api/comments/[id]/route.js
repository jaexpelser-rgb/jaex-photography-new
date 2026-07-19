import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function PUT(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { approved } = await request.json();

    const db = getDb();
    db.prepare('UPDATE comments SET approved = ? WHERE id = ?').run(approved ? 1 : 0, id);
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    return Response.json(comment);
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
    db.prepare('DELETE FROM comments WHERE id = ?').run(id);
    return Response.json({ message: 'Comment deleted' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

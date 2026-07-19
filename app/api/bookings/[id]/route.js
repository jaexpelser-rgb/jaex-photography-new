import { getDb } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

export async function PUT(request, { params }) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!existing) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    return Response.json(booking);
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
    db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    return Response.json({ message: 'Booking deleted' });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

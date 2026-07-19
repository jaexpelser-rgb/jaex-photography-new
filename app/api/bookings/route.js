import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    const bookings = db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all();
    return Response.json(bookings);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const user = requireAuth(request);
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, email, phone, date, time, location, sessionType, message, termsAccepted } = body;

    if (!name || !email || !date || !location || !sessionType) {
      return Response.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    if (!termsAccepted) {
      return Response.json({ error: 'You must accept the terms and conditions' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    db.prepare(
      `INSERT INTO bookings (id, userId, name, email, phone, date, time, location, sessionType, message, termsAccepted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, user.id, name, email, phone || '', date, time || '', location, sessionType, message || '', 1);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    return Response.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

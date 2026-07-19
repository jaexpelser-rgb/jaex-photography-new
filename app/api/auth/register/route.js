import { getDb } from '../../../../lib/db';
import { hashPassword, createSessionToken, createCookieHeader } from '../../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const id = uuidv4();
    const hashedPassword = hashPassword(password);

    db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(
      id, name, email, hashedPassword, 'user'
    );

    const token = createSessionToken(id);

    return Response.json(
      { user: { id, name, email, role: 'user' }, message: 'Registration successful' },
      { status: 200, headers: { 'Set-Cookie': createCookieHeader(token) } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

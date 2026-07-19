import { getDb } from '../../../../lib/db';
import { verifyPassword, createSessionToken, createCookieHeader } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !verifyPassword(password, user.password)) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createSessionToken(user.id);

    return Response.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role }, message: 'Login successful' },
      { status: 200, headers: { 'Set-Cookie': createCookieHeader(token) } }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

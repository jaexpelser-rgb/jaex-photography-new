import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = {};
    for (const s of settings) {
      settingsObj[s.key] = s.value;
    }
    return Response.json(settingsObj);
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const user = requireAuth(request, { adminOnly: true });
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const settings = await request.json();
    const db = getDb();

    const upsert = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );

    const updateMany = db.transaction((entries) => {
      for (const [key, value] of entries) {
        upsert.run(key, String(value));
      }
    });

    updateMany(Object.entries(settings));

    const updated = db.prepare('SELECT * FROM settings').all();
    const settingsObj = {};
    for (const s of updated) {
      settingsObj[s.key] = s.value;
    }
    return Response.json(settingsObj);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

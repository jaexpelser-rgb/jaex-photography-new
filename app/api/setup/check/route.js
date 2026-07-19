import { getDb } from '../../../../lib/db';

export async function GET() {
  try {
    const db = getDb();
    const admin = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
    return Response.json({ adminExists: !!admin });
  } catch (error) {
    return Response.json({ adminExists: false });
  }
}

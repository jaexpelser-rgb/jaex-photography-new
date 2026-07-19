import { getSessionFromRequest, createClearCookieHeader } from '../../../../lib/auth';

export async function GET(request) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return Response.json({ user: null });
  }
  return Response.json({ user });
}

export async function DELETE() {
  return Response.json(
    { message: 'Logged out' },
    { headers: { 'Set-Cookie': createClearCookieHeader() } }
  );
}

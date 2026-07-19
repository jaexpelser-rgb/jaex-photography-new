const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getDb } = require('./db');

const SECRET_KEY = process.env.SESSION_SECRET || 'photography-website-secret-key-change-in-production';
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function createSessionToken(userId) {
  const payload = JSON.stringify({ userId, expires: Date.now() + SESSION_EXPIRY });
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function verifySessionToken(token) {
  try {
    if (!token) return null;
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');

    if (signature !== expectedSig) return null;

    const data = JSON.parse(payload);
    if (data.expires < Date.now()) return null;

    const db = getDb();
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(data.userId);
    return user || null;
  } catch {
    return null;
  }
}

function createCookieHeader(token) {
  return `session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_EXPIRY / 1000}; SameSite=Lax`;
}

function createClearCookieHeader() {
  return 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
}

function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
  return verifySessionToken(cookies.session);
}

function requireAuth(request, options = {}) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return null;
  }
  if (options.adminOnly && user.role !== 'admin') {
    return null;
  }
  return user;
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  createCookieHeader,
  createClearCookieHeader,
  getSessionFromRequest,
  requireAuth,
};

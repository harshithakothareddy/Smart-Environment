const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'econexus-dev-secret-change-in-production';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Hash a plaintext password with a random 16-byte salt using scrypt.
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/**
 * Verify a plaintext password against a stored "salt:hash" string.
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHex] = storedHash.split(':');
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(JSON.stringify(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

/**
 * Sign an HMAC-SHA256 JWT token.
 */
function signToken(payload, ttlSeconds = TOKEN_TTL_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds };
  const encodedHeader = base64UrlEncode(header);
  const encodedBody = base64UrlEncode(body);
  const signature = base64UrlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(`${encodedHeader}.${encodedBody}`).digest()
  );
  return `${encodedHeader}.${encodedBody}.${signature}`;
}

/**
 * Verify an HMAC-SHA256 JWT token and return its decoded payload, or null if invalid/expired.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedBody, signature] = parts;
  const expectedSig = base64UrlEncode(
    crypto.createHmac('sha256', JWT_SECRET).update(`${encodedHeader}.${encodedBody}`).digest()
  );

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = base64UrlDecode(encodedBody);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Express middleware requiring a valid Bearer JWT.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
  }

  req.userId = decoded.userId;
  req.userRole = decoded.role || 'Citizen';
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authMiddleware,
};


const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365;

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters.');
  return new TextEncoder().encode(secret);
}

function encode(value: Uint8Array | string) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decode(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

export async function createSessionToken(userId: string, version = 0) {
  const payload = encode(JSON.stringify({ sub: userId, ver: version, mode: 'guest', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  const key = await crypto.subtle.importKey('raw', sessionKey(), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function readSessionToken(token?: string | null) {
  if (!token) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;
  try {
    const key = await crypto.subtle.importKey('raw', sessionKey(), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, decode(signature), new TextEncoder().encode(payload));
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(decode(payload))) as { sub?: unknown; ver?: unknown; mode?: unknown; exp?: unknown };
    if (typeof claims.sub !== 'string' || typeof claims.ver !== 'number' || claims.mode !== 'guest' || typeof claims.exp !== 'number' || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { userId: claims.sub, version: claims.ver, mode: 'guest' as const };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token?: string | null) { return (await readSessionToken(token)) !== null; }

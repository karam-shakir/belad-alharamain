import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/* ─────────────────────────────────────────────────────────────
 * Signed session cookies (admin authentication)
 * ─────────────────────────────────────────────────────────────
 *  - HS256 signed with SESSION_SECRET env var
 *  - 7-day expiry
 *  - HttpOnly + Secure + SameSite=Lax cookie
 *  - constant-time password comparison
 * ───────────────────────────────────────────────────────────── */

export const COOKIE_NAME = 'belad_admin_session';
const SESSION_TTL_DAYS  = 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET env var is not set');
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: 'admin'; iat: number; exp: number };

/* ── Create a signed JWT for the session ─── */
export async function createSessionToken(): Promise<string> {
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(secret());
}

/* ── Verify token; returns payload or null ─── */
export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (payload.sub !== 'admin') return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/* ── Helpers for Server Components / Route Handlers ─── */
export async function setSessionCookie(): Promise<void> {
  const token = await createSessionToken();
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export async function readSession(): Promise<SessionPayload | null> {
  return verifySessionToken(cookies().get(COOKIE_NAME)?.value);
}

/* ── Constant-time password comparison ─── */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { readSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ─────────────────────────────────────────────────────────────
 * Diagnostic endpoint — auth-protected
 * Visit GET /api/admin/debug while logged in.
 * Returns env presence + a live KV ping. No secrets exposed.
 * ───────────────────────────────────────────────────────────── */
export async function GET() {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const env = {
    KV_REST_API_URL:        Boolean(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN:      Boolean(process.env.KV_REST_API_TOKEN),
    KV_URL:                 Boolean(process.env.KV_URL),
    BLOB_READ_WRITE_TOKEN:  Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    RESEND_API_KEY:         Boolean(process.env.RESEND_API_KEY),
    CONTACT_TO_EMAIL:       Boolean(process.env.CONTACT_TO_EMAIL),
    ADMIN_PASSWORD:         Boolean(process.env.ADMIN_PASSWORD),
    SESSION_SECRET:         Boolean(process.env.SESSION_SECRET),
  };

  const kvTest: { ping?: string; write?: string; read?: string; del?: string; zcard?: number; error?: string } = {};

  try {
    // Round-trip write/read/delete to confirm KV is reachable + writable
    const probeKey = '__probe__';
    const probeValue = `ts:${Date.now()}`;
    await kv.set(probeKey, probeValue, { ex: 60 });
    kvTest.write = 'ok';
    const got = await kv.get<string>(probeKey);
    kvTest.read = got === probeValue ? 'ok' : `mismatch (got: ${String(got).slice(0, 40)})`;
    await kv.del(probeKey);
    kvTest.del = 'ok';
    // How many submissions exist in the index?
    kvTest.zcard = await kv.zcard('submissions:all');
    kvTest.ping  = 'ok';
  } catch (e) {
    kvTest.error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({ ok: true, env, kvTest });
}

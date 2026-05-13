import { kv } from '@vercel/kv';

/* ─────────────────────────────────────────────────────────────
 * Pilgrim records — Hajj completion certificate data layer
 *
 * KV schema:
 *   pilgrim:<nationalId>           → hash (all fields)
 *   pilgrim:verify:<verifyCode>    → string (the nationalId, for QR lookup)
 *   pilgrims:all                   → sorted set, score=createdAt, member=nationalId
 *
 * Lookup keyed by nationalId is direct (O(1)).
 * Lookup keyed by verifyCode is two-step (code → nationalId → hash).
 * ───────────────────────────────────────────────────────────── */

export interface Pilgrim {
  /* Identity */
  nationalId:    string;           // 10 digits — primary key
  name:          string;           // Arabic full name (as in CSV)
  hajjYear:      string;           // e.g. '1447'
  country?:      string;           // optional

  /* Verification */
  verifyCode:    string;           // 8-char URL-safe code for QR

  /* Revocation */
  revokedAt?:    number;           // ms epoch
  revokeReason?: string;

  /* Engagement */
  viewCount:     number;
  lastViewedAt?: number;

  /* Audit */
  createdAt:     number;
  updatedAt:     number;
}

const INDEX_KEY = 'pilgrims:all';
const itemKey    = (nid: string)  => `pilgrim:${nid}`;
const verifyKey  = (code: string) => `pilgrim:verify:${code}`;

/* ── Validation helpers ─── */
export function isValidNationalId(id: string): boolean {
  return /^\d{10}$/.test(id);
}

export function generateVerifyCode(): string {
  // 8-char alphanumeric (case-sensitive), ~218 trillion combinations
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no I, O, 0, 1 (visual clarity)
  let code = '';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null) out[k] = v;
  return out;
}

/* ── Create or replace (replaces if same nationalId exists) ─── */
export async function upsertPilgrim(
  data: Pick<Pilgrim, 'nationalId' | 'name' | 'hajjYear'> & { country?: string },
): Promise<Pilgrim> {
  if (!isValidNationalId(data.nationalId))
    throw new Error('رقم الهوية يجب أن يكون 10 أرقام');
  if (!data.name?.trim()) throw new Error('الاسم مطلوب');
  if (!data.hajjYear?.trim()) throw new Error('سنة الحج مطلوبة');

  const now = Date.now();
  const existing = await getPilgrim(data.nationalId);

  // Re-use verifyCode if pilgrim exists (so previously-issued QR stays valid)
  const verifyCode = existing?.verifyCode ?? generateVerifyCode();

  const pilgrim: Pilgrim = {
    nationalId: data.nationalId,
    name:       data.name.trim(),
    hajjYear:   data.hajjYear.trim(),
    country:    data.country?.trim() || undefined,
    verifyCode,
    viewCount:  existing?.viewCount ?? 0,
    lastViewedAt: existing?.lastViewedAt,
    revokedAt:    existing?.revokedAt,
    revokeReason: existing?.revokeReason,
    createdAt:  existing?.createdAt ?? now,
    updatedAt:  now,
  };

  await kv.hset(itemKey(pilgrim.nationalId), clean(pilgrim as unknown as Record<string, unknown>));
  await kv.set(verifyKey(verifyCode), pilgrim.nationalId);
  await kv.zadd(INDEX_KEY, { score: pilgrim.createdAt, member: pilgrim.nationalId });
  return pilgrim;
}

/* Coerce a raw KV record into a strict Pilgrim shape. KV may return strings,
 * numbers, or missing fields depending on history — this guarantees safe types. */
function normalize(raw: Record<string, unknown> | null | undefined): Pilgrim | null {
  if (!raw || !raw.nationalId) return null;
  const num = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '') { const n = Number(v); return Number.isFinite(n) ? n : 0; }
    return 0;
  };
  const str = (v: unknown): string => (v == null ? '' : String(v));
  return {
    nationalId:   str(raw.nationalId),
    name:         str(raw.name),
    hajjYear:     str(raw.hajjYear),
    country:      raw.country      ? str(raw.country)      : undefined,
    verifyCode:   str(raw.verifyCode),
    revokedAt:    raw.revokedAt    ? (num(raw.revokedAt)    || undefined) : undefined,
    revokeReason: raw.revokeReason ? str(raw.revokeReason) : undefined,
    viewCount:    num(raw.viewCount),
    lastViewedAt: raw.lastViewedAt ? (num(raw.lastViewedAt) || undefined) : undefined,
    createdAt:    num(raw.createdAt),
    updatedAt:    num(raw.updatedAt),
  };
}

/* ── Lookup by national ID ─── */
export async function getPilgrim(nationalId: string): Promise<Pilgrim | null> {
  if (!isValidNationalId(nationalId)) return null;
  const data = await kv.hgetall<Record<string, unknown>>(itemKey(nationalId));
  return normalize(data);
}

/* ── Lookup by verify code (QR scan) ─── */
export async function getPilgrimByVerifyCode(code: string): Promise<Pilgrim | null> {
  if (!/^[A-Z2-9]{8}$/.test(code)) return null;
  const nid = await kv.get<string>(verifyKey(code));
  if (!nid) return null;
  return getPilgrim(nid);
}

/* ── Mark a view (engagement tracking) ─── */
export async function markViewed(nationalId: string): Promise<void> {
  const p = await getPilgrim(nationalId);
  if (!p) return;
  await kv.hset(itemKey(nationalId), {
    viewCount: (p.viewCount ?? 0) + 1,
    lastViewedAt: Date.now(),
  });
}

/* ── Update name / country / year ─── */
export async function updatePilgrim(
  nationalId: string,
  patch: Partial<Pick<Pilgrim, 'name' | 'hajjYear' | 'country'>>,
): Promise<Pilgrim | null> {
  const existing = await getPilgrim(nationalId);
  if (!existing) return null;
  const updated: Pilgrim = {
    ...existing,
    name:     patch.name?.trim()     ?? existing.name,
    hajjYear: patch.hajjYear?.trim() ?? existing.hajjYear,
    country:  patch.country?.trim() || existing.country,
    updatedAt: Date.now(),
  };
  await kv.hset(itemKey(nationalId), clean(updated as unknown as Record<string, unknown>));
  return updated;
}

/* ── Revoke / un-revoke ─── */
export async function revokePilgrim(nationalId: string, reason: string): Promise<Pilgrim | null> {
  const existing = await getPilgrim(nationalId);
  if (!existing) return null;
  const updated: Pilgrim = {
    ...existing,
    revokedAt: Date.now(),
    revokeReason: reason.slice(0, 500),
    updatedAt: Date.now(),
  };
  await kv.hset(itemKey(nationalId), clean(updated as unknown as Record<string, unknown>));
  return updated;
}

export async function unrevokePilgrim(nationalId: string): Promise<Pilgrim | null> {
  const existing = await getPilgrim(nationalId);
  if (!existing) return null;
  // Use empty strings (KV/HSET can't unset fields easily; admin UI hides empty)
  await kv.hset(itemKey(nationalId), { revokedAt: 0, revokeReason: '', updatedAt: Date.now() });
  return { ...existing, revokedAt: undefined, revokeReason: undefined, updatedAt: Date.now() };
}

/* ── Delete completely ─── */
export async function deletePilgrim(nationalId: string): Promise<boolean> {
  const existing = await getPilgrim(nationalId);
  if (!existing) return false;
  await kv.del(itemKey(nationalId));
  await kv.del(verifyKey(existing.verifyCode));
  await kv.zrem(INDEX_KEY, nationalId);
  return true;
}

/* ── List (most recent first) ─── */
export async function listPilgrims(limit = 1000): Promise<Pilgrim[]> {
  const ids = await kv.zrange<string[]>(INDEX_KEY, 0, limit - 1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall(itemKey(id)));
  const results = await pipe.exec<Record<string, unknown>[]>();
  return results
    .map(r => normalize(r))
    .filter((p): p is Pilgrim => p !== null);
}

/* ── Bulk upsert with validation result ─── */
export interface BulkResult {
  added:     number;
  updated:   number;
  duplicates: number;       // rows that already existed and were intentionally skipped
  skipped:   { row: number; reason: string; data?: Record<string, string> }[];
}

export interface BulkOptions {
  /** When true (default): existing pilgrims are NOT touched, counted as duplicates.
   *  When false: existing pilgrims are updated with the new row's data. */
  skipExisting?: boolean;
}

export async function bulkUpsertPilgrims(
  rows: { nationalId: string; name: string; hajjYear: string; country?: string }[],
  opts: BulkOptions = {},
): Promise<BulkResult> {
  const skipExisting = opts.skipExisting !== false;     // default ON
  const result: BulkResult = { added: 0, updated: 0, duplicates: 0, skipped: [] };

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if (!isValidNationalId(r.nationalId)) {
        result.skipped.push({ row: i + 1, reason: 'رقم هوية غير صحيح (10 أرقام)', data: r });
        continue;
      }
      if (!r.name?.trim()) {
        result.skipped.push({ row: i + 1, reason: 'الاسم فارغ', data: r });
        continue;
      }
      if (!r.hajjYear?.trim()) {
        result.skipped.push({ row: i + 1, reason: 'سنة الحج فارغة', data: r });
        continue;
      }
      const existed = await getPilgrim(r.nationalId);

      if (existed && skipExisting) {
        result.duplicates++;
        continue;
      }

      await upsertPilgrim(r);
      if (existed) result.updated++; else result.added++;
    } catch (e) {
      result.skipped.push({ row: i + 1, reason: e instanceof Error ? e.message : 'خطأ', data: r });
    }
  }
  return result;
}

/* ── Stats ─── */
export interface PilgrimsStats {
  total:    number;
  viewed:   number;        // pilgrims who viewed at least once
  revoked:  number;
  byYear:   Record<string, number>;
}

export async function getPilgrimsStats(): Promise<PilgrimsStats> {
  const all = await listPilgrims(5000);
  const stats: PilgrimsStats = { total: all.length, viewed: 0, revoked: 0, byYear: {} };
  for (const p of all) {
    if ((p.viewCount ?? 0) > 0) stats.viewed++;
    if (p.revokedAt) stats.revoked++;
    stats.byYear[p.hajjYear] = (stats.byYear[p.hajjYear] ?? 0) + 1;
  }
  return stats;
}

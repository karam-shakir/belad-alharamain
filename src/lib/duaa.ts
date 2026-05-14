import { kv } from '@vercel/kv';
import { getPilgrim } from '@/lib/pilgrims';

/* ─────────────────────────────────────────────────────────────
 * "تذكروني في دعائكم" — public prayer wall
 *
 * KV schema:
 *   duaa:<id>                  → hash with all fields
 *   duaa:all                   → sorted set, score=createdAt
 *   duaa:popular               → sorted set, score=reactionCount
 *   duaa:react:<id>:<ipHash>   → marker, prevents double-counting per IP
 *                                (TTL: 30 days)
 *
 * Notes:
 *   - All entries are PUBLIC by design (community of mutual prayer).
 *   - Anyone may submit; verified pilgrims get a hajjYear badge.
 *   - Reactions are idempotent per IP per duaa.
 *   - Content filtered for obvious abuse (URLs, phone numbers).
 * ───────────────────────────────────────────────────────────── */

export interface Duaa {
  id:                    string;
  name:                  string;          // empty = "زائر كريم"
  country:               string;          // empty = "—"
  message:               string;
  /* If submitter entered a valid Hajj nationalId, store the year for the badge */
  hajjYear?:             string;          // e.g. '1447'
  reactionCount:         number;          // total reactions
  reactionCountPilgrims: number;          // reactions from verified pilgrims only
  replyCount:            number;          // number of free-text prayer replies
  hidden?:               boolean;
  ip:                    string;
  createdAt:             number;
  updatedAt:             number;
}

export interface DuaaReply {
  id:        string;
  duaaId:    string;
  name:      string;
  country:   string;
  hajjYear?: string;
  message:   string;
  hidden?:   boolean;
  ip:        string;
  createdAt: number;
}

export const MAX_REPLY_LEN = 200;

const INDEX_LATEST  = 'duaa:all';
const INDEX_POPULAR = 'duaa:popular';
const itemKey       = (id: string) => `duaa:${id}`;
const reactKey      = (id: string, ipHash: string) => `duaa:react:${id}:${ipHash}`;

/* ── Constants ─── */
export const MAX_MESSAGE_LEN = 300;
export const MAX_NAME_LEN    = 60;
export const MAX_COUNTRY_LEN = 40;
const REACT_TTL_SEC          = 30 * 24 * 60 * 60;     // 30 days

/* ── Helpers ─── */
function clean(o: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null) out[k] = v;
  return out;
}

const num = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  return 0;
};
const str = (v: unknown): string => (v == null ? '' : String(v));

function normalize(raw: Record<string, unknown> | null | undefined): Duaa | null {
  if (!raw || !raw.id) return null;
  return {
    id:                    str(raw.id),
    name:                  str(raw.name),
    country:               str(raw.country),
    message:               str(raw.message),
    hajjYear:              raw.hajjYear ? str(raw.hajjYear) : undefined,
    reactionCount:         num(raw.reactionCount),
    reactionCountPilgrims: num(raw.reactionCountPilgrims),
    replyCount:            num(raw.replyCount),
    hidden:                Boolean(raw.hidden),
    ip:                    str(raw.ip),
    createdAt:             num(raw.createdAt),
    updatedAt:             num(raw.updatedAt),
  };
}

function normalizeReply(raw: Record<string, unknown> | null | undefined): DuaaReply | null {
  if (!raw || !raw.id) return null;
  return {
    id:        str(raw.id),
    duaaId:    str(raw.duaaId),
    name:      str(raw.name),
    country:   str(raw.country),
    hajjYear:  raw.hajjYear ? str(raw.hajjYear) : undefined,
    message:   str(raw.message),
    hidden:    Boolean(raw.hidden),
    ip:        str(raw.ip),
    createdAt: num(raw.createdAt),
  };
}

/* Hash an IP for reaction idempotency without persisting the raw IP for the
 * counter key. We still keep it on the record itself for moderation. */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(`bh-duaa-salt:${ip}`);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}

/* ── Content filters ─── */
const URL_RE   = /https?:\/\/|www\.|\.com|\.net|\.org|\.io/i;
const PHONE_RE = /[\d٠١٢٣٤٥٦٧٨٩]{6,}/;     // any 6+ digit run (Latin or Arabic)

export function validateDuaaContent(message: string): { ok: true } | { ok: false; reason: string } {
  const m = message.trim();
  if (!m) return { ok: false, reason: 'لا يمكن إرسال دعاء فارغ.' };
  if (m.length > MAX_MESSAGE_LEN) return { ok: false, reason: `حد أقصى ${MAX_MESSAGE_LEN} حرف.` };
  if (URL_RE.test(m))   return { ok: false, reason: 'لا تُسمح الروابط في الدعاء.' };
  if (PHONE_RE.test(m)) return { ok: false, reason: 'لا تُسمح الأرقام الطويلة (كأرقام الجوال).' };
  return { ok: true };
}

function shortId(): string {
  // 12-char URL-safe id
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < bytes.length; i++) id += alphabet[bytes[i] % alphabet.length];
  return id;
}

/* ── Create ─── */
export async function createDuaa(input: {
  name?:       string;
  country?:    string;
  message:     string;
  nationalId?: string;            // optional — for verified pilgrim badge
  ip:          string;
}): Promise<Duaa> {
  const check = validateDuaaContent(input.message);
  if (!check.ok) throw new Error(check.reason);

  // Verify pilgrim badge (silent fail if not found)
  let hajjYear: string | undefined;
  if (input.nationalId) {
    try {
      const p = await getPilgrim(input.nationalId.trim());
      if (p && !p.revokedAt) hajjYear = p.hajjYear;
    } catch { /* ignore */ }
  }

  const now = Date.now();
  const duaa: Duaa = {
    id:                    shortId(),
    name:                  (input.name    ?? '').trim().slice(0, MAX_NAME_LEN),
    country:               (input.country ?? '').trim().slice(0, MAX_COUNTRY_LEN),
    message:               input.message.trim(),
    hajjYear,
    reactionCount:         0,
    reactionCountPilgrims: 0,
    replyCount:            0,
    ip:                    input.ip,
    createdAt:             now,
    updatedAt:             now,
  };

  await kv.hset(itemKey(duaa.id), clean(duaa as unknown as Record<string, unknown>));
  await kv.zadd(INDEX_LATEST,  { score: now, member: duaa.id });
  await kv.zadd(INDEX_POPULAR, { score: 0,   member: duaa.id });
  return duaa;
}

/* ── Read one ─── */
export async function getDuaa(id: string): Promise<Duaa | null> {
  const data = await kv.hgetall<Record<string, unknown>>(itemKey(id));
  return normalize(data);
}

/* ── List ─── */
export type DuaaSort = 'latest' | 'popular';
export async function listDuaa(opts: {
  sort?:        DuaaSort;
  limit?:       number;
  offset?:      number;
  includeHidden?: boolean;
} = {}): Promise<Duaa[]> {
  const limit  = Math.min(opts.limit  ?? 30, 100);
  const offset = Math.max(opts.offset ?? 0, 0);
  const index  = opts.sort === 'popular' ? INDEX_POPULAR : INDEX_LATEST;
  const ids    = await kv.zrange<string[]>(index, offset, offset + limit - 1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall(itemKey(id)));
  const results = await pipe.exec<Record<string, unknown>[]>();
  return results
    .map(r => normalize(r))
    .filter((d): d is Duaa => d !== null && (opts.includeHidden || !d.hidden));
}

/* ── React (idempotent per IP) ─── */
export interface ReactResult {
  count:         number;          // new total reaction count
  pilgrimCount:  number;          // new pilgrim reaction count
  reactorBadge:  'pilgrim' | 'visitor';
  hajjYear?:     string;
}

export async function reactToDuaa(
  id: string,
  ip: string,
  nationalId?: string,
): Promise<{ ok: true; result: ReactResult } | { ok: false; reason: 'not_found' | 'already' }> {
  const duaa = await getDuaa(id);
  if (!duaa) return { ok: false, reason: 'not_found' };

  const ipHash = await hashIp(ip);
  const key    = reactKey(id, ipHash);

  // Verify pilgrim badge if nationalId provided
  let reactorBadge: 'pilgrim' | 'visitor' = 'visitor';
  let pilgrimYear: string | undefined;
  if (nationalId) {
    try {
      const p = await getPilgrim(nationalId.trim());
      if (p && !p.revokedAt) {
        reactorBadge = 'pilgrim';
        pilgrimYear  = p.hajjYear;
      }
    } catch { /* fall back to visitor */ }
  }

  // Idempotency: store reactor type for future analytics
  const reactorPayload = JSON.stringify({ b: reactorBadge, y: pilgrimYear ?? '' });
  const set = await kv.set(key, reactorPayload, { nx: true, ex: REACT_TTL_SEC });
  if (set === null) return { ok: false, reason: 'already' };

  const newCount         = (duaa.reactionCount         ?? 0) + 1;
  const newPilgrimCount  = (duaa.reactionCountPilgrims ?? 0) + (reactorBadge === 'pilgrim' ? 1 : 0);

  await kv.hset(itemKey(id), {
    reactionCount:         newCount,
    reactionCountPilgrims: newPilgrimCount,
    updatedAt:             Date.now(),
  });
  await kv.zadd(INDEX_POPULAR, { score: newCount, member: id });

  return {
    ok: true,
    result: {
      count:        newCount,
      pilgrimCount: newPilgrimCount,
      reactorBadge,
      hajjYear:     pilgrimYear,
    },
  };
}

/* ── Whether this IP has already reacted to a given duaa ─── */
export async function hasReacted(id: string, ip: string): Promise<boolean> {
  const ipHash = await hashIp(ip);
  const v      = await kv.get(reactKey(id, ipHash));
  return v !== null;
}

/* ── Bulk-load reaction state for many duaas (used on initial render) ─── */
export async function getReactedSet(ids: string[], ip: string): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const ipHash = await hashIp(ip);
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.get(reactKey(id, ipHash)));
  const results = await pipe.exec<unknown[]>();
  const out = new Set<string>();
  ids.forEach((id, i) => { if (results[i] !== null) out.add(id); });
  return out;
}

/* ── Admin: hide / unhide ─── */
export async function setDuaaHidden(id: string, hidden: boolean): Promise<Duaa | null> {
  const d = await getDuaa(id);
  if (!d) return null;
  await kv.hset(itemKey(id), { hidden, updatedAt: Date.now() });
  return { ...d, hidden };
}

/* ── Admin: delete ─── */
export async function deleteDuaa(id: string): Promise<boolean> {
  const d = await getDuaa(id);
  if (!d) return false;
  await kv.del(itemKey(id));
  await kv.zrem(INDEX_LATEST,  id);
  await kv.zrem(INDEX_POPULAR, id);
  return true;
}

/* ── Stats ─── */
export interface DuaaStats {
  total:         number;
  hidden:        number;
  totalReacts:   number;
  byCountry:     Record<string, number>;
  withHajjBadge: number;
}

export async function getDuaaStats(): Promise<DuaaStats> {
  const all = await listDuaa({ limit: 5000, includeHidden: true });
  const stats: DuaaStats = { total: 0, hidden: 0, totalReacts: 0, byCountry: {}, withHajjBadge: 0 };
  for (const d of all) {
    stats.total++;
    if (d.hidden) stats.hidden++;
    stats.totalReacts += d.reactionCount ?? 0;
    if (d.hajjYear) stats.withHajjBadge++;
    if (d.country) stats.byCountry[d.country] = (stats.byCountry[d.country] ?? 0) + 1;
  }
  return stats;
}

/* ───────────────────────── Replies (free-text prayer responses) ───────────────────────── */

const REPLIES_INDEX = (duaaId: string) => `duaa:replies:${duaaId}`;
const replyKey      = (id: string) => `duaa:reply:${id}`;

export function validateReplyContent(message: string): { ok: true } | { ok: false; reason: string } {
  const m = message.trim();
  if (!m) return { ok: false, reason: 'لا يمكن إرسال دعاء فارغ.' };
  if (m.length > MAX_REPLY_LEN) return { ok: false, reason: `حد أقصى ${MAX_REPLY_LEN} حرف.` };
  if (URL_RE.test(m))   return { ok: false, reason: 'لا تُسمح الروابط في الدعاء.' };
  if (PHONE_RE.test(m)) return { ok: false, reason: 'لا تُسمح الأرقام الطويلة.' };
  return { ok: true };
}

export async function createReply(input: {
  duaaId:     string;
  name?:      string;
  country?:   string;
  message:    string;
  nationalId?: string;
  ip:         string;
}): Promise<DuaaReply> {
  const check = validateReplyContent(input.message);
  if (!check.ok) throw new Error(check.reason);

  // Ensure parent duaa exists
  const parent = await getDuaa(input.duaaId);
  if (!parent || parent.hidden) throw new Error('الدعاء غير موجود.');

  // Verify pilgrim badge
  let hajjYear: string | undefined;
  if (input.nationalId) {
    try {
      const p = await getPilgrim(input.nationalId.trim());
      if (p && !p.revokedAt) hajjYear = p.hajjYear;
    } catch { /* ignore */ }
  }

  const now = Date.now();
  const reply: DuaaReply = {
    id:        shortId(),
    duaaId:    input.duaaId,
    name:      (input.name    ?? '').trim().slice(0, MAX_NAME_LEN),
    country:   (input.country ?? '').trim().slice(0, MAX_COUNTRY_LEN),
    hajjYear,
    message:   input.message.trim(),
    ip:        input.ip,
    createdAt: now,
  };

  await kv.hset(replyKey(reply.id), clean(reply as unknown as Record<string, unknown>));
  await kv.zadd(REPLIES_INDEX(input.duaaId), { score: now, member: reply.id });

  // Bump parent counters
  const newReplyCount = (parent.replyCount ?? 0) + 1;
  await kv.hset(itemKey(input.duaaId), { replyCount: newReplyCount, updatedAt: now });

  return reply;
}

export async function listReplies(duaaId: string, opts: { limit?: number; includeHidden?: boolean } = {}): Promise<DuaaReply[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const ids = await kv.zrange<string[]>(REPLIES_INDEX(duaaId), 0, limit - 1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall(replyKey(id)));
  const results = await pipe.exec<Record<string, unknown>[]>();
  return results
    .map(r => normalizeReply(r))
    .filter((r): r is DuaaReply => r !== null && (opts.includeHidden || !r.hidden));
}

export async function getReply(id: string): Promise<DuaaReply | null> {
  const data = await kv.hgetall<Record<string, unknown>>(replyKey(id));
  return normalizeReply(data);
}

export async function setReplyHidden(id: string, hidden: boolean): Promise<DuaaReply | null> {
  const r = await getReply(id);
  if (!r) return null;
  await kv.hset(replyKey(id), { hidden });
  return { ...r, hidden };
}

export async function deleteReply(id: string): Promise<boolean> {
  const r = await getReply(id);
  if (!r) return false;
  await kv.del(replyKey(id));
  await kv.zrem(REPLIES_INDEX(r.duaaId), id);
  // Decrement parent counter (best effort)
  const parent = await getDuaa(r.duaaId);
  if (parent) {
    await kv.hset(itemKey(r.duaaId), { replyCount: Math.max(0, (parent.replyCount ?? 0) - 1) });
  }
  return true;
}

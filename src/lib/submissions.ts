import { kv } from '@vercel/kv';

/* ─────────────────────────────────────────────────────────────
 * Submissions persistence layer
 * ─────────────────────────────────────────────────────────────
 * Schema in Vercel KV (Upstash Redis):
 *   submissions:all              → sorted set, score=createdAt, member=id
 *   submission:<id>              → hash with all fields
 *
 * Status values:
 *   'new' | 'contacted' | 'approved' | 'rejected'
 * ───────────────────────────────────────────────────────────── */

export type SubmissionStatus = 'new' | 'contacted' | 'approved' | 'rejected';

export interface Submission {
  id:            string;
  type:          'agency';
  agencyName:    string;
  country:       string;
  contactPerson: string;
  email:         string;
  phone:         string;
  pdfUrl?:       string;
  pdfName?:      string;
  pdfSize?:      number;
  status:        SubmissionStatus;
  notes:         string;
  ip:            string;
  createdAt:     number;        // ms epoch
  updatedAt:     number;        // ms epoch
}

const INDEX_KEY = 'submissions:all';
const itemKey = (id: string) => `submission:${id}`;

/* ── Create ─── */
export async function createSubmission(
  data: Omit<Submission, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>,
): Promise<Submission> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const sub: Submission = {
    ...data,
    id,
    status: 'new',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  await kv.hset(itemKey(id), sub as unknown as Record<string, unknown>);
  await kv.zadd(INDEX_KEY, { score: now, member: id });
  return sub;
}

/* ── Read one ─── */
export async function getSubmission(id: string): Promise<Submission | null> {
  const data = await kv.hgetall<Record<string, unknown>>(itemKey(id));
  if (!data || !data.id) return null;
  return data as unknown as Submission;
}

/* ── List (most recent first) ─── */
export async function listSubmissions(limit = 200): Promise<Submission[]> {
  // ZRANGE with REV returns highest scores first
  const ids = await kv.zrange<string[]>(INDEX_KEY, 0, limit - 1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall(itemKey(id)));
  const results = await pipe.exec<Record<string, unknown>[]>();
  return results
    .filter((s): s is Record<string, unknown> => !!s && !!s.id)
    .map(s => s as unknown as Submission);
}

/* ── Update partial fields ─── */
export async function updateSubmission(
  id: string,
  patch: Partial<Pick<Submission, 'status' | 'notes'>>,
): Promise<Submission | null> {
  const existing = await getSubmission(id);
  if (!existing) return null;
  const updated: Submission = {
    ...existing,
    ...patch,
    updatedAt: Date.now(),
  };
  await kv.hset(itemKey(id), updated as unknown as Record<string, unknown>);
  return updated;
}

/* ── Delete ─── */
export async function deleteSubmission(id: string): Promise<boolean> {
  const existed = await kv.del(itemKey(id));
  await kv.zrem(INDEX_KEY, id);
  return existed > 0;
}

/* ── Stats ─── */
export async function getStats(): Promise<Record<SubmissionStatus | 'total', number>> {
  const all = await listSubmissions(500);
  const stats: Record<string, number> = { total: all.length, new: 0, contacted: 0, approved: 0, rejected: 0 };
  for (const s of all) stats[s.status] = (stats[s.status] ?? 0) + 1;
  return stats as Record<SubmissionStatus | 'total', number>;
}

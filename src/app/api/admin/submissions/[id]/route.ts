import { NextResponse } from 'next/server';
import { del as blobDel } from '@vercel/blob';
import { readSession } from '@/lib/session';
import { getSubmission, updateSubmission, deleteSubmission, type SubmissionStatus } from '@/lib/submissions';

export const runtime = 'nodejs';

const VALID_STATUS: SubmissionStatus[] = ['new', 'contacted', 'approved', 'rejected'];

/* ── PATCH: update status / notes ─── */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: { status?: string; notes?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  const patch: { status?: SubmissionStatus; notes?: string } = {};
  if (body.status !== undefined) {
    if (!VALID_STATUS.includes(body.status as SubmissionStatus))
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    patch.status = body.status as SubmissionStatus;
  }
  if (body.notes !== undefined) {
    patch.notes = String(body.notes).slice(0, 2000);
  }

  const updated = await updateSubmission(params.id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, item: updated });
}

/* ── DELETE: remove submission + its PDF ─── */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await readSession()))
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const existing = await getSubmission(params.id);
  if (!existing) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  // Best-effort: remove the PDF from Blob storage too
  if (existing.pdfUrl && process.env.BLOB_READ_WRITE_TOKEN) {
    try { await blobDel(existing.pdfUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }); }
    catch (e) { console.warn('[admin/delete] blob delete failed', e); }
  }

  await deleteSubmission(params.id);
  return NextResponse.json({ ok: true });
}

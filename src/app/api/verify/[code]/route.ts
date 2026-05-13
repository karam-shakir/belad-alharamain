import { NextResponse } from 'next/server';
import { getPilgrimByVerifyCode } from '@/lib/pilgrims';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Public certificate verification endpoint (no auth — anyone can verify) */
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const code = String(params.code ?? '').toUpperCase();
  const p = await getPilgrimByVerifyCode(code);

  if (!p) {
    return NextResponse.json({ ok: false, valid: false, error: 'الشهادة غير موجودة.' }, { status: 404 });
  }

  if (p.revokedAt) {
    return NextResponse.json({
      ok: true, valid: false, revoked: true,
      reason: p.revokeReason ?? '',
      name: p.name, hajjYear: p.hajjYear,
    });
  }

  return NextResponse.json({
    ok: true, valid: true,
    name:     p.name,
    hajjYear: p.hajjYear,
    country:  p.country,
    issuedAt: p.createdAt,
  });
}

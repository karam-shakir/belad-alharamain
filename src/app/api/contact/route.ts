import { NextResponse } from 'next/server';
import { resend, FROM_EMAIL, TO_EMAIL, wrapEmail, row, esc } from '@/lib/email';
import { rateLimit, getIp } from '@/lib/ratelimit';
import { createSubmission } from '@/lib/submissions';

export const runtime = 'nodejs';

const MAX_FIELD = 5000;

type Body = {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  hp?: string;  // honeypot — bots fill, humans don't
};

export async function POST(req: Request) {
  /* ── Rate limit ─── */
  const ip = getIp(req);
  const rl = rateLimit(ip, { max: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تم تجاوز الحد المسموح. حاول بعد دقيقة.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  /* ── Parse + validate ─── */
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot: if bot filled this hidden field, silently pretend success
  if (body.hp && body.hp.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name    = String(body.name    ?? '').trim().slice(0, 200);
  const phone   = String(body.phone   ?? '').trim().slice(0, 30);
  const email   = String(body.email   ?? '').trim().slice(0, 200);
  const subject = String(body.subject ?? '').trim().slice(0, 200);
  const message = String(body.message ?? '').trim().slice(0, MAX_FIELD);

  if (!name || !phone || !message) {
    return NextResponse.json({ ok: false, error: 'الاسم والجوال والرسالة مطلوبة.' }, { status: 400 });
  }

  // Optional email format check
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'البريد الإلكتروني غير صحيح.' }, { status: 400 });
  }

  /* ── Persist to KV (admin dashboard) ─── */
  let savedToDb = false;
  if (process.env.KV_REST_API_URL) {
    try {
      await createSubmission({
        type: 'contact',
        name, phone, email, subject, message, ip,
      });
      savedToDb = true;
      console.log('[contact] saved to KV');
    } catch (e) {
      console.error('[contact] KV save failed:', e instanceof Error ? e.message : e);
    }
  }

  if (!resend) {
    console.error('[contact] RESEND_API_KEY not configured');
    if (savedToDb) return NextResponse.json({ ok: true });
    return NextResponse.json(
      { ok: false, error: 'خدمة البريد غير مهيّأة. يرجى التواصل عبر الجوال.' },
      { status: 500 },
    );
  }

  /* ── Compose email ─── */
  const html = wrapEmail(
    '📩 رسالة جديدة من نموذج التواصل',
    `
    ${row('الاسم الكامل', name)}
    ${row('رقم الجوال', phone, { ltr: true })}
    ${email   ? row('البريد الإلكتروني', email, { ltr: true }) : ''}
    ${subject ? row('الموضوع', subject) : ''}
    <p style="margin:18px 0 6px;color:#7D6530;font-size:12px;font-weight:bold;">الرسالة:</p>
    <div style="padding:14px;background:#F2EDE1;border-radius:8px;white-space:pre-wrap;line-height:1.9;">${esc(message)}</div>
    <p style="margin-top:24px;font-size:12px;color:#9B8B66;">IP: ${esc(ip)} — ${new Date().toLocaleString('ar-SA')}</p>
    `,
  );

  const replyTo = email || undefined;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `📩 ${subject || 'رسالة جديدة من الموقع'} — ${name}`,
      html,
      replyTo,
    });
    if (error) {
      console.error('[contact] resend error', error);
      if (savedToDb) return NextResponse.json({ ok: true });
      return NextResponse.json({ ok: false, error: 'تعذّر إرسال الرسالة. حاول لاحقاً.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact] exception', e);
    if (savedToDb) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: 'حدث خطأ غير متوقع.' }, { status: 500 });
  }
}

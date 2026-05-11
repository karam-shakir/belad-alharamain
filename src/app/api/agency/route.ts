import { NextResponse } from 'next/server';
import { resend, FROM_EMAIL, TO_EMAIL, wrapEmail, row, esc } from '@/lib/email';
import { rateLimit, getIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_FILE_BYTES = 10 * 1024 * 1024;  // 10 MB

export async function POST(req: Request) {
  /* ── Rate limit ─── */
  const ip = getIp(req);
  const rl = rateLimit(ip, { max: 2, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تم تجاوز الحد المسموح. حاول بعد دقيقة.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  /* ── Parse multipart ─── */
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });
  }

  // Honeypot
  const hp = String(form.get('hp') ?? '').trim();
  if (hp !== '') return NextResponse.json({ ok: true });

  const agencyName    = String(form.get('agencyName')    ?? '').trim().slice(0, 200);
  const country       = String(form.get('country')       ?? '').trim().slice(0, 100);
  const contactPerson = String(form.get('contactPerson') ?? '').trim().slice(0, 200);
  const email         = String(form.get('email')         ?? '').trim().slice(0, 200);
  const phone         = String(form.get('phone')         ?? '').trim().slice(0, 30);
  const file          = form.get('contract') as File | null;

  if (!agencyName || !country || !contactPerson || !email || !phone) {
    return NextResponse.json({ ok: false, error: 'جميع الحقول مطلوبة.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'البريد الإلكتروني غير صحيح.' }, { status: 400 });
  }

  /* ── Validate file ─── */
  if (!file || typeof file === 'string') {
    return NextResponse.json({ ok: false, error: 'يجب رفع ملف العقد بصيغة PDF.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ ok: false, error: 'يُسمح بملفات PDF فقط.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, error: 'الحجم الأقصى للملف 10MB.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'الملف فارغ.' }, { status: 400 });
  }

  if (!resend) {
    console.error('[agency] RESEND_API_KEY not configured');
    return NextResponse.json(
      { ok: false, error: 'خدمة البريد غير مهيّأة. يرجى التواصل عبر الجوال.' },
      { status: 500 },
    );
  }

  /* ── Read file as buffer ─── */
  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 100) || 'contract.pdf';

  /* ── Compose email ─── */
  const html = wrapEmail(
    '🤝 طلب تعاقد وكالة خارجية جديد',
    `
    ${row('اسم الوكالة / الشركة', agencyName)}
    ${row('الدولة', country)}
    ${row('الشخص المسؤول', contactPerson)}
    ${row('البريد الإلكتروني', email, { ltr: true })}
    ${row('رقم الجوال', phone, { ltr: true })}
    <p style="margin:18px 0 6px;color:#7D6530;font-size:12px;font-weight:bold;">📎 ملف العقد المرفق:</p>
    <p style="padding:12px;background:#F2EDE1;border-radius:8px;font-size:14px;">
      <strong>${esc(safeName)}</strong> — ${(file.size / 1024).toFixed(1)} KB
    </p>
    <p style="margin-top:24px;font-size:12px;color:#9B8B66;">IP: ${esc(ip)} — ${new Date().toLocaleString('ar-SA')}</p>
    `,
  );

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `🤝 طلب وكالة خارجية — ${agencyName} (${country})`,
      html,
      replyTo: email,
      attachments: [
        { filename: safeName, content: buf },
      ],
    });
    if (error) {
      console.error('[agency] resend error', error);
      return NextResponse.json({ ok: false, error: 'تعذّر إرسال الطلب. حاول لاحقاً.' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[agency] exception', e);
    return NextResponse.json({ ok: false, error: 'حدث خطأ غير متوقع.' }, { status: 500 });
  }
}

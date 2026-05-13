import { NextResponse } from 'next/server';
import { resend, FROM_EMAIL, TO_EMAIL, wrapEmail, row, esc } from '@/lib/email';
import { rateLimit, getIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';

/* When a pilgrim's nationalId is not found in the list, they can submit a
 * short form to ask the admin to check / add them. We email the admin AND
 * (optionally) store as a 'contact' submission so it appears in the dashboard. */

export async function POST(req: Request) {
  const ip = getIp(req);
  const rl = rateLimit(`cert-notfound:${ip}`, { max: 3, windowMs: 5 * 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'محاولات كثيرة. حاول بعد دقائق.' },
      { status: 429 },
    );
  }

  let body: { nationalId?: string; name?: string; phone?: string; note?: string; hp?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 }); }

  // honeypot
  if ((body.hp ?? '').trim() !== '') return NextResponse.json({ ok: true });

  const nationalId = String(body.nationalId ?? '').replace(/\D/g, '').slice(0, 10);
  const name       = String(body.name  ?? '').trim().slice(0, 200);
  const phone      = String(body.phone ?? '').trim().slice(0, 30);
  const note       = String(body.note  ?? '').trim().slice(0, 1000);

  if (!nationalId || !name || !phone) {
    return NextResponse.json({ ok: false, error: 'الرجاء تعبئة جميع الحقول.' }, { status: 400 });
  }

  if (!resend) {
    return NextResponse.json({ ok: false, error: 'خدمة البريد غير متاحة.' }, { status: 500 });
  }

  const html = wrapEmail(
    '⚠️ بلاغ: حاج غير موجود في قائمة التذاكير',
    `
    <p style="margin:0 0 16px;padding:12px;background:#FEF3C7;border-right:4px solid #F59E0B;border-radius:6px;font-size:13px;color:#92400E;">
      حاج لم يجد بياناته في صفحة التذكار. يرجى التحقق من القائمة وإضافته إن كان مستحقاً.
    </p>
    ${row('الاسم كما ذكره', name)}
    ${row('رقم الهوية', nationalId, { ltr: true })}
    ${row('رقم الجوال', phone, { ltr: true })}
    ${note ? row('ملاحظة', note) : ''}
    <p style="margin-top:18px;font-size:12px;color:#9B8B66;">
      مصدر البلاغ: صفحة <a href="https://belad-alharamain.com/certificate" style="color:#A88B4A;">تذكار الحج الإلكتروني</a><br/>
      IP: ${esc(ip)} — ${new Date().toLocaleString('ar-SA')}
    </p>
    `,
  );

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `⚠️ حاج غير موجود في القائمة — ${name} (${nationalId})`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[cert/notfound]', e);
    return NextResponse.json({ ok: false, error: 'تعذّر إرسال البلاغ.' }, { status: 500 });
  }
}

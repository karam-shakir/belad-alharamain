'use client';

import Image from 'next/image';

interface Props {
  name:        string;
  hajjYear:    string;
  verifyCode:  string;
  qrDataUrl:   string;
  issuedAt?:   Date;
}

function toArabicDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
}

function fmtArabicDate(d: Date): string {
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtGregorian(d: Date): string {
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* Luxurious bilingual Hajj completion certificate (A4 landscape).
 * All styling lives in globals.css under the `.bhc-*` prefix so it
 * works reliably regardless of server/client rendering context. */
export default function Certificate({ name, hajjYear, verifyCode, qrDataUrl, issuedAt }: Props) {
  const issued = issuedAt ?? new Date();

  return (
    <div className="bhc-wrap" dir="rtl">
      <div className="bhc">
        <div className="bhc-outer">
          <div className="bhc-inner">

            {/* Corner ornaments */}
            <span className="bhc-corner bhc-corner-tl">۞</span>
            <span className="bhc-corner bhc-corner-tr">۞</span>
            <span className="bhc-corner bhc-corner-bl">۞</span>
            <span className="bhc-corner bhc-corner-br">۞</span>

            {/* ── Row 1: logo ── */}
            <div className="bhc-top">
              <div className="bhc-logo-row">
                <Image
                  src="/images/logo.png"
                  alt="شركة بلاد الحرمين للحج والعمرة"
                  width={600}
                  height={220}
                  priority
                  className="bhc-logo"
                />
              </div>
            </div>

            {/* ── Row 2: titles + divider ── */}
            <div className="bhc-title">
              <h1 className="bhc-title-ar">شهادة إتمام مناسك الحج</h1>
              <p className="bhc-title-en">HAJJ COMPLETION CERTIFICATE</p>
              <div className="bhc-divider">
                <span className="bhc-divider-line" />
                <span className="bhc-divider-mark">۞</span>
                <span className="bhc-divider-line" />
              </div>
            </div>

            {/* ── Row 3: body (flex 1) ── */}
            <div className="bhc-body">
              <p className="bhc-intro-ar">تتشرّف شركة بلاد الحرمين بخدمة</p>
              <p className="bhc-intro-en">Belad Alharamain is honored to have served</p>

              <div className="bhc-name-frame">
                <span className="bhc-name-decor">✦</span>
                <h2 className="bhc-name">{name}</h2>
                <span className="bhc-name-decor">✦</span>
              </div>

              <p className="bhc-event-ar">
                في أداء فريضة الحج لعام
                <strong className="bhc-year">{toArabicDigits(hajjYear)}</strong>
                هـ
              </p>
              <p className="bhc-event-en">
                in performing Hajj — <strong>{hajjYear} AH</strong>
              </p>

              <div className="bhc-prayer">
                <p className="bhc-prayer-ar">
                  تقبّل الله منكم، وجعل حجّكم مبروراً، وسعيكم مشكوراً، وذنبكم مغفوراً
                </p>
                <p className="bhc-prayer-en">
                  May Allah accept your sacred journey, bless your steps, and forgive your sins
                </p>
              </div>

              <div className="bhc-sep">
                <span className="bhc-sep-line" />
                <i className="fas fa-mosque bhc-sep-icon" />
                <span className="bhc-sep-line" />
              </div>

              <div className="bhc-close">
                <p className="bhc-close-ar">
                  «تشرّفنا بخدمتكم في رحلة العمر، لتبقى ذكرى مباركة تُنير دروبكم»
                </p>
                <p className="bhc-close-en">
                  &ldquo;It was our honor to walk with you through the journey of a lifetime —
                  may its light shine on your path forever.&rdquo;
                </p>
                <p className="bhc-team">
                  — فريق بلاد الحرمين · The Belad Alharamain Team
                </p>
              </div>
            </div>

            {/* ── Row 4: date + QR ── */}
            <div className="bhc-footer">
              <div className="bhc-cell bhc-cell-date">
                <p className="bhc-label">تاريخ الإصدار · Issued on</p>
                <p className="bhc-value">{fmtArabicDate(issued)}</p>
                <p className="bhc-value-en">{fmtGregorian(issued)}</p>
              </div>

              <div className="bhc-cell bhc-cell-qr">
                <p className="bhc-label">للتحقق · Scan to Verify</p>
                {qrDataUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt="QR" className="bhc-qr" />
                )}
                <p className="bhc-verify-code" dir="ltr">{verifyCode}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

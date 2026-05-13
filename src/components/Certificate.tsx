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

/* ─────────────────────────────────────────────────────────────
 * Luxurious bilingual Hajj completion certificate.
 * A4 landscape, gold + teal palette, Islamic ornamental frame.
 * Designed for both screen preview and high-quality print.
 * ───────────────────────────────────────────────────────────── */
export default function Certificate({ name, hajjYear, verifyCode, qrDataUrl, issuedAt }: Props) {
  const issued = issuedAt ?? new Date();

  return (
    <div className="cert-wrap" dir="rtl">
      <div className="cert">
        {/* Decorative gold frame */}
        <div className="frame-outer">
          <div className="frame-inner">

            {/* Corner ornaments */}
            <span className="corner corner-tl">۞</span>
            <span className="corner corner-tr">۞</span>
            <span className="corner corner-bl">۞</span>
            <span className="corner corner-br">۞</span>

            {/* ── Top section: bismillah + logo ── */}
            <div className="top-section">
              <p className="bismillah">﷽</p>
              <div className="logo-row">
                <Image
                  src="/images/logo.png"
                  alt="شركة بلاد الحرمين للحج والعمرة"
                  width={600}
                  height={220}
                  priority
                  className="logo-img"
                />
              </div>
            </div>

            {/* ── Title section ── */}
            <div className="title-section">
              <h1 className="title-ar">شهادة إتمام مناسك الحج</h1>
              <p className="title-en">HAJJ COMPLETION CERTIFICATE</p>
              <div className="divider">
                <span className="divider-line" />
                <span className="divider-mark">۞</span>
                <span className="divider-line" />
              </div>
            </div>

            {/* ── Body ── */}
            <div className="body-section">
              <p className="intro-ar">تتشرّف شركة بلاد الحرمين بخدمة</p>
              <p className="intro-en">Belad Alharamain is honored to have served</p>

              <div className="name-frame">
                <span className="name-decor">✦</span>
                <h2 className="pilgrim-name">{name}</h2>
                <span className="name-decor">✦</span>
              </div>

              <p className="event-ar">
                في أداء فريضة الحج لعام&nbsp;
                <strong className="year">{toArabicDigits(hajjYear)}</strong>
                &nbsp;هـ
              </p>
              <p className="event-en">
                in performing Hajj — <strong>{hajjYear} AH</strong>
              </p>

              <div className="prayer-block">
                <p className="prayer-ar">
                  تقبّل الله منكم، وجعل حجّكم مبروراً، وسعيكم مشكوراً، وذنبكم مغفوراً
                </p>
                <p className="prayer-en">
                  May Allah accept your sacred journey, bless your steps, and forgive your sins
                </p>
              </div>

              <div className="separator">
                <span className="sep-line" />
                <i className="fas fa-mosque sep-icon" />
                <span className="sep-line" />
              </div>

              <div className="closing-block">
                <p className="closing-ar">
                  «تشرّفنا بخدمتكم في رحلة العمر، لتبقى ذكرى مباركة تُنير دروبكم»
                </p>
                <p className="closing-en">
                  &ldquo;It was our honor to walk with you through the journey of a lifetime —
                  may its light shine on your path forever.&rdquo;
                </p>
                <p className="team-line">
                  — فريق بلاد الحرمين · The Belad Alharamain Team
                </p>
              </div>
            </div>

            {/* ── Footer: date + QR ── */}
            <div className="footer-section">
              <div className="footer-cell date-cell">
                <p className="footer-label">تاريخ الإصدار · Issued on</p>
                <p className="footer-value">{fmtArabicDate(issued)}</p>
                <p className="footer-value-en">{fmtGregorian(issued)}</p>
              </div>

              <div className="footer-cell qr-cell">
                <p className="footer-label">للتحقق · Scan to Verify</p>
                {qrDataUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt="QR" className="qr-img" />
                )}
                <p className="verify-code" dir="ltr">{verifyCode}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .cert-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 16px 0;
        }

        .cert {
          width: 100%;
          max-width: 1123px;        /* A4 landscape @ 96dpi */
          aspect-ratio: 1.4142 / 1; /* A4 ratio */
          font-family: 'Cairo', 'Tahoma', sans-serif;
          color: #1a1a1a;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(168,139,74,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(31,122,140,0.04) 0%, transparent 55%),
            linear-gradient(135deg, #FFFCF5 0%, #FAFAF7 50%, #F5EFE3 100%);
          padding: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(168,139,74,0.15);
          border-radius: 4px;
          position: relative;
        }

        .frame-outer {
          width: 100%;
          height: 100%;
          border: 3px solid #A88B4A;
          border-radius: 4px;
          padding: 6px;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 8L66 36L96 22L80 50L108 60L80 70L96 98L66 84L60 112L54 84L24 98L40 70L12 60L40 50L24 22L54 36Z' fill='none' stroke='%23A88B4A' stroke-width='0.6' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 120px 120px;
        }

        .frame-inner {
          width: 100%;
          height: 100%;
          border: 1px solid #C4A55E;
          border-radius: 2px;
          padding: 2.8% 4%;
          display: grid;
          grid-template-rows: auto auto 1fr auto;
          row-gap: 1.5%;
          position: relative;
        }

        .corner {
          position: absolute;
          color: #A88B4A;
          font-size: clamp(16px, 2.2vw, 28px);
          font-weight: 700;
          line-height: 1;
          background: #FAFAF7;
          padding: 0 4px;
        }
        .corner-tl { top: -14px;    inset-inline-start: -14px; }
        .corner-tr { top: -14px;    inset-inline-end:   -14px; }
        .corner-bl { bottom: -14px; inset-inline-start: -14px; }
        .corner-br { bottom: -14px; inset-inline-end:   -14px; }

        /* TOP */
        .top-section { text-align: center; }
        .bismillah {
          color: #A88B4A;
          font-size: clamp(18px, 2.4vw, 26px);
          margin: 0 0 6px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .logo-row { display: flex; justify-content: center; }
        :global(.logo-img) {
          height: clamp(60px, 9vw, 110px) !important;
          width: auto !important;
          object-fit: contain;
        }

        /* TITLE */
        .title-section { text-align: center; }
        .title-ar {
          font-size: clamp(20px, 3.2vw, 34px);
          font-weight: 900;
          color: #155E6B;
          margin: 0;
          letter-spacing: 1px;
          line-height: 1.2;
        }
        .title-en {
          font-family: 'Poppins', 'Cormorant Garamond', serif;
          font-size: clamp(10px, 1.3vw, 14px);
          color: #7D6530;
          letter-spacing: clamp(2px, 0.4vw, 6px);
          text-transform: uppercase;
          margin: 4px 0 0;
          font-weight: 500;
        }
        .divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }
        .divider-line {
          flex: 0 1 80px;
          height: 1px;
          background: linear-gradient(to right, transparent, #A88B4A, transparent);
        }
        .divider-mark { color: #A88B4A; font-size: clamp(14px, 1.6vw, 18px); }

        /* BODY */
        .body-section {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(6px, 1vw, 10px);
          padding: 0 2%;
        }
        .intro-ar {
          font-size: clamp(13px, 1.6vw, 18px);
          color: #2a2a2a;
          margin: 0;
          font-weight: 500;
        }
        .intro-en {
          font-family: 'Poppins', serif;
          font-size: clamp(10px, 1.1vw, 13px);
          color: #7D6530;
          letter-spacing: 2px;
          margin: 0 0 4px;
          font-style: italic;
        }

        .name-frame {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 1.4vw, 18px);
          padding: clamp(8px, 1.4vw, 16px) clamp(20px, 4vw, 50px);
          margin: clamp(4px, 0.6vw, 8px) auto;
          border-top: 2px solid #A88B4A;
          border-bottom: 2px solid #A88B4A;
          background: linear-gradient(to bottom,
            transparent, rgba(168,139,74,0.08), transparent);
          position: relative;
        }
        .name-decor {
          color: #C4A55E;
          font-size: clamp(16px, 2.2vw, 26px);
        }
        .pilgrim-name {
          font-size: clamp(22px, 4.2vw, 44px);
          font-weight: 900;
          color: #7D6530;
          margin: 0;
          letter-spacing: 1px;
          line-height: 1.15;
          text-shadow: 0 1px 0 rgba(168,139,74,0.2);
        }

        .event-ar {
          font-size: clamp(13px, 1.8vw, 18px);
          color: #155E6B;
          margin: clamp(2px, 0.5vw, 6px) 0 0;
          font-weight: 500;
        }
        .year {
          color: #A88B4A;
          font-size: clamp(18px, 2.4vw, 24px);
          font-weight: 900;
          margin: 0 4px;
        }
        .event-en {
          font-family: 'Poppins', serif;
          font-size: clamp(10px, 1.2vw, 14px);
          color: #7D6530;
          letter-spacing: 1.5px;
          margin: 2px 0 4px;
          font-style: italic;
        }

        .prayer-block {
          max-width: 85%;
          margin: clamp(2px, 0.5vw, 6px) 0;
        }
        .prayer-ar {
          font-size: clamp(12px, 1.5vw, 16px);
          color: #155E6B;
          line-height: 1.85;
          margin: 0;
          font-weight: 500;
        }
        .prayer-en {
          font-family: 'Poppins', serif;
          font-size: clamp(10px, 1.1vw, 13px);
          color: #7D6530;
          font-style: italic;
          margin: 3px 0 0;
          line-height: 1.6;
        }

        .separator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: clamp(4px, 0.8vw, 8px) 0 clamp(2px, 0.4vw, 4px);
        }
        .sep-line {
          width: clamp(40px, 8vw, 100px);
          height: 1px;
          background: linear-gradient(to right, transparent, #A88B4A, transparent);
        }
        .sep-icon { color: #A88B4A; font-size: clamp(12px, 1.4vw, 16px); }

        .closing-block { max-width: 90%; }
        .closing-ar {
          font-size: clamp(11px, 1.4vw, 14.5px);
          color: #4a4a4a;
          font-style: italic;
          line-height: 1.8;
          margin: 0;
        }
        .closing-en {
          font-family: 'Poppins', serif;
          font-size: clamp(9.5px, 1.1vw, 12.5px);
          color: #7D6530;
          font-style: italic;
          margin: 3px 0 0;
          line-height: 1.55;
        }
        .team-line {
          font-size: clamp(10px, 1.2vw, 13px);
          color: #A88B4A;
          font-weight: 700;
          margin: clamp(4px, 0.6vw, 8px) 0 0;
          letter-spacing: 0.5px;
        }

        /* FOOTER */
        .footer-section {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          padding-top: 1%;
          border-top: 1px dashed rgba(168,139,74,0.3);
        }
        .footer-cell {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .date-cell { align-items: flex-start; text-align: start; }
        .qr-cell   { align-items: flex-end;   text-align: end;   }

        .footer-label {
          font-size: clamp(9px, 1vw, 11px);
          color: #7D6530;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0 0 2px;
          text-transform: uppercase;
        }
        .footer-value {
          font-size: clamp(11px, 1.3vw, 14px);
          color: #155E6B;
          font-weight: 700;
          margin: 0;
          line-height: 1.4;
        }
        .footer-value-en {
          font-family: 'Poppins', serif;
          font-size: clamp(9.5px, 1.05vw, 12px);
          color: #7D6530;
          font-style: italic;
          margin: 0;
        }
        :global(.qr-img) {
          width: clamp(60px, 8vw, 95px);
          height: clamp(60px, 8vw, 95px);
          padding: 4px;
          background: #fff;
          border: 1.5px solid #A88B4A;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(168,139,74,0.2);
        }
        .verify-code {
          font-family: 'Courier New', monospace;
          font-size: clamp(8.5px, 0.95vw, 11px);
          color: #7D6530;
          letter-spacing: 1px;
          margin: 3px 0 0;
          font-weight: 700;
        }

        /* PRINT */
        @media print {
          @page { size: A4 landscape; margin: 0; }
          .cert-wrap { padding: 0; }
          .cert {
            width: 297mm;
            height: 210mm;
            max-width: none;
            box-shadow: none;
            border-radius: 0;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

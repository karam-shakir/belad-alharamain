import Image from 'next/image';

interface Props {
  name:        string;
  hajjYear:    string;
  verifyCode:  string;
  qrDataUrl:   string;     // pre-rendered QR code image as data URL
  issuedAt?:   Date;
}

/* Convert latin digits to Arabic-Indic digits for the year display */
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
 * Print-optimized via @media print rules in globals.css.
 * ───────────────────────────────────────────────────────────── */
export default function Certificate({ name, hajjYear, verifyCode, qrDataUrl, issuedAt }: Props) {
  const issued = issuedAt ?? new Date();

  return (
    <div className="certificate" dir="rtl">
      {/* Outer gold frame */}
      <div className="cert-outer">
        {/* Inner thin frame */}
        <div className="cert-inner">

          {/* Decorative corners */}
          <div className="corner corner-tl">۞</div>
          <div className="corner corner-tr">۞</div>
          <div className="corner corner-bl">۞</div>
          <div className="corner corner-br">۞</div>

          {/* Header: bismillah + logo */}
          <div className="cert-header">
            <p className="bismillah">﷽</p>
            <div className="logo-wrap">
              <Image
                src="/images/logo.png"
                alt="بلاد الحرمين"
                width={520}
                height={200}
                priority
                className="cert-logo"
              />
            </div>
          </div>

          {/* Title */}
          <div className="cert-title">
            <h1 className="title-ar">شهادة إتمام مناسك الحج</h1>
            <p className="title-en">Hajj Completion Certificate</p>
            <div className="title-divider">
              <span>۞</span>
            </div>
          </div>

          {/* Body */}
          <div className="cert-body">
            <p className="intro-ar">تتشرّف شركة بلاد الحرمين بخدمة</p>
            <p className="intro-en">Belad Alharamain is honored to have served</p>

            {/* Pilgrim name — the star of the certificate */}
            <div className="name-frame">
              <span className="name-decor">✦</span>
              <h2 className="name">{name}</h2>
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

            <div className="prayer">
              <p className="prayer-ar">
                تقبّل الله منكم، وجعل حجّكم مبروراً، وسعيكم مشكوراً، وذنبكم مغفوراً
              </p>
              <p className="prayer-en">
                May Allah accept your sacred journey, bless your steps, and forgive your sins
              </p>
            </div>

            {/* Decorative separator */}
            <div className="separator">
              <span className="sep-line" />
              <i className="fas fa-mosque sep-icon" />
              <span className="sep-line" />
            </div>

            {/* Closing message */}
            <div className="closing">
              <p className="closing-ar">
                «تشرّفنا بخدمتكم في رحلة العمر، لتبقى ذكرى مباركة تُنير دروبكم»
              </p>
              <p className="closing-en">
                &ldquo;It was our honor to walk with you through the journey of a lifetime —
                may its light shine on your path forever.&rdquo;
              </p>
              <p className="team-sig">
                — فريق بلاد الحرمين &nbsp;·&nbsp; The Belad Alharamain Team
              </p>
            </div>
          </div>

          {/* Footer: date + QR */}
          <div className="cert-footer">
            <div className="footer-block">
              <p className="footer-label">تاريخ الإصدار · Issued on</p>
              <p className="footer-value">
                {fmtArabicDate(issued)}
                <br />
                <span className="footer-en">{fmtGregorian(issued)}</span>
              </p>
            </div>

            <div className="footer-spacer" />

            <div className="footer-block qr-block">
              <p className="footer-label">للتحقق · Verify</p>
              {qrDataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrDataUrl} alt="QR verification code" className="qr-img" />
              )}
              <p className="verify-code" dir="ltr">{verifyCode}</p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .certificate {
          width: 100%;
          max-width: 1123px;          /* A4 landscape @ 96dpi */
          aspect-ratio: 1.414 / 1;    /* A4 ratio */
          margin: 0 auto;
          background:
            radial-gradient(ellipse at top, #FFFBF0 0%, #FAFAF7 60%, #F2EDE1 100%);
          padding: 18px;
          position: relative;
          font-family: 'Cairo', 'Tahoma', sans-serif;
          color: #1a1a1a;
        }

        .cert-outer {
          width: 100%;
          height: 100%;
          border: 3px solid #A88B4A;
          border-radius: 6px;
          padding: 8px;
          position: relative;
          background-image:
            linear-gradient(135deg, transparent 0 50%, rgba(168,139,74,0.04) 100%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cpath d='M60 8L66 36L96 22L80 50L108 60L80 70L96 98L66 84L60 112L54 84L24 98L40 70L12 60L40 50L24 22L54 36Z' fill='none' stroke='%23A88B4A' stroke-width='0.5' opacity='0.06'/%3E%3C/svg%3E");
          background-size: cover, 120px 120px;
        }

        .cert-inner {
          width: 100%;
          height: 100%;
          border: 1px solid #C4A55E;
          border-radius: 3px;
          padding: 28px 36px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .corner {
          position: absolute;
          color: #A88B4A;
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }
        .corner-tl { top: -10px;  inset-inline-start: -10px; }
        .corner-tr { top: -10px;  inset-inline-end:   -10px; }
        .corner-bl { bottom: -10px; inset-inline-start: -10px; }
        .corner-br { bottom: -10px; inset-inline-end:   -10px; }

        .cert-header {
          text-align: center;
          margin-bottom: 4px;
        }
        .bismillah {
          color: #A88B4A;
          font-size: 22px;
          margin: 0 0 6px;
          font-weight: 600;
        }
        .logo-wrap {
          display: inline-block;
          padding: 4px 18px;
        }
        :global(.cert-logo) {
          height: 78px;
          width: auto;
          object-fit: contain;
        }

        .cert-title {
          text-align: center;
          margin: 2px 0 8px;
        }
        .title-ar {
          font-size: 26px;
          font-weight: 900;
          color: #155E6B;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .title-en {
          font-family: 'Poppins', 'Cormorant Garamond', serif;
          font-size: 13px;
          color: #7D6530;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 4px 0 0;
        }
        .title-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 8px;
        }
        .title-divider::before, .title-divider::after {
          content: '';
          width: 60px;
          height: 1px;
          background: linear-gradient(to right, transparent, #A88B4A, transparent);
        }
        .title-divider span { color: #A88B4A; font-size: 16px; }

        .cert-body {
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 4px 20px;
        }
        .intro-ar {
          font-size: 15px;
          color: #2a2a2a;
          margin: 0;
        }
        .intro-en {
          font-family: 'Poppins', serif;
          font-size: 11px;
          color: #7D6530;
          letter-spacing: 1.5px;
          margin: 0 0 6px;
        }

        .name-frame {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 12px 36px;
          margin: 4px auto;
          border-top: 2px solid #A88B4A;
          border-bottom: 2px solid #A88B4A;
          background: linear-gradient(to bottom, transparent, rgba(168,139,74,0.06), transparent);
          width: fit-content;
        }
        .name-decor {
          color: #C4A55E;
          font-size: 22px;
        }
        .name {
          font-size: 36px;
          font-weight: 900;
          color: #7D6530;
          margin: 0;
          letter-spacing: 1px;
          line-height: 1.2;
          text-shadow: 0 1px 0 rgba(168,139,74,0.15);
        }

        .event-ar {
          font-size: 16px;
          color: #155E6B;
          margin: 6px 0 0;
        }
        .year {
          color: #A88B4A;
          font-size: 20px;
          font-weight: 900;
        }
        .event-en {
          font-family: 'Poppins', serif;
          font-size: 12px;
          color: #7D6530;
          letter-spacing: 1.5px;
          margin: 0 0 4px;
        }

        .prayer {
          margin: 6px auto;
          max-width: 800px;
        }
        .prayer-ar {
          font-size: 13.5px;
          color: #155E6B;
          line-height: 1.8;
          margin: 0;
          font-weight: 500;
        }
        .prayer-en {
          font-family: 'Poppins', serif;
          font-size: 11px;
          color: #7D6530;
          font-style: italic;
          margin: 4px 0 0;
        }

        .separator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 8px 0 6px;
        }
        .sep-line {
          width: 80px;
          height: 1px;
          background: linear-gradient(to right, transparent, #A88B4A, transparent);
        }
        .sep-icon { color: #A88B4A; font-size: 14px; }

        .closing {
          max-width: 720px;
          margin: 0 auto;
        }
        .closing-ar {
          font-size: 13px;
          color: #4a4a4a;
          font-style: italic;
          line-height: 1.8;
          margin: 0;
        }
        .closing-en {
          font-family: 'Poppins', serif;
          font-size: 10.5px;
          color: #7D6530;
          font-style: italic;
          margin: 4px 0 6px;
        }
        .team-sig {
          font-size: 11px;
          color: #A88B4A;
          font-weight: 700;
          margin: 4px 0 0;
          letter-spacing: 0.5px;
        }

        .cert-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-top: 6px;
          padding-top: 8px;
          border-top: 1px dashed rgba(168,139,74,0.3);
        }
        .footer-block {
          text-align: center;
          font-family: 'Cairo', sans-serif;
        }
        .footer-label {
          font-size: 9.5px;
          color: #7D6530;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: 0 0 4px;
          text-transform: uppercase;
        }
        .footer-value {
          font-size: 11px;
          color: #155E6B;
          font-weight: 600;
          margin: 0;
          line-height: 1.5;
        }
        .footer-en {
          font-family: 'Poppins', serif;
          font-size: 9.5px;
          color: #7D6530;
          font-style: italic;
        }
        .footer-spacer { flex: 1; }
        .qr-block { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        :global(.qr-img) {
          width: 58px;
          height: 58px;
          padding: 3px;
          background: #fff;
          border: 1px solid #A88B4A;
          border-radius: 3px;
        }
        .verify-code {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          color: #7D6530;
          letter-spacing: 1px;
          margin: 2px 0 0;
        }

        /* Mobile preview adjustments */
        @media (max-width: 900px) {
          .cert-inner { padding: 16px 18px 12px; }
          .title-ar { font-size: 18px; }
          .title-en { font-size: 10px; letter-spacing: 2.5px; }
          .name { font-size: 22px; }
          .name-frame { padding: 8px 16px; gap: 8px; }
          .name-decor { font-size: 16px; }
          .intro-ar { font-size: 11.5px; }
          .intro-en { font-size: 9px; }
          .event-ar { font-size: 12px; }
          .event-en { font-size: 9.5px; }
          .year { font-size: 15px; }
          .prayer-ar { font-size: 10.5px; line-height: 1.7; }
          .prayer-en { font-size: 9px; }
          .closing-ar { font-size: 10px; }
          .closing-en { font-size: 8.5px; }
          .team-sig { font-size: 9px; }
          :global(.cert-logo) { height: 50px; }
          .bismillah { font-size: 16px; }
          .sep-line { width: 40px; }
          .footer-label { font-size: 8px; }
          .footer-value { font-size: 9px; }
          .footer-en { font-size: 8px; }
          :global(.qr-img) { width: 44px; height: 44px; }
          .verify-code { font-size: 7.5px; }
          .corner { font-size: 14px; }
        }

        /* Print rules */
        @media print {
          .certificate {
            max-width: 100%;
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
            page-break-inside: avoid;
          }
          .cert-outer { padding: 4mm; }
          .cert-inner { padding: 8mm 12mm 6mm; }
        }
      `}</style>
    </div>
  );
}

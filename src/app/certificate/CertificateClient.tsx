'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import Certificate from '@/components/Certificate';
import { contact } from '@/content/site';

type Pilgrim = {
  name:       string;
  hajjYear:   string;
  country?:   string;
  verifyCode: string;
};

type State =
  | { stage: 'form' }
  | { stage: 'loading' }
  | { stage: 'found';     pilgrim: Pilgrim; qr: string }
  | { stage: 'notFound';  enteredId: string }
  | { stage: 'revoked';   reason: string }
  | { stage: 'error';     msg: string };

export default function CertificateClient() {
  const [nationalId, setNationalId] = useState('');
  const [state,      setState]      = useState<State>({ stage: 'form' });
  const certRef = useRef<HTMLDivElement>(null);

  /* Auto-fill from localStorage on mount (returning visitor) */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lastCertId');
      if (saved && /^\d{10}$/.test(saved)) setNationalId(saved);
    } catch {}
  }, []);

  const lookup = async (e: FormEvent) => {
    e.preventDefault();
    const id = nationalId.replace(/\D/g, '');
    if (!/^\d{10}$/.test(id)) {
      setState({ stage: 'error', msg: 'يجب إدخال رقم هوية صحيح (10 أرقام).' });
      return;
    }
    setState({ stage: 'loading' });
    try {
      const res = await fetch('/api/certificate/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: id }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 410) {                       // revoked
        setState({ stage: 'revoked', reason: data?.reason ?? '' });
        return;
      }
      if (res.status === 404) {                       // not found
        setState({ stage: 'notFound', enteredId: id });
        return;
      }
      if (!res.ok || !data.ok) {
        setState({ stage: 'error', msg: data?.error ?? 'حدث خطأ. حاول مرة أخرى.' });
        return;
      }

      const verifyUrl = `${window.location.origin}/verify/${data.pilgrim.verifyCode}`;
      const qr = await QRCode.toDataURL(verifyUrl, {
        margin: 1, width: 200, color: { dark: '#155E6B', light: '#FFFFFF' },
      });

      try { localStorage.setItem('lastCertId', id); } catch {}
      setState({ stage: 'found', pilgrim: data.pilgrim, qr });
    } catch {
      setState({ stage: 'error', msg: 'تعذّر الاتصال. تحقّق من الإنترنت.' });
    }
  };

  const reset = () => {
    setState({ stage: 'form' });
  };

  const print = () => window.print();

  const share = async () => {
    if (state.stage !== 'found') return;
    const url  = `${window.location.origin}/verify/${state.pilgrim.verifyCode}`;
    const text = `الحمد لله، تمّ إتمام مناسك الحج لعام ${state.pilgrim.hajjYear} هـ — تقبّل الله منا ومنكم.\n\nتذكار الحج المبارك — شركة بلاد الحرمين 🤍`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تذكار الحج المبارك — ${state.pilgrim.name}`,
          text,
          url,
        });
      } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text}\n${url}`); alert('تم نسخ التذكار للحافظة. شاركوه عبر أي تطبيق.'); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-cream
                    flex flex-col items-center py-6 sm:py-10 px-2 sm:px-4
                    print:p-0 print:bg-white print:min-h-0">

      {/* ────── Print rules: A4 landscape, exact dimensions, no overflow ────── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 297mm;
            height: 210mm;
          }

          /* Hide everything by default */
          body * { visibility: hidden !important; }

          /* Show only the certificate area */
          .cert-print-area, .cert-print-area * {
            visibility: visible !important;
          }

          .cert-print-area {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          /* Force exact A4 landscape on the certificate canvas */
          .bhc-wrap {
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
          }

          .bhc {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            aspect-ratio: auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bhc-outer {
            padding: 4mm !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .bhc-inner {
            padding: 8mm 12mm 8mm !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure seal & QR colors render */
          .bhc-seal, .bhc-qr, .bhc-logo {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* ────── Form / Result ────── */}
      {state.stage !== 'found' && (
        <div className="w-full max-w-xl print:hidden">
          {/* Brand */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <a href="/" className="bg-white/90 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 shadow-card hover:shadow-lg
                                   transition-shadow inline-block">
              <Image src="/images/logo.png" alt="بلاد الحرمين"
                     width={220} height={80} priority
                     className="h-12 sm:h-14 w-auto object-contain" />
            </a>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gold/20 p-5 sm:p-10">
            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold/15 items-center justify-center mb-3 sm:mb-4">
                <i className="fas fa-certificate text-gold text-xl sm:text-2xl" />
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-teal-dark mb-1.5 sm:mb-2">
                تذكار الحج المبارك
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                أدخل رقم الهوية الوطنية أو الإقامة لاستخراج تذكاركم
              </p>
            </div>

            {/* ── FORM stage ── */}
            {(state.stage === 'form' || state.stage === 'loading' || state.stage === 'error') && (
              <form onSubmit={lookup} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="nid" className="block text-sm font-bold text-teal-dark mb-1.5">
                    رقم الهوية الوطنية أو الإقامة
                  </label>
                  <input
                    id="nid"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    autoComplete="off"
                    autoFocus
                    dir="ltr"
                    className="form-input text-center text-lg tracking-widest font-mono"
                    placeholder="1XXXXXXXXX"
                    value={nationalId}
                    onChange={e => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                    <i className="fas fa-shield-halved text-gold" />
                    بياناتك محميّة ولن تُحفظ أو تُشارك.
                  </p>
                </div>

                {state.stage === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                                  rounded-xl p-3 flex items-start gap-2">
                    <i className="fas fa-circle-exclamation mt-0.5 flex-shrink-0" />
                    <span>{state.msg}</span>
                  </div>
                )}

                <button type="submit"
                        disabled={state.stage === 'loading' || nationalId.length !== 10}
                        className="w-full flex items-center justify-center gap-2
                                   bg-gold hover:bg-gold-light disabled:bg-gold/40 disabled:cursor-not-allowed
                                   text-white font-bold py-3.5 rounded-xl
                                   transition-all duration-300 hover:-translate-y-0.5
                                   shadow-gold hover:shadow-gold-lg">
                  {state.stage === 'loading'
                    ? <><i className="fas fa-spinner fa-spin" /><span>جاري البحث...</span></>
                    : <><i className="fas fa-search" /><span>استخراج التذكار</span></>
                  }
                </button>
              </form>
            )}

            {/* ── Revoked stage ── */}
            {state.stage === 'revoked' && (
              <div className="text-center py-4">
                <div className="inline-flex w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
                  <i className="fas fa-ban text-red-500 text-2xl" />
                </div>
                <h3 className="font-black text-red-700 mb-2">هذا التذكار ملغى</h3>
                {state.reason && (
                  <p className="text-sm text-gray-500 mb-4">السبب: {state.reason}</p>
                )}
                <p className="text-xs text-gray-400 mb-5">للاستفسار، تواصل معنا.</p>
                <div className="flex gap-2 justify-center">
                  <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
                                text-white text-sm font-bold px-4 py-2 rounded-lg transition">
                    <i className="fab fa-whatsapp" /> تواصل
                  </a>
                  <button onClick={reset}
                          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200
                                     text-gray-700 text-sm font-bold px-4 py-2 rounded-lg transition">
                    رجوع
                  </button>
                </div>
              </div>
            )}

            {/* ── Not found stage — show contact form ── */}
            {state.stage === 'notFound' && (
              <NotFoundForm enteredId={state.enteredId} onCancel={reset} />
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            <i className="fas fa-circle-info me-1 text-gold" />
            للاستفسار: <a href={`tel:${contact.phone}`} dir="ltr" className="text-teal font-bold">{contact.phone}</a>
          </p>
        </div>
      )}

      {/* ────── Certificate display ────── */}
      {state.stage === 'found' && (
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Welcome banner — hidden during print */}
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 text-center print:hidden">
            <div className="inline-flex flex-col items-center bg-white rounded-2xl
                            shadow-card border border-gold/20 px-4 sm:px-6 py-4 sm:py-5 max-w-lg">
              <div className="inline-flex w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br
                              from-gold to-gold-dark items-center justify-center mb-2 sm:mb-3 shadow-gold">
                <i className="fas fa-circle-check text-white text-xl sm:text-2xl" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-teal-dark mb-0.5 sm:mb-1">
                تقبّل الله منكم 🤍
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                تذكاركم جاهز — يمكنكم طباعته أو حفظه كملف PDF
              </p>
            </div>
          </div>

          {/* Action buttons — hidden during print, full-width grid on mobile */}
          <div className="max-w-4xl mx-auto grid grid-cols-3 sm:flex sm:flex-wrap
                          sm:items-center sm:justify-center gap-2 mb-4 sm:mb-5 print:hidden">
            <button onClick={print}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2
                               bg-gold hover:bg-gold-light text-white font-bold
                               px-3 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all
                               duration-200 hover:-translate-y-0.5 shadow-gold
                               text-xs sm:text-sm">
              <i className="fas fa-print" />
              <span className="hidden xs:inline sm:inline">طباعة /</span>
              <span>PDF</span>
            </button>
            <button onClick={share}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2
                               bg-teal hover:bg-teal-light text-white font-bold
                               px-3 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all
                               duration-200 hover:-translate-y-0.5 shadow-teal
                               text-xs sm:text-sm">
              <i className="fas fa-share-nodes" />
              مشاركة
            </button>
            <button onClick={reset}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2
                               bg-white border-2 border-gold/30 hover:border-gold
                               text-teal-dark hover:text-gold font-bold
                               px-3 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all duration-200
                               text-xs sm:text-sm">
              <i className="fas fa-arrow-rotate-left" />
              <span>بحث آخر</span>
            </button>
          </div>

          {/* Certificate — horizontal scroll on small screens so A4 proportions stay correct.
              900px min-width ensures all body content has room to render without overlap. */}
          <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible
                          print:overflow-visible print:mx-0 print:px-0">
            <div ref={certRef} className="cert-print-area w-full min-w-[1100px] sm:min-w-0">
              <Certificate
                name={state.pilgrim.name}
                hajjYear={state.pilgrim.hajjYear}
                verifyCode={state.pilgrim.verifyCode}
                qrDataUrl={state.qr}
              />
            </div>
          </div>

          {/* Mobile scroll hint */}
          <p className="sm:hidden text-center text-[11px] text-gray-400 mt-2 print:hidden">
            <i className="fas fa-arrows-left-right me-1 text-gold" />
            مرّر التذكار يميناً ويساراً لرؤيته كاملاً
          </p>

          {/* Footer tip */}
          <p className="max-w-4xl mx-auto text-center text-[11px] sm:text-xs text-gray-400
                        mt-4 sm:mt-5 px-2 print:hidden leading-relaxed">
            <i className="fas fa-lightbulb text-gold me-1" />
            عند الطباعة، اختر <strong>"حفظ بصيغة PDF"</strong> أو "A4 أفقي" من قائمة الطابعة.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component shown when entered ID is NOT in our pilgrim list ── */
function NotFoundForm({ enteredId, onCancel }: { enteredId: string; onCancel: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [note,     setNote]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('الاسم ورقم الجوال مطلوبان.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/certificate/notfound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: enteredId, name, phone, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error ?? 'تعذّر الإرسال.'); setLoading(false); return; }
      setDone(true);
    } catch {
      setError('تعذّر الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
          <i className="fas fa-circle-check text-green-500 text-2xl" />
        </div>
        <h3 className="font-black text-teal-dark mb-2">تم استلام بلاغكم</h3>
        <p className="text-sm text-gray-500 mb-5">
          سيتواصل معكم فريقنا للتحقّق من بياناتكم خلال أقرب وقت.
        </p>
        <button onClick={onCancel}
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light
                           text-white text-sm font-bold px-5 py-2.5 rounded-full transition">
          العودة
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Clear, prominent "not registered" message ── */}
      <div className="text-center mb-5">
        <div className="inline-flex w-16 h-16 rounded-full bg-amber-50 items-center justify-center mb-3">
          <i className="fas fa-circle-info text-amber-500 text-2xl" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-teal-dark mb-2 leading-snug">
          عذراً، رقم الهوية غير مسجّل في قائمتنا
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          هذا الرقم غير مدرج ضمن حجاج <strong>شركة بلاد الحرمين</strong>
          <br className="hidden sm:block" /> لهذا الموسم.
        </p>
        <p className="text-xs text-gray-400 mt-2 font-mono" dir="ltr">{enteredId}</p>
      </div>

      {/* ── Two actions: contact OR open report form ── */}
      {!showForm ? (
        <>
          <div className="bg-cream/60 border border-gold/20 rounded-xl p-4 mb-4 text-sm
                          text-gray-700 leading-relaxed">
            <p className="font-bold text-teal-dark mb-2">
              <i className="fas fa-question-circle text-gold me-1" />
              تعتقد أن هذا خطأ؟
            </p>
            <p className="text-xs">
              إن كنت من حجاج بلاد الحرمين لهذا الموسم وتأكّدت من رقم الهوية،
              يمكنك التواصل معنا مباشرة أو إرسال بلاغ سيُراجَع من الإدارة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
              `السلام عليكم، أحاول استخراج تذكار الحج لرقم هوية ${enteredId} لكن لم يُعرف. أرجو المساعدة.`,
            )}`} target="_blank" rel="noopener noreferrer"
               className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700
                          text-white text-sm font-bold px-4 py-3 rounded-xl transition shadow-sm">
              <i className="fab fa-whatsapp" />تواصل عبر واتساب
            </a>
            <button onClick={() => setShowForm(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white
                               border-2 border-gold/40 hover:border-gold text-teal-dark hover:text-gold
                               text-sm font-bold px-4 py-3 rounded-xl transition">
              <i className="fas fa-paper-plane" />إرسال بلاغ
            </button>
          </div>

          <button onClick={onCancel}
                  className="w-full mt-2 text-xs text-gray-400 hover:text-teal py-2 transition">
            <i className="fas fa-arrow-rotate-left me-1" />رجوع للبحث برقم آخر
          </button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3" noValidate>
          <p className="text-xs text-gray-500 mb-2 text-center">
            عبّئ بياناتك وسيتواصل معك فريقنا للتحقّق.
          </p>

          <input type="text" value={enteredId} disabled dir="ltr"
                 className="form-input text-center text-sm tracking-widest font-mono bg-gray-100" />

          <input type="text" placeholder="الاسم الكامل" value={name} maxLength={200}
                 onChange={e => setName(e.target.value)}
                 className="form-input" />

          <input type="tel" placeholder="رقم الجوال للتواصل" value={phone} maxLength={20}
                 onChange={e => setPhone(e.target.value)} dir="ltr"
                 className="form-input" />

          <textarea placeholder="ملاحظة (اختياري)" rows={2} value={note} maxLength={500}
                    onChange={e => setNote(e.target.value)}
                    className="form-input resize-none" />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2">
              <i className="fas fa-circle-exclamation me-1" />{error}
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-light
                               disabled:bg-gold/40 text-white text-sm font-bold py-2.5 rounded-lg transition">
              {loading
                ? <><i className="fas fa-spinner fa-spin" />جاري الإرسال...</>
                : <><i className="fas fa-paper-plane" />إرسال البلاغ</>}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700
                               text-sm font-bold rounded-lg transition">
              رجوع
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

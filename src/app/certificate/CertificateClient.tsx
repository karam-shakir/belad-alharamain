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
    const url = `${window.location.origin}/verify/${state.pilgrim.verifyCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'شهادة إتمام الحج',
          text:  `الحمد لله، تمّ إتمام مناسك الحج لعام ${state.pilgrim.hajjYear}هـ — تقبّل الله منا ومنكم.`,
          url,
        });
      } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); alert('تم نسخ رابط التحقّق.'); } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-cream
                    flex flex-col items-center py-10 px-4 print:p-0 print:bg-white print:min-h-0">

      {/* ────── Hide everything except certificate during print ────── */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .cert-print-area, .cert-print-area * { visibility: visible; }
          .cert-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          @page { size: A4 landscape; margin: 0; }
        }
      `}</style>

      {/* ────── Form / Result ────── */}
      {state.stage !== 'found' && (
        <div className="w-full max-w-xl print:hidden">
          {/* Brand */}
          <div className="flex justify-center mb-6">
            <a href="/" className="bg-white/90 rounded-2xl px-5 py-3 shadow-card hover:shadow-lg
                                   transition-shadow inline-block">
              <Image src="/images/logo.png" alt="بلاد الحرمين"
                     width={220} height={80} priority
                     className="h-14 w-auto object-contain" />
            </a>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gold/20 p-7 sm:p-10">
            <div className="text-center mb-6">
              <div className="inline-flex w-16 h-16 rounded-full bg-gold/15 items-center justify-center mb-4">
                <i className="fas fa-certificate text-gold text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-teal-dark mb-2">
                شهادة إتمام مناسك الحج
              </h1>
              <p className="text-sm text-gray-500">
                أدخل رقم الهوية الوطنية أو الإقامة لاستخراج شهادتك
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
                    : <><i className="fas fa-search" /><span>استخراج الشهادة</span></>
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
                <h3 className="font-black text-red-700 mb-2">هذه الشهادة ملغاة</h3>
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
          <div className="max-w-4xl mx-auto mb-6 text-center print:hidden">
            <div className="inline-flex flex-col items-center bg-white rounded-2xl
                            shadow-card border border-gold/20 px-6 py-5 max-w-lg">
              <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br
                              from-gold to-gold-dark items-center justify-center mb-3 shadow-gold">
                <i className="fas fa-circle-check text-white text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-teal-dark mb-1">
                تقبّل الله منكم 🤍
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                شهادتكم جاهزة — يمكنكم طباعتها أو حفظها كملف PDF
              </p>
            </div>
          </div>

          {/* Action buttons — hidden during print */}
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center
                          gap-2 mb-5 print:hidden">
            <button onClick={print}
                    className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light
                               text-white font-bold px-5 py-3 rounded-full transition-all
                               duration-200 hover:-translate-y-0.5 shadow-gold">
              <i className="fas fa-print" />
              طباعة / حفظ PDF
            </button>
            <button onClick={share}
                    className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light
                               text-white font-bold px-5 py-3 rounded-full transition-all
                               duration-200 hover:-translate-y-0.5 shadow-teal">
              <i className="fas fa-share-nodes" />
              مشاركة
            </button>
            <button onClick={reset}
                    className="inline-flex items-center gap-2 bg-white border-2 border-gold/30
                               hover:border-gold text-teal-dark hover:text-gold
                               font-bold px-5 py-3 rounded-full transition-all duration-200">
              <i className="fas fa-arrow-rotate-left" />
              بحث آخر
            </button>
          </div>

          {/* Certificate */}
          <div ref={certRef} className="cert-print-area w-full">
            <Certificate
              name={state.pilgrim.name}
              hajjYear={state.pilgrim.hajjYear}
              verifyCode={state.pilgrim.verifyCode}
              qrDataUrl={state.qr}
            />
          </div>

          {/* Footer tip */}
          <p className="max-w-4xl mx-auto text-center text-xs text-gray-400 mt-5 print:hidden">
            <i className="fas fa-lightbulb text-gold me-1" />
            عند الطباعة، اختر <strong>"حفظ بصيغة PDF"</strong> من قائمة الطابعة لحفظها كملف.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component: "حاج غير موجود" with bug-report form ── */
function NotFoundForm({ enteredId, onCancel }: { enteredId: string; onCancel: () => void }) {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [note,    setNote]    = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

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
        <h3 className="font-black text-teal-dark mb-2">تم استلام البلاغ</h3>
        <p className="text-sm text-gray-500 mb-5">
          سيتواصل معكم فريقنا للتحقق من بياناتكم قريباً.
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm
                      text-amber-900 flex items-start gap-2">
        <i className="fas fa-circle-info mt-0.5 text-amber-600" />
        <div>
          <p className="font-bold">رقم الهوية غير موجود في قائمتنا.</p>
          <p className="text-xs mt-1">إن كنت من حجاجنا، عبّئ النموذج وسنتواصل معك للتحقق.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
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
          <button type="button" onClick={onCancel}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700
                             text-sm font-bold rounded-lg transition">
            رجوع
          </button>
        </div>
      </form>
    </div>
  );
}

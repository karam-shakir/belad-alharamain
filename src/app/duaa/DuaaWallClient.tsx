'use client';

import { useCallback, useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ScrollInit from '@/components/ScrollInit';

const MAX_MSG = 300;
const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://belad-alharamain.com';

interface Duaa {
  id:            string;
  name:          string;
  country:       string;
  message:       string;
  hajjYear?:     string;
  reactionCount: number;
  createdAt:     number;
  reactedByMe?:  boolean;
}

const VERSES = [
  { ar: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ', ref: 'البقرة ١٨٦' },
  { ar: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',                                                  ref: 'غافر ٦٠'  },
  { ar: 'أَمَّن يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ',                                       ref: 'النمل ٦٢' },
  { ar: 'وَإِذَا مَسَّكَ ضُرٌّ فَإِلَيْهِ تَجْأَرُونَ',                                                      ref: 'النحل ٥٣' },
];

function fmtRelativeAr(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60)      return `قبل ${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60)      return `قبل ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24)      return `قبل ${h} س`;
  const d = Math.floor(h / 24);
  if (d < 7)       return `قبل ${d} يوم`;
  const w = Math.floor(d / 7);
  if (w < 5)       return `قبل ${w} أسبوع`;
  const mo = Math.floor(d / 30);
  if (mo < 12)     return `قبل ${mo} شهر`;
  return new Date(ts).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* Pick a verse based on current minute so it changes naturally across visits */
function pickVerse() {
  const i = Math.floor((Date.now() / 60_000)) % VERSES.length;
  return VERSES[i];
}

export default function DuaaWallClient({ highlightId }: { highlightId: string | null }) {
  const [items,    setItems]    = useState<Duaa[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<'latest' | 'popular'>('latest');
  const [stats,    setStats]    = useState({ total: 0, totalReacts: 0 });
  const [verse]                  = useState(pickVerse);
  const verseFlavorRef           = useRef(pickVerse);

  /* Fetch the list of duaas */
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/duaa?sort=${sort}&limit=50`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok) {
        const list: Duaa[] = data.items;
        setItems(list);
        const total       = list.length;
        const totalReacts = list.reduce((s, d) => s + (d.reactionCount ?? 0), 0);
        setStats({ total, totalReacts });
      }
    } finally { setLoading(false); }
  }, [sort]);

  useEffect(() => { fetchList(); }, [fetchList]);

  /* Highlight & scroll to a specific duaa if a permalink was opened */
  useEffect(() => {
    if (!highlightId || loading) return;
    const el = document.getElementById(`duaa-${highlightId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-gold', 'ring-offset-2');
      setTimeout(() => el.classList.remove('ring-2', 'ring-gold', 'ring-offset-2'), 3000);
    }
  }, [highlightId, loading, items]);

  return (
    <>
      <ScrollInit />
      <Navbar />
      <main className="bg-pattern-white min-h-screen pt-24 pb-20">

        {/* ── Hero ─── */}
        <section className="relative max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <div className="text-center reveal">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20
                            rounded-full bg-gradient-to-br from-gold to-gold-dark
                            shadow-gold mb-5">
              <i className="fas fa-hands-praying text-white text-2xl sm:text-3xl" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-teal-dark mb-3 leading-tight">
              تذكروني في دعائكم
            </h1>
            <p className="text-gold-dark text-sm sm:text-base mb-1">
              حائط مفتوح للأمّة — شاركوا دعواتكم، وادعوا لإخوانكم
            </p>

            {/* Verse card */}
            <div className="mt-6 mx-auto max-w-2xl">
              <div className="bg-gradient-to-br from-cream via-white to-cream-dark
                              border-2 border-gold/30 rounded-3xl p-5 sm:p-7
                              shadow-card relative overflow-hidden">
                <div className="absolute top-2 left-3 text-gold/30 text-4xl">❝</div>
                <div className="absolute bottom-2 right-3 text-gold/30 text-4xl">❞</div>
                <p className="text-teal-dark text-base sm:text-xl font-bold leading-loose px-6">
                  {verse.ar}
                </p>
                <p className="text-gold-dark text-xs sm:text-sm mt-3 font-semibold">— {verse.ref}</p>
              </div>
            </div>

            {/* Stats */}
            {stats.total > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5
                              text-sm sm:text-base">
                <span className="inline-flex items-center gap-1.5 text-teal-dark font-bold
                                 bg-white px-4 py-1.5 rounded-full border border-gold/20 shadow-card">
                  <i className="fas fa-bookmark text-gold" />
                  <span>{stats.total}</span>
                  <span className="text-gray-500 font-medium">دعاء</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-teal-dark font-bold
                                 bg-white px-4 py-1.5 rounded-full border border-gold/20 shadow-card">
                  <i className="fas fa-hands-praying text-gold" />
                  <span>{stats.totalReacts}</span>
                  <span className="text-gray-500 font-medium">تفاعل بالدعاء</span>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ── Submit form ─── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-8">
          <SubmitForm onSubmitted={fetchList} />
        </section>

        {/* ── Sort tabs ─── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-5 flex items-center justify-center gap-2">
          <button onClick={() => setSort('latest')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all
                    ${sort === 'latest'
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-white text-teal-dark border border-gold/20 hover:border-gold/40'}`}>
            <i className="fas fa-clock me-1.5" />الأحدث
          </button>
          <button onClick={() => setSort('popular')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all
                    ${sort === 'popular'
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-white text-teal-dark border border-gold/20 hover:border-gold/40'}`}>
            <i className="fas fa-fire me-1.5" />الأكثر طلباً للدعاء
          </button>
        </section>

        {/* ── Feed ─── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          {loading && items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <i className="fas fa-spinner fa-spin text-3xl mb-3" />
              <p className="text-sm">جاري التحميل...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gold/15 shadow-card
                            text-center py-16 px-6">
              <i className="fas fa-hands-praying text-gold/40 text-5xl mb-4" />
              <p className="text-gray-500 font-medium mb-1">لا توجد دعوات بعد</p>
              <p className="text-xs text-gray-400">كن أول من يُشارك دعاءه</p>
            </div>
          ) : (
            items.map(d => (
              <DuaaCard key={d.id} duaa={d}
                        onReacted={(count) => {
                          setItems(prev => prev.map(p => p.id === d.id
                            ? { ...p, reactionCount: count, reactedByMe: true } : p));
                          setStats(s => ({ ...s, totalReacts: s.totalReacts + 1 }));
                        }} />
            ))
          )}
        </section>

        {/* Footer note */}
        {items.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-10 px-4">
            <i className="fas fa-circle-info me-1 text-gold" />
            عدد الدعوات يكبر مع كل قلب — جزى الله من شارك في الخير.
          </p>
        )}
      </main>
      <Footer />
      <FloatingElements />
    </>
  );
}

/* ─────────────────────── Submit Form ─────────────────────── */
function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open,       setOpen]       = useState(false);
  const [name,       setName]       = useState('');
  const [country,    setCountry]    = useState('');
  const [message,    setMessage]    = useState('');
  const [nationalId, setNationalId] = useState('');
  const [busy,       setBusy]       = useState(false);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) { setError('الدعاء مطلوب.'); return; }
    setBusy(true);
    try {
      const hp = (document.getElementById('duaa-hp') as HTMLInputElement | null)?.value ?? '';
      const res = await fetch('/api/duaa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, message, nationalId: nationalId || undefined, hp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'تعذّر إرسال الدعاء.');
        setBusy(false);
        return;
      }
      setDone(true);
      setName(''); setCountry(''); setMessage(''); setNationalId('');
      onSubmitted();
      setTimeout(() => { setDone(false); setOpen(false); }, 2500);
    } catch {
      setError('تعذّر الاتصال.');
    } finally { setBusy(false); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
              className="w-full bg-gradient-to-br from-gold to-gold-dark hover:from-gold-light hover:to-gold
                         text-white font-bold py-4 rounded-2xl shadow-gold
                         transition-all duration-200 hover:-translate-y-0.5
                         flex items-center justify-center gap-2 text-base">
        <i className="fas fa-plus" />
        أضف دعاءك
      </button>
    );
  }

  if (done) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50
                      border-2 border-green-200 rounded-2xl p-8 text-center">
        <div className="inline-flex w-16 h-16 rounded-full bg-green-500 items-center justify-center mb-3">
          <i className="fas fa-check text-white text-2xl" />
        </div>
        <h3 className="font-black text-green-800 text-lg mb-1">تم إضافة دعاءك</h3>
        <p className="text-green-700 text-sm">جزاكم الله خيراً — نسأل الله أن يستجيب لكم</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate
          className="bg-white rounded-2xl border-2 border-gold/30 shadow-card p-5 sm:p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-teal-dark flex items-center gap-2">
          <i className="fas fa-pen-to-square text-gold" />
          شارك دعاءك
        </h3>
        <button type="button" onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <i className="fas fa-xmark" />
        </button>
      </div>

      {/* Honeypot */}
      <input type="text" name="hp" id="duaa-hp" tabIndex={-1} autoComplete="off"
             aria-hidden="true"
             style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-teal-dark mb-1">الاسم (اختياري)</label>
          <input type="text" className="form-input" maxLength={60}
                 placeholder="زائر كريم"
                 value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-teal-dark mb-1">البلد (اختياري)</label>
          <input type="text" className="form-input" maxLength={40}
                 placeholder="مثلاً: السعودية، مصر، ماليزيا..."
                 value={country} onChange={e => setCountry(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-teal-dark mb-1">
          دعاؤك <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal mx-1">
            ({message.length}/{MAX_MSG})
          </span>
        </label>
        <textarea className="form-input min-h-[120px] resize-y" rows={4}
                  maxLength={MAX_MSG}
                  placeholder="اللهم..."
                  value={message} onChange={e => setMessage(e.target.value)} />
        <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
          <i className="fas fa-shield-halved text-gold" />
          تجنّب ذكر الأرقام الخاصة (جوّال/هوية) أو الروابط — ستُرفض تلقائياً.
        </p>
      </div>

      <details className="bg-gold/5 rounded-lg border border-gold/15">
        <summary className="px-3 py-2 text-xs font-bold text-teal-dark cursor-pointer flex items-center gap-1">
          <i className="fas fa-star text-gold" />
          هل أنت حاج معنا؟ احصل على شارة "حاج" بإدخال رقم هويتك
        </summary>
        <div className="p-3">
          <input type="text" className="form-input text-center font-mono tracking-widest"
                 dir="ltr" maxLength={10}
                 placeholder="1XXXXXXXXX"
                 value={nationalId}
                 onChange={e => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          <p className="text-[11px] text-gray-500 mt-1.5">
            رقمك لن يظهر للزوار — يُستخدم فقط للتحقق من قائمة الحجاج.
          </p>
        </div>
      </details>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
          <i className="fas fa-circle-exclamation mt-0.5" /><span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={busy || !message.trim()}
              className="w-full bg-gold hover:bg-gold-light disabled:bg-gold/40
                         text-white font-bold py-3.5 rounded-xl
                         transition-all hover:-translate-y-0.5 shadow-gold
                         flex items-center justify-center gap-2">
        {busy ? <><i className="fas fa-spinner fa-spin" />جاري الإرسال...</>
              : <><i className="fas fa-paper-plane" />ارفع دعاءي</>}
      </button>
    </form>
  );
}

/* ─────────────────────── Single Duaa Card ─────────────────────── */
function DuaaCard({ duaa, onReacted }: { duaa: Duaa; onReacted: (count: number) => void }) {
  const [reactedNow, setReactedNow] = useState(duaa.reactedByMe ?? false);
  const [count,      setCount]      = useState(duaa.reactionCount ?? 0);
  const [busy,       setBusy]       = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [shareOpen,  setShareOpen]  = useState(false);

  const handleReact = async () => {
    if (busy || reactedNow) return;
    setBusy(true);
    // optimistic
    setReactedNow(true);
    setCount(c => c + 1);
    setShowThanks(true);
    try {
      const res = await fetch(`/api/duaa/${duaa.id}/react`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (data?.alreadyReacted) {
        /* already counted before — keep optimistic state but don't bump server count */
      } else if (data?.ok && typeof data.count === 'number') {
        setCount(data.count);
        onReacted(data.count);
      }
    } catch {
      // revert on hard failure
      setReactedNow(false);
      setCount(c => Math.max(0, c - 1));
    } finally {
      setBusy(false);
      setTimeout(() => setShowThanks(false), 2200);
    }
  };

  const displayName = duaa.name?.trim() || 'زائر كريم';
  const url = `${SITE}/duaa/${duaa.id}`;
  const shareText =
    `🤲 أرجو دعوتكم...\n\n` +
    `"${duaa.message}"\n` +
    (duaa.name ? `— ${duaa.name}${duaa.country ? ` · ${duaa.country}` : ''}\n` : '') +
    `\nشاركوني الدعاء:\n${url}\n\nحائط الدعاء — بلاد الحرمين 🕋`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'تذكروني في دعائكم', text: shareText, url }); return; }
      catch { /* user cancelled */ }
    }
    setShareOpen(o => !o);
  };

  return (
    <article id={`duaa-${duaa.id}`}
             className="bg-white rounded-2xl border border-gold/15 shadow-card
                        p-5 sm:p-6 relative overflow-hidden transition-shadow hover:shadow-card-lg">

      {/* Top gold accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gold-gradient" />

      {/* Quote marks */}
      <div className="absolute top-3 right-4 text-gold/20 text-3xl leading-none select-none" aria-hidden>❝</div>
      <div className="absolute bottom-3 left-4  text-gold/20 text-3xl leading-none select-none" aria-hidden>❞</div>

      {/* Message */}
      <p className="text-teal-dark text-base sm:text-lg leading-loose
                    font-medium mb-5 px-6 sm:px-8 whitespace-pre-wrap text-center">
        {duaa.message}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1
                      text-xs text-gray-500 mb-4 pb-4 border-b border-gold/10">
        {duaa.hajjYear && (
          <span className="inline-flex items-center gap-1 bg-gold/15 text-gold-dark
                           px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <i className="fas fa-star text-[9px]" />
            حاج {duaa.hajjYear}
          </span>
        )}
        <span className="font-bold text-teal-dark">{displayName}</span>
        {duaa.country && (
          <>
            <span className="text-gray-300">·</span>
            <span><i className="fas fa-location-dot text-gold me-1" />{duaa.country}</span>
          </>
        )}
        <span className="text-gray-300">·</span>
        <span>{fmtRelativeAr(duaa.createdAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 relative">
        <button onClick={handleReact} disabled={busy || reactedNow}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           font-bold text-sm transition-all duration-200
                           ${reactedNow
                             ? 'bg-gold text-white shadow-gold cursor-default'
                             : 'bg-white border-2 border-gold/40 text-gold-dark hover:bg-gold/5 hover:border-gold hover:-translate-y-0.5'}`}>
          <span className="text-lg">🤲</span>
          <span>{reactedNow ? 'دعوتُ له' : 'ادعُ له'}</span>
          {count > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black
              ${reactedNow ? 'bg-white/25' : 'bg-gold/15 text-gold-dark'}`}>
              {count}
            </span>
          )}
        </button>

        <button onClick={handleShare} aria-label="مشاركة"
                className="w-11 h-11 rounded-xl bg-white border-2 border-teal/20 text-teal-dark
                           hover:bg-teal hover:text-white hover:border-teal transition-all
                           flex items-center justify-center">
          <i className="fas fa-share-nodes" />
        </button>

        {/* Desktop share dropdown */}
        {shareOpen && (
          <div className="absolute bottom-full end-0 mb-2 bg-white rounded-xl
                          border border-gold/20 shadow-card-lg p-1.5 z-10 flex flex-col gap-0.5 min-w-[180px]">
            <ShareLink href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} icon="fa-whatsapp" label="واتساب" color="text-green-600" />
            <ShareLink href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} icon="fa-x-twitter" label="X (تويتر)" color="text-gray-800" />
            <ShareLink href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} icon="fa-facebook" label="فيسبوك" color="text-blue-600" />
            <ShareLink href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`} icon="fa-telegram" label="تيليجرام" color="text-sky-500" />
            <button onClick={() => { navigator.clipboard.writeText(url); setShareOpen(false); alert('تم نسخ الرابط ✓'); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold/10 text-sm font-bold text-teal-dark">
              <i className="fas fa-link text-gold" />نسخ الرابط
            </button>
          </div>
        )}
      </div>

      {/* Thanks overlay (small toast within card) */}
      {showThanks && (
        <div className="absolute inset-0 flex items-center justify-center
                        bg-gradient-to-br from-gold/95 to-gold-dark/95 rounded-2xl
                        text-white text-center px-6 animate-[fadeIn_0.3s_ease]">
          <div>
            <div className="text-3xl mb-2">🤍</div>
            <p className="font-black text-lg mb-0.5">تقبّل الله منا ومنكم</p>
            <p className="text-sm text-white/90">جزاكم الله خيراً</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </article>
  );
}

function ShareLink({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gold/10 text-sm font-bold text-teal-dark">
      <i className={`fab ${icon} ${color}`} />{label}
    </a>
  );
}

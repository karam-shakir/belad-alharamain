'use client';

import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingElements from '@/components/FloatingElements';
import ScrollInit from '@/components/ScrollInit';

const MAX_MSG = 300;
const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://belad-alharamain.com';

interface Duaa {
  id:                    string;
  name:                  string;
  country:               string;
  message:               string;
  hajjYear?:             string;
  reactionCount:         number;
  reactionCountPilgrims: number;
  replyCount:            number;
  createdAt:             number;
  reactedByMe?:          boolean;
}

interface DuaaReply {
  id:        string;
  duaaId:    string;
  name:      string;
  country:   string;
  hajjYear?: string;
  message:   string;
  createdAt: number;
}

interface Identity {
  nationalId: string;
  hajjYear:   string;
  nameMasked?: string;
  verifiedAt: number;
}

const IDENTITY_KEY = 'bh-duaa-identity';

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

function pickVerse() {
  const i = Math.floor((Date.now() / 60_000)) % VERSES.length;
  return VERSES[i];
}

function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.nationalId === 'string' && typeof parsed.hajjYear === 'string') return parsed;
  } catch {}
  return null;
}

function saveIdentity(id: Identity) {
  try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(id)); } catch {}
}

function clearIdentity() {
  try { localStorage.removeItem(IDENTITY_KEY); } catch {}
}

export default function DuaaWallClient({ highlightId }: { highlightId: string | null }) {
  const [items,    setItems]    = useState<Duaa[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<'latest' | 'popular'>('latest');
  const [stats,    setStats]    = useState({ total: 0, totalReacts: 0, pilgrimReacts: 0 });
  const [verse]                  = useState(pickVerse);
  const [identity, setIdentity] = useState<Identity | null>(null);

  /* Load saved identity on mount */
  useEffect(() => { setIdentity(loadIdentity()); }, []);

  /* Fetch the list of duaas */
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/duaa?sort=${sort}&limit=50`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok) {
        const list: Duaa[] = data.items;
        setItems(list);
        setStats({
          total:         list.length,
          totalReacts:   list.reduce((s, d) => s + (d.reactionCount         ?? 0), 0),
          pilgrimReacts: list.reduce((s, d) => s + (d.reactionCountPilgrims ?? 0), 0),
        });
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
      <main className="bg-pattern-white min-h-screen pt-20 sm:pt-24 pb-16 sm:pb-20">

        {/* ── Hero ─── */}
        <section className="relative max-w-4xl mx-auto px-3 sm:px-6 mb-6 sm:mb-8">
          <div className="text-center reveal">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20
                            rounded-full bg-gradient-to-br from-gold to-gold-dark
                            shadow-gold mb-4 sm:mb-5">
              <i className="fas fa-hands-praying text-white text-xl sm:text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-5xl font-black text-teal-dark mb-2 sm:mb-3 leading-tight">
              اذكروني بدعوة
            </h1>
            <p className="text-gold-dark text-xs sm:text-base mb-1 px-4">
              حائط مفتوح للأمّة — شاركوا دعواتكم، وادعوا لإخوانكم
            </p>

            {/* Verse card */}
            <div className="mt-5 sm:mt-6 mx-auto max-w-2xl">
              <div className="bg-gradient-to-br from-cream via-white to-cream-dark
                              border-2 border-gold/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7
                              shadow-card relative overflow-hidden">
                <div className="absolute top-1 left-2 text-gold/30 text-3xl sm:text-4xl">❝</div>
                <div className="absolute bottom-1 right-2 text-gold/30 text-3xl sm:text-4xl">❞</div>
                <p className="text-teal-dark text-sm sm:text-xl font-bold leading-loose px-4 sm:px-6">
                  {verse.ar}
                </p>
                <p className="text-gold-dark text-[11px] sm:text-sm mt-2 sm:mt-3 font-semibold">— {verse.ref}</p>
              </div>
            </div>

            {/* Stats */}
            {stats.total > 0 && (
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3
                              text-[11px] sm:text-sm">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-teal-dark font-bold
                                 bg-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-gold/20 shadow-card">
                  <i className="fas fa-bookmark text-gold text-[10px] sm:text-sm" />
                  <span>{stats.total}</span>
                  <span className="text-gray-500 font-medium">دعاء</span>
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-teal-dark font-bold
                                 bg-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-gold/20 shadow-card">
                  <i className="fas fa-hands-praying text-gold text-[10px] sm:text-sm" />
                  <span>{stats.totalReacts}</span>
                  <span className="text-gray-500 font-medium">تفاعل</span>
                </span>
                {stats.pilgrimReacts > 0 && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 text-amber-700 font-bold
                                   bg-amber-50 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-amber-200 shadow-card">
                    <i className="fas fa-star text-amber-500 text-[10px] sm:text-sm" />
                    <span>{stats.pilgrimReacts}</span>
                    <span className="text-amber-600 font-medium">من حجاجنا</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Identity Panel ─── */}
        <section className="max-w-3xl mx-auto px-3 sm:px-6 mb-4 sm:mb-6">
          <IdentityPanel identity={identity}
                         onIdentified={(id) => { saveIdentity(id); setIdentity(id); }}
                         onCleared={() => { clearIdentity(); setIdentity(null); }} />
        </section>

        {/* ── Submit form ─── */}
        <section className="max-w-3xl mx-auto px-3 sm:px-6 mb-6 sm:mb-8">
          <SubmitForm identity={identity} onSubmitted={fetchList} />
        </section>

        {/* ── Sort tabs ─── */}
        <section className="max-w-3xl mx-auto px-3 sm:px-6 mb-4 sm:mb-5 flex items-center justify-center gap-2">
          <button onClick={() => setSort('latest')}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all
                    ${sort === 'latest'
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-white text-teal-dark border border-gold/20 hover:border-gold/40'}`}>
            <i className="fas fa-clock me-1" />الأحدث
          </button>
          <button onClick={() => setSort('popular')}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all
                    ${sort === 'popular'
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-white text-teal-dark border border-gold/20 hover:border-gold/40'}`}>
            <i className="fas fa-fire me-1" />الأكثر طلباً
          </button>
        </section>

        {/* ── Feed ─── */}
        <section className="max-w-3xl mx-auto px-3 sm:px-6 space-y-3 sm:space-y-4">
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
              <DuaaCard key={d.id} duaa={d} identity={identity}
                        onReacted={(r) => {
                          setItems(prev => prev.map(p => p.id === d.id
                            ? { ...p,
                                reactionCount:         r.count,
                                reactionCountPilgrims: r.pilgrimCount,
                                reactedByMe:           true }
                            : p));
                          setStats(s => ({
                            ...s,
                            totalReacts:   s.totalReacts + 1,
                            pilgrimReacts: s.pilgrimReacts + (r.reactorBadge === 'pilgrim' ? 1 : 0),
                          }));
                        }} />
            ))
          )}
        </section>

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

/* ─────────────────────── Identity Panel ─────────────────────── */
function IdentityPanel({
  identity, onIdentified, onCleared,
}: {
  identity: Identity | null;
  onIdentified: (id: Identity) => void;
  onCleared: () => void;
}) {
  const [open,  setOpen]  = useState(false);
  const [nid,   setNid]   = useState('');
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    setError('');
    if (!/^\d{10}$/.test(nid)) { setError('رقم الهوية يجب أن يكون ١٠ أرقام.'); return; }
    setBusy(true);
    try {
      const res  = await fetch('/api/duaa/identify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: nid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data?.error || 'تعذّر التحقّق.');
        return;
      }
      onIdentified({
        nationalId: nid,
        hajjYear:   String(data.hajjYear ?? ''),
        nameMasked: data.nameMasked,
        verifiedAt: Date.now(),
      });
      setOpen(false);
      setNid('');
    } catch {
      setError('تعذّر الاتصال.');
    } finally { setBusy(false); }
  };

  /* Verified pilgrim identity */
  if (identity) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50
                      border-2 border-amber-300 rounded-2xl px-4 py-3
                      flex items-center gap-3 shadow-card">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700
                        flex items-center justify-center text-white shadow-amber-500/40 shadow-md">
          <i className="fas fa-star text-base" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-amber-700 font-bold">أنت من حجاج بلاد الحرمين</p>
          <p className="text-sm font-black text-amber-900">
            ⭐ حاج {identity.hajjYear}{identity.nameMasked ? ` · ${identity.nameMasked}` : ''}
          </p>
          <p className="text-[11px] text-amber-700/80 mt-0.5">
            دعواتك وتفاعلاتك ستظهر بشارة الحاج
          </p>
        </div>
        <button onClick={onCleared}
                title="إزالة التوثيق من هذا المتصفّح"
                className="w-8 h-8 rounded-lg hover:bg-amber-200 text-amber-700 transition flex items-center justify-center">
          <i className="fas fa-xmark text-sm" />
        </button>
      </div>
    );
  }

  /* Visitor — option to identify */
  return (
    <div className="bg-white border border-gold/20 rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gold/5 transition">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
          🤍
        </div>
        <div className="flex-1 min-w-0 text-start">
          <p className="text-xs text-gray-500 font-medium">حالتك الحالية</p>
          <p className="text-sm font-bold text-teal-dark">زائر كريم</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-dark">
          {open ? 'إغلاق' : 'حدّد نفسك كحاج'}
          <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-[10px]`} />
        </span>
      </button>

      {open && (
        <div className="border-t border-gold/15 p-4 bg-gold/5">
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
            <i className="fas fa-star text-gold me-1" />
            إن كنت من حجاج بلاد الحرمين، أدخل رقم هويتك للحصول على شارة "حاج" تظهر مع كل دعاء أو تفاعل تقوم به.
          </p>
          <div className="flex gap-2">
            <input type="text" inputMode="numeric" maxLength={10} dir="ltr"
                   className="form-input text-center font-mono tracking-widest flex-1"
                   placeholder="١٠ أرقام"
                   value={nid}
                   onChange={e => setNid(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            <button onClick={verify} disabled={busy || nid.length !== 10}
                    className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light disabled:bg-gold/40
                               text-white text-sm font-bold transition shadow-gold whitespace-nowrap">
              {busy ? <i className="fas fa-spinner fa-spin" /> : 'تحقّق'}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <i className="fas fa-circle-exclamation" />{error}
            </p>
          )}
          <p className="text-[11px] text-gray-400 mt-2">
            🔒 لن يظهر رقم هويتك لأحد — فقط شارة "حاج" مع سنة الحج.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Submit Form ─────────────────────── */
function SubmitForm({ identity, onSubmitted }: { identity: Identity | null; onSubmitted: () => void }) {
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) { setError('الدعاء مطلوب.'); return; }
    setBusy(true);
    try {
      const hp = (document.getElementById('duaa-hp') as HTMLInputElement | null)?.value ?? '';
      const res = await fetch('/api/duaa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, country, message,
          nationalId: identity?.nationalId,
          hp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'تعذّر إرسال الدعاء.');
        setBusy(false);
        return;
      }
      setDone(true);
      setName(''); setCountry(''); setMessage('');
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
        {identity && (
          <span className="ms-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            ⭐ سيظهر دعاؤك بشارة حاج
          </span>
        )}
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

      {identity && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800
                        flex items-center gap-2">
          <i className="fas fa-star text-amber-600" />
          سيظهر دعاؤك بشارة <strong>"⭐ حاج {identity.hajjYear}"</strong>
        </div>
      )}

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
function DuaaCard({
  duaa, identity, onReacted,
}: {
  duaa: Duaa;
  identity: Identity | null;
  onReacted: (r: { count: number; pilgrimCount: number; reactorBadge: 'pilgrim' | 'visitor' }) => void;
}) {
  const [reactedNow,   setReactedNow]   = useState(duaa.reactedByMe ?? false);
  const [count,        setCount]        = useState(duaa.reactionCount         ?? 0);
  const [pilgrimCount, setPilgrimCount] = useState(duaa.reactionCountPilgrims ?? 0);
  const [busy,         setBusy]         = useState(false);
  const [showThanks,   setShowThanks]   = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);

  /* ── Replies state ─── */
  const [replyCount,   setReplyCount]   = useState(duaa.replyCount ?? 0);
  const [replies,      setReplies]      = useState<DuaaReply[]>([]);
  const [repliesOpen,  setRepliesOpen]  = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replyFormOpen, setReplyFormOpen] = useState(false);

  const loadReplies = useCallback(async () => {
    if (repliesLoaded) return;
    try {
      const res = await fetch(`/api/duaa/${duaa.id}/reply`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.ok) setReplies(data.items || []);
      setRepliesLoaded(true);
    } catch { /* ignore */ }
  }, [duaa.id, repliesLoaded]);

  const toggleReplies = async () => {
    setRepliesOpen(o => !o);
    if (!repliesLoaded) await loadReplies();
  };

  const handleReact = async () => {
    if (busy || reactedNow) return;
    setBusy(true);
    setReactedNow(true);
    setCount(c => c + 1);
    if (identity) setPilgrimCount(c => c + 1);
    setShowThanks(true);
    try {
      const res = await fetch(`/api/duaa/${duaa.id}/react`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: identity?.nationalId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.alreadyReacted) {
        /* keep optimistic state */
      } else if (data?.ok && typeof data.count === 'number') {
        setCount(data.count);
        setPilgrimCount(data.pilgrimCount ?? pilgrimCount);
        onReacted({
          count:         data.count,
          pilgrimCount:  data.pilgrimCount ?? 0,
          reactorBadge:  data.reactorBadge ?? 'visitor',
        });
      }
    } catch {
      setReactedNow(false);
      setCount(c => Math.max(0, c - 1));
      if (identity) setPilgrimCount(c => Math.max(0, c - 1));
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
    `\nشاركوني الدعاء:\n${url}\n\nاذكروني بدعوة — بلاد الحرمين 🕋`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'اذكروني بدعوة', text: shareText, url }); return; }
      catch { /* user cancelled */ }
    }
    setShareOpen(o => !o);
  };

  return (
    <article id={`duaa-${duaa.id}`}
             className="bg-white rounded-2xl border border-gold/15 shadow-card
                        p-4 sm:p-6 relative overflow-hidden transition-shadow hover:shadow-card-lg">

      <div className="absolute top-0 inset-x-0 h-1 bg-gold-gradient" />
      <div className="absolute top-2 right-2 sm:top-3 sm:right-4 text-gold/20 text-2xl sm:text-3xl leading-none select-none" aria-hidden>❝</div>
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 text-gold/20 text-2xl sm:text-3xl leading-none select-none" aria-hidden>❞</div>

      {/* Message */}
      <p className="text-teal-dark text-[15px] sm:text-lg leading-loose
                    font-medium mb-4 sm:mb-5 px-3 sm:px-8 whitespace-pre-wrap text-center">
        {duaa.message}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1
                      text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gold/10">
        {duaa.hajjYear && (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800
                           px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300">
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

      {/* Reaction stats line */}
      {count > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 bg-gold/10 text-gold-dark px-2.5 py-1 rounded-full">
            🤲 {count}
            <span className="text-gray-500 font-medium">دعا له</span>
          </span>
          {pilgrimCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800
                             px-2.5 py-1 rounded-full border border-amber-300">
              <i className="fas fa-star text-amber-600" />
              {pilgrimCount}
              <span className="text-amber-700 font-medium">من حجاجنا</span>
            </span>
          )}
        </div>
      )}

      {/* Actions row 1: react + share */}
      <div className="flex items-center justify-between gap-3 relative">
        <button onClick={handleReact} disabled={busy || reactedNow}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           font-bold text-sm transition-all duration-200
                           ${reactedNow
                             ? identity
                               ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-amber-500/40 shadow-md cursor-default'
                               : 'bg-gold text-white shadow-gold cursor-default'
                             : 'bg-white border-2 border-gold/40 text-gold-dark hover:bg-gold/5 hover:border-gold hover:-translate-y-0.5'}`}>
          <span className="text-lg">🤲</span>
          <span>
            {reactedNow
              ? (identity ? `دعوتُ له (حاج ${identity.hajjYear})` : 'دعوتُ له')
              : 'ادعُ له'}
          </span>
        </button>

        <button onClick={handleShare} aria-label="مشاركة"
                className="w-11 h-11 rounded-xl bg-white border-2 border-teal/20 text-teal-dark
                           hover:bg-teal hover:text-white hover:border-teal transition-all
                           flex items-center justify-center">
          <i className="fas fa-share-nodes" />
        </button>

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

      {/* Actions row 2: write a custom prayer + view replies */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button onClick={() => setReplyFormOpen(o => !o)}
                className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                           text-xs font-bold transition-all
                           ${replyFormOpen
                             ? 'bg-teal text-white'
                             : 'bg-teal/5 text-teal-dark hover:bg-teal/15 border border-teal/20'}`}>
          <i className="fas fa-pen-to-square" />
          <span className="truncate">
            {identity ? 'اكتب دعاءك (حاج ⭐)' : 'اكتب دعاءك له'}
          </span>
        </button>
        {replyCount > 0 && (
          <button onClick={toggleReplies}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                             bg-cream text-teal-dark text-xs font-bold hover:bg-cream-dark transition border border-gold/15">
            <i className={`fas fa-chevron-${repliesOpen ? 'up' : 'down'} text-[10px]`} />
            <span>{repliesOpen ? 'إخفاء' : `${replyCount} ${replyCount > 10 ? 'دعاء' : replyCount > 2 ? 'دعوات' : 'دعاء'}`}</span>
          </button>
        )}
      </div>

      {/* Reply form (inline) */}
      {replyFormOpen && (
        <ReplyForm duaaId={duaa.id} identity={identity}
                   onSent={(r) => {
                     setReplies(prev => [r, ...prev]);
                     setReplyCount(c => c + 1);
                     setRepliesLoaded(true);
                     setRepliesOpen(true);
                     setReplyFormOpen(false);
                   }} />
      )}

      {/* Replies list */}
      {repliesOpen && replies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gold/10 space-y-2.5">
          <p className="text-[11px] font-bold text-gold-dark px-1 flex items-center gap-1.5">
            <i className="fas fa-comments" />
            دعوات الإخوة لـ {displayName}
          </p>
          {replies.map(r => <ReplyBubble key={r.id} reply={r} />)}
        </div>
      )}

      {showThanks && (
        <div className="absolute inset-0 flex items-center justify-center
                        bg-gradient-to-br from-gold/95 to-gold-dark/95 rounded-2xl
                        text-white text-center px-6 animate-[fadeIn_0.3s_ease]">
          <div>
            <div className="text-3xl mb-2">🤍</div>
            <p className="font-black text-lg mb-0.5">تقبّل الله منا ومنكم</p>
            <p className="text-sm text-white/90">
              {identity ? 'بُورك في دعاء الحاج لأخيه' : 'جزاكم الله خيراً'}
            </p>
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

/* ─────────────────────── Reply Form (inline) ─────────────────────── */
const MAX_REPLY = 200;

function ReplyForm({
  duaaId, identity, onSent,
}: {
  duaaId: string;
  identity: Identity | null;
  onSent: (reply: DuaaReply) => void;
}) {
  const [name,    setName]    = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) { setError('الدعاء مطلوب.'); return; }
    setBusy(true);
    try {
      const hp = (document.getElementById(`reply-hp-${duaaId}`) as HTMLInputElement | null)?.value ?? '';
      const res = await fetch(`/api/duaa/${duaaId}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, country, message,
          nationalId: identity?.nationalId,
          hp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'تعذّر الإرسال.');
        setBusy(false);
        return;
      }
      onSent(data.reply);
      setMessage(''); setName(''); setCountry('');
    } catch {
      setError('تعذّر الاتصال.');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate
          className="mt-3 bg-gradient-to-br from-teal/5 to-cream rounded-xl border border-teal/20 p-3 space-y-2">
      {identity && (
        <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200
                        rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <i className="fas fa-star text-amber-600" />
          <span>سيظهر دعاؤك بشارة <strong>"حاج {identity.hajjYear}"</strong></span>
        </div>
      )}

      <input type="text" name="hp" id={`reply-hp-${duaaId}`} tabIndex={-1} autoComplete="off"
             aria-hidden="true"
             style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input type="text" placeholder="اسمك (اختياري)" maxLength={60}
               className="form-input text-sm py-2"
               value={name} onChange={e => setName(e.target.value)} />
        <input type="text" placeholder="البلد (اختياري)" maxLength={40}
               className="form-input text-sm py-2"
               value={country} onChange={e => setCountry(e.target.value)} />
      </div>

      <div>
        <textarea className="form-input min-h-[70px] resize-y text-sm" rows={2}
                  maxLength={MAX_REPLY}
                  placeholder="اللهم استجب له..."
                  value={message} onChange={e => setMessage(e.target.value)} />
        <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-between">
          <span>تجنّب الروابط والأرقام الطويلة</span>
          <span>{message.length}/{MAX_REPLY}</span>
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-xs flex items-center gap-1">
          <i className="fas fa-circle-exclamation" />{error}
        </p>
      )}

      <button type="submit" disabled={busy || !message.trim()}
              className="w-full bg-teal hover:bg-teal-light disabled:bg-teal/40
                         text-white text-sm font-bold py-2.5 rounded-lg transition
                         flex items-center justify-center gap-2">
        {busy ? <><i className="fas fa-spinner fa-spin" />جاري الإرسال...</>
              : <><i className="fas fa-paper-plane" />أرسل دعاءك</>}
      </button>
    </form>
  );
}

/* ─────────────────────── Reply Bubble ─────────────────────── */
function ReplyBubble({ reply }: { reply: DuaaReply }) {
  const isPilgrim   = !!reply.hajjYear;
  const displayName = reply.name?.trim() || 'زائر كريم';

  return (
    <div className={`rounded-xl px-3 py-2.5 border
      ${isPilgrim
        ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
        : 'bg-cream/40 border-gold/10'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 mb-1">
        {isPilgrim && (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800
                           px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-300">
            <i className="fas fa-star text-[8px]" />
            حاج {reply.hajjYear}
          </span>
        )}
        <span className="font-bold text-teal-dark">{displayName}</span>
        {reply.country && (
          <>
            <span className="text-gray-300">·</span>
            <span>{reply.country}</span>
          </>
        )}
        <span className="text-gray-300">·</span>
        <span>{fmtRelativeAr(reply.createdAt)}</span>
      </div>
      <p className="text-sm text-teal-dark leading-relaxed whitespace-pre-wrap">
        {reply.message}
      </p>
    </div>
  );
}

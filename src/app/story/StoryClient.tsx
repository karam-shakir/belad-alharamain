'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { STORY_CHAPTERS, type ChapterKey } from '@/lib/storyTemplate';
import { contact } from '@/content/site';

interface Pilgrim { nationalId: string; name: string; hajjYear: string; country?: string; }
interface StoryMeta { slug: string; pdfUrl?: string; pdfGeneratedAt?: number; updatedAt?: number; }
interface PrintPartner { enabled: boolean; nameAr: string; whatsapp: string; phone: string; addressAr: string; noteAr: string; priceFromSAR: number; }
interface IdentifySettings { maxPhotos: number; maxFileMB: number; startAt: number; endAt: number; printPartner: PrintPartner | null; }

type Stage =
  | { kind: 'form' }
  | { kind: 'loading' }
  | { kind: 'build'; pilgrim: Pilgrim; story: StoryMeta; uploadOpen: boolean; settings: IdentifySettings }
  | { kind: 'error'; msg: string };

const ICONS: Record<ChapterKey, string> = {
  ihram:    'fa-person-walking-luggage',
  tarwiyah: 'fa-campground',
  arafah:   'fa-mountain-sun',
  jamarat:  'fa-hand-fist',
  eid:      'fa-kaaba',
};

const STORAGE_KEY = 'storyLastNid';

/* Client-side resize → JPEG with quality auto-adjust to fit under a target size.
 *
 * Two attempts:
 *  1) createImageBitmap (fast, modern path with EXIF rotation handling)
 *  2) HTMLImageElement + URL.createObjectURL (fallback for iOS HEIC, older browsers)
 *
 * If BOTH fail (e.g. HEIC on a browser that can't decode it), the caller
 * receives the original file untouched and lets the server decide. */
async function compressImage(file: File, targetBytes = 1.5 * 1024 * 1024): Promise<Blob> {
  const MAX_DIM = 1600;

  // Try modern path
  let width = 0, height = 0;
  let drawSource: CanvasImageSource | null = null;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' as ImageBitmapOptions['imageOrientation'] });
    width = bitmap.width;
    height = bitmap.height;
    drawSource = bitmap;
  } catch {
    // Fallback: HTMLImageElement
    try {
      drawSource = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = document.createElement('img');
        img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-decode-failed')); };
        img.src = url;
      });
      width = (drawSource as HTMLImageElement).naturalWidth;
      height = (drawSource as HTMLImageElement).naturalHeight;
    } catch {
      // Cannot decode this format in browser (e.g. HEIC on some Androids).
      // Return the original file — server will accept and store it.
      return file;
    }
  }

  if (!width || !height) return file;

  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  try {
    ctx.drawImage(drawSource, 0, 0, w, h);
  } catch {
    return file;
  }

  // Step quality down until under targetBytes (max 4 attempts)
  for (const q of [0.85, 0.75, 0.65, 0.55]) {
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', q));
    if (blob && blob.size <= targetBytes) return blob;
    if (blob && q === 0.55) return blob;       // last attempt: send anyway
  }
  return file;
}

/* Map common error patterns to user-friendly Arabic */
function friendlyError(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('pattern') || s.includes('decode')) return 'تعذّر فتح الصورة. جرّب صورة بصيغة JPG أو PNG.';
  if (s.includes('413') || s.includes('large') || s.includes('size'))  return 'الصورة كبيرة جداً. اختر صورة أصغر.';
  if (s.includes('network') || s.includes('failed to fetch')) return 'انقطع الاتصال. تأكّد من الإنترنت وحاول مرة أخرى.';
  if (s.includes('not-image') || s.includes('mime')) return 'الملف ليس صورة. اختر صورة بصيغة JPG / PNG / WEBP.';
  // During testing: surface the raw message so we can diagnose
  return raw || 'تعذّر رفع الصورة. حاول مرة أخرى.';
}

export default function StoryClient() {
  const [nationalId, setNationalId] = useState('');
  const [state, setState] = useState<Stage>({ kind: 'form' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && /^\d{10}$/.test(saved)) setNationalId(saved);
    } catch {}
  }, []);

  const identify = async (e: FormEvent) => {
    e.preventDefault();
    const id = nationalId.replace(/\D/g, '');
    if (!/^\d{10}$/.test(id)) {
      setState({ kind: 'error', msg: 'يجب إدخال رقم هوية صحيح (10 أرقام).' });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/story/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setState({ kind: 'error', msg: data?.error ?? 'حدث خطأ. حاول مرة أخرى.' });
        return;
      }
      try { localStorage.setItem(STORAGE_KEY, id); } catch {}
      setState({ kind: 'build', pilgrim: data.pilgrim, story: data.story, uploadOpen: data.uploadOpen, settings: data.settings });
    } catch {
      setState({ kind: 'error', msg: 'تعذّر الاتصال. تحقّق من الإنترنت.' });
    }
  };

  const reset = () => setState({ kind: 'form' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-cream-dark to-cream
                    flex flex-col items-center py-6 sm:py-10 px-3 sm:px-4">

      {state.kind !== 'build' && (
        <div className="w-full max-w-xl">
          {/* Brand */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <a href="/" className="bg-white/90 rounded-2xl px-4 sm:px-5 py-2 sm:py-3 shadow-card hover:shadow-lg transition-shadow inline-block">
              <Image src="/images/logo.png" alt="بلاد الحرمين" width={220} height={80} priority
                     className="h-12 sm:h-14 w-auto object-contain" />
            </a>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gold/20 p-5 sm:p-8">
            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark items-center justify-center mb-3 sm:mb-4 shadow-gold">
                <i className="fas fa-book-open text-white text-xl sm:text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-teal-dark mb-1.5 sm:mb-2">قصّتي</h1>
              <p className="text-xs sm:text-sm text-gold-dark font-bold mb-1">My Hajj Story</p>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                هديّتنا لحجّاج موسم <strong>1447هـ</strong> — اصنع قصّة رحلتك بهوية بلاد الحرمين الفاخرة.
              </p>
            </div>

            {(state.kind === 'form' || state.kind === 'loading' || state.kind === 'error') && (
              <form onSubmit={identify} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="nid" className="block text-sm font-bold text-teal-dark mb-1.5">
                    رقم الهوية الوطنية أو الإقامة
                  </label>
                  <input id="nid" type="text" inputMode="numeric" pattern="[0-9]{10}"
                         maxLength={10} autoComplete="off" autoFocus dir="ltr"
                         className="form-input text-center text-lg tracking-widest font-mono"
                         placeholder="1XXXXXXXXX"
                         value={nationalId}
                         onChange={e => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                    <i className="fas fa-shield-halved text-gold" />
                    صورك تُستخدم فقط لإنشاء قصّتك، وتُحذَف تلقائياً بعد ٦٠ يوماً.
                  </p>
                </div>

                {state.kind === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex items-start gap-2">
                    <i className="fas fa-circle-exclamation mt-0.5 flex-shrink-0" />
                    <span>{state.msg}</span>
                  </div>
                )}

                <button type="submit" disabled={state.kind === 'loading' || nationalId.length !== 10}
                        className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light
                                   disabled:bg-gold/40 disabled:cursor-not-allowed text-white font-bold py-3.5
                                   rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-gold hover:shadow-gold-lg">
                  {state.kind === 'loading'
                    ? <><i className="fas fa-spinner fa-spin" /><span>جاري التحقّق...</span></>
                    : <><i className="fas fa-arrow-right" /><span>ابدأ قصّتي</span></>}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            <i className="fas fa-circle-info me-1 text-gold" />
            للاستفسار: <a href={`tel:${contact.phone}`} dir="ltr" className="text-teal font-bold">{contact.phone}</a>
          </p>
        </div>
      )}

      {state.kind === 'build' && (
        <StoryBuilder pilgrim={state.pilgrim} story={state.story} uploadOpen={state.uploadOpen}
                      startAt={state.settings?.startAt ?? 0} endAt={state.settings?.endAt ?? 0}
                      printPartner={state.settings?.printPartner ?? null} onReset={reset} />
      )}
    </div>
  );
}

/* ── Story builder: per-chapter upload + generate button ── */
function StoryBuilder({ pilgrim, story, uploadOpen, startAt, endAt, printPartner, onReset }: {
  pilgrim: Pilgrim; story: StoryMeta; uploadOpen: boolean;
  startAt: number; endAt: number;
  printPartner: PrintPartner | null;
  onReset: () => void;
}) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<ChapterKey | null>(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(story.pdfUrl);
  const [shareUrl, setShareUrl] = useState<string>(typeof window !== 'undefined' ? `${window.location.origin}/story/s/${story.slug}` : '');

  /* Window status: 'before' | 'during' | 'after' — used for clearer messaging */
  const now = Date.now();
  const status: 'before' | 'during' | 'after' = uploadOpen
    ? 'during'
    : (startAt && now < startAt) ? 'before' : 'after';
  const fmt = (ms: number) => new Date(ms).toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/story/photos?nid=${pilgrim.nationalId}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.ok) setPhotos(data.photos || {});
      } catch {}
    })();
  }, [pilgrim.nationalId]);

  const uploadedCount = Object.keys(photos).length;

  const handleFile = async (chapter: ChapterKey, file: File) => {
    setError('');
    setBusy(chapter);
    try {
      // Quick MIME pre-check (covers most cases)
      if (file.size === 0) throw new Error('الملف فارغ.');
      // 8MB pre-check (large enough to allow HEIC originals — server will reject if needed)
      if (file.size > 8 * 1024 * 1024) {
        throw new Error('الصورة أكبر من 8 ميغابايت. اختر صورة أصغر أو قلّل دقّتها من إعدادات الكاميرا.');
      }

      let toUpload: Blob = file;
      try {
        toUpload = await compressImage(file);
      } catch {
        toUpload = file;     // safest fallback: send original
      }

      // Pick an extension/MIME the server accepts
      const isJpeg = toUpload.type === 'image/jpeg';
      const isPng  = toUpload.type === 'image/png';
      const isWebp = toUpload.type === 'image/webp';
      const ext  = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
      // Force re-wrap as File with a clean name + jpeg type fallback (server handles)
      const safeFile = new File(
        [toUpload],
        `${chapter}.${ext}`,
        { type: isJpeg || isPng || isWebp ? toUpload.type : 'image/jpeg' },
      );

      const fd = new FormData();
      fd.append('nid', pilgrim.nationalId);
      fd.append('chapter', chapter);
      fd.append('photo', safeFile);

      const res = await fetch('/api/story/photos', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        // Surface server-side debug message during testing
        const detail = data?.debug ? ` (${data.debug})` : '';
        throw new Error((data?.error || `خطأ ${res.status}`) + detail);
      }
      setPhotos(prev => ({ ...prev, [chapter]: data.url }));
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  };

  const removePhoto = async (chapter: ChapterKey) => {
    setError(''); setBusy(chapter);
    try {
      const res = await fetch(`/api/story/photos?nid=${pilgrim.nationalId}&chapter=${chapter}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'فشل الحذف');
      setPhotos(prev => { const next = { ...prev }; delete next[chapter]; return next; });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الحذف');
    } finally { setBusy(null); }
  };

  const generate = async () => {
    if (uploadedCount === 0) return;
    setError(''); setGenerating(true);
    try {
      const res = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: pilgrim.nationalId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'فشل إنشاء القصّة');
      setPdfUrl(data.pdfUrl);
      setShareUrl(data.shareUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل إنشاء القصّة');
    } finally { setGenerating(false); }
  };

  const share = async () => {
    const text = `الحمد لله — هذه قصّة حجّي لعام ${pilgrim.hajjYear}هـ مع بلاد الحرمين 🤍🕋`;
    if (navigator.share) {
      try { await navigator.share({ title: 'قصّتي', text, url: shareUrl }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(`${text}\n${shareUrl}`); alert('تم نسخ الرابط للحافظة'); } catch {}
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-card p-4 sm:p-5 mb-5 flex flex-wrap items-center gap-3">
        <div className="bg-gradient-to-br from-gold to-gold-dark w-12 h-12 rounded-full flex items-center justify-center text-white">
          <i className="fas fa-book-open text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">أهلاً بك</p>
          <p className="font-black text-teal-dark text-base sm:text-lg truncate">{pilgrim.name}</p>
          <p className="text-[11px] text-gold-dark">موسم {pilgrim.hajjYear}هـ</p>
        </div>
        <button onClick={onReset} className="text-xs text-gray-500 hover:text-teal-dark inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
          <i className="fas fa-right-from-bracket" />تبديل
        </button>
      </div>

      {status === 'before' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 mb-5 text-sm">
          <i className="fas fa-clock me-1.5" />
          المبادرة تبدأ يوم <strong>{fmt(startAt)}</strong>. ارجعوا في هذا اليوم لرفع صوركم وإنشاء قصّتكم.
        </div>
      )}
      {status === 'after' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-5 text-sm">
          <i className="fas fa-clock me-1.5" />
          انتهت فترة رفع الصور والتعديل (انتهت يوم {fmt(endAt)}). يمكنكم تنزيل قصّتكم أو مشاركة الرابط أدناه إن سبق وأنشأتموها.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm flex items-start gap-2">
          <i className="fas fa-circle-exclamation mt-0.5" /><span>{error}</span>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black text-teal-dark text-sm sm:text-base">
          <i className="fas fa-images text-gold me-1.5" />فصول قصّتك
        </h2>
        <span className="text-xs text-gray-500">
          {uploadedCount} من {STORY_CHAPTERS.length} فصلاً
        </span>
      </div>

      {/* Chapter cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {STORY_CHAPTERS.map(ch => (
          <ChapterCard
            key={ch.key}
            chapter={ch.key}
            icon={ICONS[ch.key]}
            titleAr={ch.titleAr}
            titleEn={ch.titleEn}
            number={ch.numberAr}
            photoUrl={photos[ch.key]}
            busy={busy === ch.key}
            disabled={!uploadOpen || (busy !== null && busy !== ch.key)}
            onUpload={f => handleFile(ch.key, f)}
            onRemove={() => removePhoto(ch.key)}
          />
        ))}
      </div>

      {/* Action area */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-card p-4 sm:p-5">
        {pdfUrl ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="inline-flex w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <i className="fas fa-circle-check text-green-600 text-xl" />
              </div>
              <p className="font-black text-teal-dark">قصّتك جاهزة 🤍</p>
              <p className="text-xs text-gray-500 mt-0.5">يمكنك تنزيلها كـ PDF أو مشاركتها</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download
                 className="inline-flex items-center justify-center gap-1.5 bg-gold hover:bg-gold-light text-white font-bold px-3 py-2.5 rounded-xl transition text-xs sm:text-sm">
                <i className="fas fa-file-pdf" />تنزيل
              </a>
              <button onClick={share}
                      className="inline-flex items-center justify-center gap-1.5 bg-teal hover:bg-teal-light text-white font-bold px-3 py-2.5 rounded-xl transition text-xs sm:text-sm">
                <i className="fas fa-share-nodes" />مشاركة
              </button>
              {uploadOpen && (
                <button onClick={generate} disabled={generating || uploadedCount === 0}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border-2 border-gold/30 hover:border-gold text-teal-dark font-bold px-3 py-2.5 rounded-xl transition text-xs sm:text-sm disabled:opacity-50">
                  <i className="fas fa-arrows-rotate" />تحديث
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 text-center pt-2 border-t border-gold/10">
              <i className="fas fa-link me-1" />
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline" dir="ltr">{shareUrl}</a>
            </p>
          </div>
        ) : (
          <button onClick={generate} disabled={generating || uploadedCount === 0 || !uploadOpen}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-gold to-gold-dark hover:from-gold-light hover:to-gold disabled:from-gold/30 disabled:to-gold/30 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition shadow-gold">
            {generating
              ? <><i className="fas fa-spinner fa-spin" /><span>جاري إنشاء قصّتك...</span></>
              : <><i className="fas fa-wand-magic-sparkles" /><span>اصنع قصّتي</span></>}
          </button>
        )}
      </div>

      {/* Print partner card — shown only after PDF is generated and partner is configured */}
      {pdfUrl && printPartner && printPartner.enabled && (
        <div className="mt-5 bg-gradient-to-br from-cream to-cream-dark border-2 border-gold/30 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white">
              <i className="fas fa-print" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gold-dark font-bold tracking-wider">طبعة فاخرة</p>
              <p className="font-black text-teal-dark">{printPartner.nameAr}</p>
            </div>
            {printPartner.priceFromSAR > 0 && (
              <span className="text-xs bg-gold/15 text-gold-dark font-bold px-2 py-1 rounded-full">
                من {printPartner.priceFromSAR} ر.س
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{printPartner.noteAr}</p>
          {printPartner.addressAr && (
            <p className="text-xs text-gray-500 mb-3"><i className="fas fa-location-dot text-gold me-1" />{printPartner.addressAr}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {printPartner.whatsapp && (
              <a target="_blank" rel="noopener noreferrer"
                 href={`https://wa.me/${printPartner.whatsapp}?text=${encodeURIComponent(
                   `السلام عليكم،\nأرغب في طباعة قصّة حجّي (موسم ${pilgrim.hajjYear}هـ) من شركة بلاد الحرمين.\nرابط القصّة: ${shareUrl}`
                 )}`}
                 className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
                <i className="fab fa-whatsapp" />تواصل واتساب
              </a>
            )}
            {printPartner.phone && (
              <a href={`tel:${printPartner.phone}`}
                 className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gold/30 hover:border-gold text-teal-dark text-sm font-bold px-4 py-2.5 rounded-xl transition">
                <i className="fas fa-phone" />{printPartner.phone}
              </a>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
        المبادرة لموسم {pilgrim.hajjYear}هـ. القصص المُنشأة تبقى متاحة دائماً.
      </p>
    </div>
  );
}

/* ── Single chapter card ── */
function ChapterCard({ chapter, icon, titleAr, titleEn, number, photoUrl, busy, disabled, onUpload, onRemove }: {
  chapter: ChapterKey; icon: string; titleAr: string; titleEn: string; number: string;
  photoUrl?: string; busy: boolean; disabled: boolean;
  onUpload: (file: File) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const has = !!photoUrl;

  return (
    <div className={`bg-white rounded-2xl border-2 p-3 sm:p-4 transition
      ${has ? 'border-green-300' : 'border-gold/15 hover:border-gold/40'}`}>
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${has ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold'}`}>
          <i className={`fas ${has ? 'fa-circle-check' : icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gold-dark font-bold tracking-wider">الفصل {number}</p>
          <p className="font-black text-teal-dark text-sm leading-tight">{titleAr}</p>
          <p className="text-[10px] text-gray-500 italic leading-tight">{titleEn}</p>
        </div>
      </div>

      {has && photoUrl ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="" className="w-full h-32 sm:h-36 object-cover rounded-lg border border-gold/20" />
          <div className="flex gap-2">
            <button onClick={() => inputRef.current?.click()} disabled={disabled}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold-dark font-bold transition disabled:opacity-50">
              <i className="fas fa-arrows-rotate" />تغيير
            </button>
            <button onClick={onRemove} disabled={disabled}
                    className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold transition disabled:opacity-50">
              <i className="fas fa-trash" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={disabled}
                className="w-full border-2 border-dashed border-gold/30 hover:border-gold rounded-xl p-4 text-center transition text-xs sm:text-sm text-gray-500 hover:text-gold-dark disabled:opacity-50">
          {busy
            ? <><i className="fas fa-spinner fa-spin me-1.5" />جاري الرفع...</>
            : <><i className="fas fa-camera me-1.5" />ارفع صورة</>}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*"
             className="hidden"
             onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
    </div>
  );
}

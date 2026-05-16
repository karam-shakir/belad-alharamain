'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { StorySettings } from '@/lib/storySettings';

/* convert "2026-06-06T03:00" (local datetime-local input) → unix ms */
function toMs(local: string): number {
  if (!local) return 0;
  return new Date(local).getTime();
}
/* convert unix ms → datetime-local string for input */
function toLocalInput(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminStorySettingsPage() {
  const router = useRouter();
  const [s,        setS]        = useState<StorySettings | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [savedAt,  setSavedAt]  = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/story/settings', { cache: 'no-store' });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setS(data.settings);
    } catch (e) { setError(e instanceof Error ? e.message : 'خطأ'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!s) return;
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/story/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'فشل الحفظ');
      setS(data.settings);
      setSavedAt(Date.now());
    } catch (e) { setError(e instanceof Error ? e.message : 'فشل الحفظ'); }
    finally { setSaving(false); }
  };

  const upd = <K extends keyof StorySettings>(key: K, value: StorySettings[K]) => {
    setS(prev => prev ? { ...prev, [key]: value } : prev);
  };
  const updPP = <K extends keyof StorySettings['printPartner']>(key: K, value: StorySettings['printPartner'][K]) => {
    setS(prev => prev ? { ...prev, printPartner: { ...prev.printPartner, [key]: value } } : prev);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-teal-dark text-white shadow-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="bg-white/95 rounded-lg px-2 py-1">
            <Image src="/images/logo.png" alt="" width={120} height={40} className="h-8 w-auto object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-black truncate">إعدادات مبادرة "قصّتي"</h1>
            <p className="text-[11px] text-gold-light/80">تحكّم كامل في تشغيل المبادرة وحدودها</p>
          </div>
          <Link href="/admin/story" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 transition">
            <i className="fas fa-arrow-right" /><span className="hidden sm:inline">القصص</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            <i className="fas fa-circle-exclamation me-1" />{error}
          </div>
        )}
        {savedAt && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
            <i className="fas fa-circle-check me-1" />حُفظت الإعدادات بنجاح.
          </div>
        )}

        {loading || !s ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3" /><p className="text-sm">جاري التحميل...</p>
          </div>
        ) : (
          <>
            {/* ── Master toggle ── */}
            <section className="bg-white rounded-2xl border border-gold/15 shadow-card p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="font-black text-teal-dark mb-1">
                    <i className="fas fa-power-off text-gold me-2" />تشغيل المبادرة
                  </h2>
                  <p className="text-xs text-gray-500">عند الإيقاف، الصفحة العامة تُخفى وتُمنع الإضافات.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer"
                         checked={s.enabled} onChange={e => upd('enabled', e.target.checked)} />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer
                                  peer-checked:after:translate-x-6 rtl:peer-checked:after:-translate-x-6
                                  after:content-[''] after:absolute after:top-1 after:start-1
                                  after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                                  peer-checked:bg-green-500" />
                </label>
              </div>
              <p className={`text-sm font-bold ${s.enabled ? 'text-green-700' : 'text-gray-400'}`}>
                الحالة: {s.enabled ? '🟢 مفعّلة' : '⚫ متوقّفة'}
              </p>
            </section>

            {/* ── Window ── */}
            <section className="bg-white rounded-2xl border border-gold/15 shadow-card p-5">
              <h2 className="font-black text-teal-dark mb-3">
                <i className="fas fa-calendar-days text-gold me-2" />فترة فتح الرفع والتعديل
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">يبدأ من</label>
                  <input type="datetime-local" className="form-input"
                         value={toLocalInput(s.startAt)}
                         onChange={e => upd('startAt', toMs(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ينتهي في</label>
                  <input type="datetime-local" className="form-input"
                         value={toLocalInput(s.endAt)}
                         onChange={e => upd('endAt', toMs(e.target.value))} />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                <i className="fas fa-info-circle me-1" />
                بعد انتهاء الفترة، روابط القصص المُنشأة تستمر تعمل للأبد، لكن الرفع/التعديل يُغلَق.
              </p>
            </section>

            {/* ── Limits ── */}
            <section className="bg-white rounded-2xl border border-gold/15 shadow-card p-5">
              <h2 className="font-black text-teal-dark mb-3">
                <i className="fas fa-sliders text-gold me-2" />حدود الاستخدام (مكافحة الإساءة)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">حد أقصى للصور لكل قصة (1-12)</label>
                  <input type="number" min={1} max={12} className="form-input"
                         value={s.maxPhotosPerStory}
                         onChange={e => upd('maxPhotosPerStory', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">حد حجم الصورة (MB، 1-10)</label>
                  <input type="number" min={1} max={10} className="form-input"
                         value={s.maxFileSizeMB}
                         onChange={e => upd('maxFileSizeMB', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">فترة الانتظار بين إنشاءين (دقائق، 0-120)</label>
                  <input type="number" min={0} max={120} className="form-input"
                         value={s.generateCooldownMin}
                         onChange={e => upd('generateCooldownMin', Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">حد إنشاءات يومي لكل حاج (1-50)</label>
                  <input type="number" min={1} max={50} className="form-input"
                         value={s.maxGenerationsPerDay}
                         onChange={e => upd('maxGenerationsPerDay', Number(e.target.value))} />
                </div>
              </div>
            </section>

            {/* ── Print Partner ── */}
            <section className="bg-white rounded-2xl border border-gold/15 shadow-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-black text-teal-dark mb-1">
                    <i className="fas fa-print text-gold me-2" />شريك الطباعة (اختياري)
                  </h2>
                  <p className="text-xs text-gray-500">عند التفعيل، يظهر للحاج زر "اطلب نسخة مطبوعة" يفتح واتساب المطبعة.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" className="sr-only peer"
                         checked={s.printPartner.enabled} onChange={e => updPP('enabled', e.target.checked)} />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer
                                  peer-checked:after:translate-x-6 rtl:peer-checked:after:-translate-x-6
                                  after:content-[''] after:absolute after:top-1 after:start-1
                                  after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                                  peer-checked:bg-green-500" />
                </label>
              </div>

              <div className={`grid sm:grid-cols-2 gap-3 transition-opacity ${s.printPartner.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">اسم المطبعة (عربي)</label>
                  <input type="text" className="form-input" value={s.printPartner.nameAr}
                         onChange={e => updPP('nameAr', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name (English)</label>
                  <input type="text" className="form-input" value={s.printPartner.nameEn}
                         onChange={e => updPP('nameEn', e.target.value)} dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">واتساب (أرقام فقط، بدون +)</label>
                  <input type="text" className="form-input" value={s.printPartner.whatsapp}
                         onChange={e => updPP('whatsapp', e.target.value.replace(/\D/g, ''))}
                         placeholder="966555123456" dir="ltr" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">هاتف</label>
                  <input type="text" className="form-input" value={s.printPartner.phone}
                         onChange={e => updPP('phone', e.target.value)} dir="ltr" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">العنوان</label>
                  <input type="text" className="form-input" value={s.printPartner.addressAr}
                         onChange={e => updPP('addressAr', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">رسالة للحاج (تظهر عند طلب الطباعة)</label>
                  <textarea rows={2} className="form-input resize-none" value={s.printPartner.noteAr}
                            onChange={e => updPP('noteAr', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">السعر يبدأ من (ر.س)</label>
                  <input type="number" min={0} className="form-input" value={s.printPartner.priceFromSAR}
                         onChange={e => updPP('priceFromSAR', Number(e.target.value))} />
                </div>
              </div>
            </section>

            {/* ── Save ── */}
            <div className="sticky bottom-4 z-10">
              <button onClick={save} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50
                                 text-white font-bold py-3.5 rounded-xl shadow-gold transition">
                {saving
                  ? <><i className="fas fa-spinner fa-spin" /><span>جاري الحفظ...</span></>
                  : <><i className="fas fa-floppy-disk" /><span>حفظ التغييرات</span></>}
              </button>
            </div>

            <p className="text-center text-[11px] text-gray-400">
              آخر حفظ: {s.updatedAt ? new Date(s.updatedAt).toLocaleString('ar-SA') : 'لم يُحفظ بعد'}
            </p>
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Submission, SubmissionStatus } from '@/lib/submissions';

type StatusFilter = SubmissionStatus | 'all';
type TypeFilter   = 'all' | 'agency' | 'contact';

interface Stats {
  total: number;
  new: number;
  contacted: number;
  approved: number;
  rejected: number;
}

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  new:       'جديد',
  contacted: 'تواصلت',
  approved:  'مقبول',
  rejected:  'مرفوض',
};

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new:       'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-amber-100 text-amber-800 border-amber-200',
  approved:  'bg-green-100 text-green-800 border-green-200',
  rejected:  'bg-red-100 text-red-800 border-red-200',
};

const STATUS_ICONS: Record<SubmissionStatus, string> = {
  new:       'fa-bell',
  contacted: 'fa-comments',
  approved:  'fa-circle-check',
  rejected:  'fa-circle-xmark',
};

function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString('ar-SA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function csvEscape(v: string | number) {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[,"\n]/.test(s) ? `"${s}"` : s;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [items,    setItems]    = useState<Submission[]>([]);
  const [stats,    setStats]    = useState<Stats>({ total: 0, new: 0, contacted: 0, approved: 0, rejected: 0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState<StatusFilter>('all');
  const [typeFilt, setTypeFilt] = useState<TypeFilter>('all');
  const [editing,  setEditing]  = useState<string | null>(null);
  const [draft,    setDraft]    = useState<string>('');

  /* ── Fetch all submissions ─── */
  const fetchData = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/submissions', { cache: 'no-store' });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setItems(data.items || []);
      setStats(data.stats || { total: 0, new: 0, contacted: 0, approved: 0, rejected: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Filtering ─── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      if (filter !== 'all' && it.status !== filter) return false;
      if (typeFilt !== 'all' && it.type !== typeFilt) return false;
      if (!q) return true;
      return [it.agencyName, it.country, it.contactPerson, it.name, it.subject, it.email, it.phone, it.message]
        .some(v => v?.toLowerCase().includes(q));
    });
  }, [items, query, filter, typeFilt]);

  /* ── Actions ─── */
  const setStatus = async (id: string, status: SubmissionStatus) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setStats(prev => {
      const it = items.find(p => p.id === id);
      if (!it) return prev;
      return {
        ...prev,
        [it.status]: Math.max(0, (prev[it.status] ?? 0) - 1),
        [status]:    (prev[status] ?? 0) + 1,
      };
    });
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { setError('فشل تحديث الحالة'); fetchData(); }
  };

  const saveNotes = async (id: string) => {
    const notes = draft;
    setItems(prev => prev.map(p => p.id === id ? { ...p, notes } : p));
    setEditing(null);
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) { setError('فشل حفظ الملاحظة'); fetchData(); }
  };

  const remove = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    const res = await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' });
    if (!res.ok) { setError('فشل الحذف'); return; }
    fetchData();
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const exportCsv = () => {
    const rows = [
      ['التاريخ', 'النوع', 'الاسم/الوكالة', 'الدولة/الموضوع', 'الجوال', 'الإيميل', 'الرسالة', 'الحالة', 'ملاحظات'],
      ...filtered.map(it => [
        fmtDate(it.createdAt),
        it.type === 'agency' ? 'وكالة' : 'تواصل',
        it.type === 'agency' ? (it.agencyName ?? '') : (it.name ?? ''),
        it.type === 'agency' ? (it.country ?? '')    : (it.subject ?? ''),
        it.phone, it.email,
        it.type === 'contact' ? (it.message ?? '') : '',
        STATUS_LABEL[it.status], it.notes || '',
      ]),
    ];
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      {/* ── Top bar ─── */}
      <header className="bg-teal-dark text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="bg-white/95 rounded-lg px-2 py-1">
            <Image src="/images/logo.png" alt="" width={120} height={40}
                   className="h-8 w-auto object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-black leading-tight truncate">لوحة التحكم</h1>
            <p className="text-[11px] text-gold-light/80">بلاد الحرمين — الطلبات والرسائل</p>
          </div>
          <button onClick={fetchData}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-xs font-bold bg-white/10 hover:bg-white/20 transition">
            <i className="fas fa-arrows-rotate" /><span>تحديث</span>
          </button>
          <button onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-xs font-bold bg-gold hover:bg-gold-light transition">
            <i className="fas fa-right-from-bracket" /><span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ── Stats ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {([
            { key: 'total',     label: 'إجمالي',    color: 'from-teal-dark to-teal',     icon: 'fa-inbox'         },
            { key: 'new',       label: 'جديد',      color: 'from-blue-600 to-blue-500',  icon: 'fa-bell'          },
            { key: 'contacted', label: 'تواصلت',    color: 'from-amber-600 to-amber-500',icon: 'fa-comments'      },
            { key: 'approved',  label: 'مقبول',     color: 'from-green-600 to-green-500',icon: 'fa-circle-check'  },
            { key: 'rejected',  label: 'مرفوض',     color: 'from-red-600 to-red-500',    icon: 'fa-circle-xmark'  },
          ] as const).map(c => (
            <div key={c.key}
                 className="bg-white rounded-2xl p-4 border border-gold/10 shadow-card">
              <div className={`inline-flex w-9 h-9 rounded-lg bg-gradient-to-br ${c.color}
                              items-center justify-center text-white mb-2`}>
                <i className={`fas ${c.icon} text-sm`} />
              </div>
              <p className="text-2xl font-black text-teal-dark leading-none">
                {stats[c.key as keyof Stats]}
              </p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ─── */}
        <div className="bg-white rounded-2xl border border-gold/10 shadow-card p-3 sm:p-4 mb-5
                        flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input
              type="search" placeholder="بحث بالاسم، الدولة، الإيميل..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="form-input ps-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={typeFilt}
                    onChange={e => setTypeFilt(e.target.value as TypeFilter)}
                    className="form-input flex-1 sm:w-36">
              <option value="all">كل الأنواع</option>
              <option value="agency">وكالات</option>
              <option value="contact">تواصل</option>
            </select>
            <select value={filter}
                    onChange={e => setFilter(e.target.value as StatusFilter)}
                    className="form-input flex-1 sm:w-40">
              <option value="all">جميع الحالات</option>
              <option value="new">جديد</option>
              <option value="contacted">تواصلت</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
            <button onClick={exportCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                               text-sm font-bold bg-teal text-white hover:bg-teal-light transition">
              <i className="fas fa-file-csv" /><span className="hidden sm:inline">تصدير CSV</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                          rounded-xl p-3 mb-4 flex items-start gap-2">
            <i className="fas fa-circle-exclamation mt-0.5" /><span>{error}</span>
          </div>
        )}

        {/* ── Submissions ─── */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3" />
            <p className="text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gold/10 shadow-card">
            <i className="fas fa-inbox text-gold/40 text-5xl mb-4" />
            <p className="text-gray-500 font-medium">
              {items.length === 0 ? 'لا توجد طلبات بعد' : 'لا توجد نتائج مطابقة'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(it => (
              <div key={it.id}
                   className="bg-white rounded-2xl border border-gold/10 shadow-card p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Type badge */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold
                                        px-2 py-0.5 rounded-full border
                                        ${it.type === 'agency'
                                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                                          : 'bg-cyan-50 text-cyan-800 border-cyan-200'}`}>
                        <i className={`fas ${it.type === 'agency' ? 'fa-handshake' : 'fa-envelope'} text-[9px]`} />
                        {it.type === 'agency' ? 'وكالة' : 'تواصل'}
                      </span>
                      <h3 className="font-black text-teal-dark text-base sm:text-lg truncate">
                        {it.type === 'agency' ? it.agencyName : it.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold
                                        px-2 py-0.5 rounded-full border
                                        ${STATUS_STYLES[it.status]}`}>
                        <i className={`fas ${STATUS_ICONS[it.status]} text-[10px]`} />
                        {STATUS_LABEL[it.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                      {it.type === 'agency' && it.country && (
                        <>
                          <span><i className="fas fa-flag text-gold me-1" />{it.country}</span>
                          <span className="text-gray-300">•</span>
                        </>
                      )}
                      {it.type === 'contact' && it.subject && (
                        <>
                          <span><i className="fas fa-tag text-gold me-1" />{it.subject}</span>
                          <span className="text-gray-300">•</span>
                        </>
                      )}
                      <span><i className="fas fa-clock text-gold me-1" />{fmtDate(it.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Contact grid */}
                <div className={`grid gap-2 mb-4 text-sm
                                 ${it.type === 'agency' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  {it.type === 'agency' && (
                    <div className="bg-cream/60 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">الشخص المسؤول</p>
                      <p className="text-teal-dark font-semibold truncate">{it.contactPerson}</p>
                    </div>
                  )}
                  <div className="bg-cream/60 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">الجوال</p>
                    <a href={`tel:${it.phone}`} dir="ltr"
                       className="text-teal-dark font-semibold hover:text-gold transition truncate block">
                      {it.phone}
                    </a>
                  </div>
                  <div className="bg-cream/60 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">الإيميل</p>
                    <a href={`mailto:${it.email}`} dir="ltr"
                       className="text-teal-dark font-semibold hover:text-gold transition truncate block">
                      {it.email}
                    </a>
                  </div>
                </div>

                {/* Contact message body */}
                {it.type === 'contact' && it.message && (
                  <div className="bg-cyan-50/50 border border-cyan-100 rounded-lg p-3 mb-3">
                    <p className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider mb-1">
                      <i className="fas fa-comment me-1" />الرسالة
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{it.message}</p>
                  </div>
                )}

                {/* Notes editor */}
                {editing === it.id ? (
                  <div className="mb-3">
                    <textarea value={draft} onChange={e => setDraft(e.target.value)}
                              placeholder="ملاحظات داخلية..."
                              className="form-input min-h-[80px] resize-y" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => saveNotes(it.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold
                                         bg-gold hover:bg-gold-light text-white transition">
                        <i className="fas fa-check me-1" />حفظ
                      </button>
                      <button onClick={() => setEditing(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold
                                         bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : it.notes ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3
                                  text-sm text-amber-900 cursor-pointer hover:bg-amber-100"
                       onClick={() => { setEditing(it.id); setDraft(it.notes); }}>
                    <p className="text-[10px] text-amber-700 font-bold mb-0.5">
                      <i className="fas fa-sticky-note me-1" />ملاحظات (انقر للتعديل)
                    </p>
                    <p className="whitespace-pre-wrap">{it.notes}</p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gold/10">
                  {it.type === 'agency' && (
                    it.pdfUrl ? (
                      <a href={it.pdfUrl} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                    bg-red-100 hover:bg-red-200 text-red-800 transition">
                        <i className="fas fa-file-pdf" />تنزيل العقد
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                                       bg-gray-100 text-gray-500">
                        <i className="fas fa-file-pdf" />العقد في الإيميل
                      </span>
                    )
                  )}
                  {it.type === 'contact' && (
                    <a href={`https://wa.me/${it.phone.replace(/\D/g,'')}`}
                       target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                  bg-green-100 hover:bg-green-200 text-green-800 transition">
                      <i className="fab fa-whatsapp" />واتساب
                    </a>
                  )}

                  <select value={it.status}
                          onChange={e => setStatus(it.id, e.target.value as SubmissionStatus)}
                          className="text-xs font-bold border border-gold/30 bg-white
                                     rounded-lg px-2 py-1.5 cursor-pointer hover:border-gold transition">
                    <option value="new">⏳ جديد</option>
                    <option value="contacted">💬 تواصلت</option>
                    <option value="approved">✅ مقبول</option>
                    <option value="rejected">❌ مرفوض</option>
                  </select>

                  {editing !== it.id && (
                    <button onClick={() => { setEditing(it.id); setDraft(it.notes); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                       bg-amber-100 hover:bg-amber-200 text-amber-800 transition">
                      <i className="fas fa-pen" />{it.notes ? 'تعديل' : 'إضافة'} ملاحظة
                    </button>
                  )}

                  <button onClick={() => remove(it.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                     bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 transition
                                     ms-auto">
                    <i className="fas fa-trash" /><span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          {items.length > 0 && `${filtered.length} من ${items.length} طلب`}
        </p>

      </main>
    </div>
  );
}

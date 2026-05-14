'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Duaa, DuaaStats } from '@/lib/duaa';

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString('ar-SA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function csvEscape(v: string | number) {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[,"\n]/.test(s) ? `"${s}"` : s;
}

type Filter = 'all' | 'visible' | 'hidden' | 'badge';

export default function AdminDuaaPage() {
  const router = useRouter();
  const [items,    setItems]    = useState<Duaa[]>([]);
  const [stats,    setStats]    = useState<DuaaStats>({ total: 0, hidden: 0, totalReacts: 0, byCountry: {}, withHajjBadge: 0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [query,    setQuery]    = useState('');
  const [filter,   setFilter]   = useState<Filter>('all');

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/duaa', { cache: 'no-store' });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setItems(data.items || []);
      setStats(data.stats || { total: 0, hidden: 0, totalReacts: 0, byCountry: {}, withHajjBadge: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(d => {
      if (filter === 'visible' && d.hidden) return false;
      if (filter === 'hidden'  && !d.hidden) return false;
      if (filter === 'badge'   && !d.hajjYear) return false;
      if (!q) return true;
      const name    = String(d.name    ?? '').toLowerCase();
      const country = String(d.country ?? '').toLowerCase();
      const msg     = String(d.message ?? '').toLowerCase();
      return name.includes(q) || country.includes(q) || msg.includes(q);
    });
  }, [items, query, filter]);

  const toggleHide = async (id: string, hide: boolean) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, hidden: hide } : p));
    const res = await fetch(`/api/admin/duaa/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: hide }),
    });
    if (!res.ok) { setError('فشل التحديث'); fetchData(); }
  };

  const remove = async (id: string) => {
    if (!confirm('حذف نهائي لهذا الدعاء؟ لا يمكن التراجع.')) return;
    const res = await fetch(`/api/admin/duaa/${id}`, { method: 'DELETE' });
    if (!res.ok) { setError('فشل الحذف'); return; }
    fetchData();
  };

  const exportCsv = () => {
    const rows = [
      ['التاريخ', 'الاسم', 'البلد', 'الدعاء', 'حاج', 'تفاعلات', 'مخفي'],
      ...filtered.map(d => [
        fmtDate(d.createdAt), d.name || '—', d.country || '—',
        d.message, d.hajjYear || '—',
        String(d.reactionCount ?? 0), d.hidden ? 'نعم' : '',
      ]),
    ];
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `duaa-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="bg-teal-dark text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="bg-white/95 rounded-lg px-2 py-1">
            <Image src="/images/logo.png" alt="" width={120} height={40}
                   className="h-8 w-auto object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-black leading-tight truncate">لوحة التحكم — حائط الدعاء</h1>
            <p className="text-[11px] text-gold-light/80">إدارة الدعوات المنشورة</p>
          </div>
          <nav className="hidden md:flex gap-1 text-xs font-bold">
            <Link href="/admin"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <i className="fas fa-inbox me-1" />الطلبات
            </Link>
            <Link href="/admin/pilgrims"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <i className="fas fa-certificate me-1" />التذاكير
            </Link>
            <span className="px-3 py-1.5 rounded-lg bg-gold text-white">
              <i className="fas fa-hands-praying me-1" />الدعاء
            </span>
          </nav>
          <button onClick={fetchData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-xs font-bold bg-white/10 hover:bg-white/20 transition">
            <i className="fas fa-arrows-rotate" /><span className="hidden sm:inline">تحديث</span>
          </button>
          <button onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                             text-xs font-bold bg-gold hover:bg-gold-light transition">
            <i className="fas fa-right-from-bracket" /><span className="hidden sm:inline">خروج</span>
          </button>
        </div>
        {/* Mobile tab nav */}
        <div className="md:hidden border-t border-white/10 px-4 sm:px-6 flex gap-1 text-xs font-bold">
          <Link href="/admin"          className="flex-1 text-center py-2 hover:bg-white/10 transition">
            <i className="fas fa-inbox me-1" />الطلبات
          </Link>
          <Link href="/admin/pilgrims" className="flex-1 text-center py-2 hover:bg-white/10 transition">
            <i className="fas fa-certificate me-1" />التذاكير
          </Link>
          <span className="flex-1 text-center py-2 bg-gold">
            <i className="fas fa-hands-praying me-1" />الدعاء
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {([
            { label: 'إجمالي الدعوات', value: stats.total,        icon: 'fa-bookmark',      color: 'from-teal-dark to-teal' },
            { label: 'تفاعلات بالدعاء', value: stats.totalReacts, icon: 'fa-hands-praying', color: 'from-gold-dark to-gold' },
            { label: 'حجاج موثّقون',    value: stats.withHajjBadge, icon: 'fa-star',         color: 'from-amber-600 to-amber-500' },
            { label: 'مخفية',           value: stats.hidden,       icon: 'fa-eye-slash',    color: 'from-red-600 to-red-500' },
          ]).map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gold/10 shadow-card">
              <div className={`inline-flex w-9 h-9 rounded-lg bg-gradient-to-br ${c.color}
                              items-center justify-center text-white mb-2`}>
                <i className={`fas ${c.icon} text-sm`} />
              </div>
              <p className="text-2xl font-black text-teal-dark leading-none">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gold/10 shadow-card p-3 sm:p-4 mb-5
                        flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
            <input type="search" placeholder="بحث بالنص، الاسم، البلد..."
                   value={query} onChange={e => setQuery(e.target.value)}
                   className="form-input ps-10" />
          </div>
          <div className="flex gap-2">
            <select value={filter} onChange={e => setFilter(e.target.value as Filter)}
                    className="form-input flex-1 sm:w-44">
              <option value="all">جميع الدعوات</option>
              <option value="visible">المعروضة فقط</option>
              <option value="hidden">المخفية فقط</option>
              <option value="badge">الحجاج فقط</option>
            </select>
            <button onClick={exportCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl
                               text-sm font-bold bg-teal text-white hover:bg-teal-light transition">
              <i className="fas fa-file-csv" /><span className="hidden sm:inline">تصدير</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
            <i className="fas fa-circle-exclamation me-1" />{error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3" />
            <p className="text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gold/10 shadow-card">
            <i className="fas fa-hands-praying text-gold/40 text-5xl mb-4" />
            <p className="text-gray-500 font-medium">
              {items.length === 0 ? 'لا توجد دعوات بعد' : 'لا توجد نتائج مطابقة'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(d => (
              <div key={d.id}
                   className={`bg-white rounded-2xl border shadow-card p-4 sm:p-5
                     ${d.hidden ? 'border-red-200 bg-red-50/30' : 'border-gold/10'}`}>
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                      {d.hajjYear && (
                        <span className="inline-flex items-center gap-1 bg-gold/15 text-gold-dark
                                         px-2 py-0.5 rounded-full font-bold">
                          <i className="fas fa-star text-[9px]" />حاج {d.hajjYear}
                        </span>
                      )}
                      <span className="font-bold text-teal-dark">{d.name || 'زائر كريم'}</span>
                      {d.country && <><span className="text-gray-300">·</span><span className="text-gray-500">{d.country}</span></>}
                      <span className="text-gray-300">·</span>
                      <span className="text-gray-500">{fmtDate(d.createdAt)}</span>
                      {d.hidden && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                         bg-red-100 text-red-700 font-bold">
                          <i className="fas fa-eye-slash text-[9px]" />مخفي
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {d.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gold/10 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   bg-gold/10 text-gold-dark font-bold">
                    🤲 {d.reactionCount ?? 0}
                  </span>
                  <a href={`/duaa/${d.id}`} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                                bg-teal-dark/10 hover:bg-teal-dark/20 text-teal-dark transition">
                    <i className="fas fa-eye" />معاينة
                  </a>
                  <button onClick={() => toggleHide(d.id, !d.hidden)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                      text-xs font-bold transition
                                      ${d.hidden
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                    <i className={`fas ${d.hidden ? 'fa-eye' : 'fa-eye-slash'}`} />
                    {d.hidden ? 'إظهار' : 'إخفاء'}
                  </button>
                  <button onClick={() => remove(d.id)}
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

        <p className="text-center text-xs text-gray-400 mt-6">
          {items.length > 0 && `${filtered.length} من ${items.length}`}
        </p>
      </main>
    </div>
  );
}

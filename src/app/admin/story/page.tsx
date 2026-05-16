'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { StoryRecord } from '@/lib/story';

function fmt(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('ar-SA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminStoryPage() {
  const router = useRouter();
  const [items,    setItems]    = useState<StoryRecord[]>([]);
  const [stats,    setStats]    = useState({ total: 0, withPdf: 0, withoutPdf: 0 });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [query,    setQuery]    = useState('');

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/story', { cache: 'no-store' });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setItems(data.items || []);
      setStats(data.stats || { total: 0, withPdf: 0, withoutPdf: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const remove = async (nid: string) => {
    if (!confirm('حذف القصّة وجميع صورها نهائياً؟')) return;
    const res = await fetch(`/api/admin/story/${nid}`, { method: 'DELETE' });
    if (!res.ok) { setError('فشل الحذف'); return; }
    fetchData();
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const filtered = items.filter(it => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return it.nationalId.includes(q);
  });

  return (
    <div className="min-h-screen">
      <header className="bg-teal-dark text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="bg-white/95 rounded-lg px-2 py-1">
            <Image src="/images/logo.png" alt="" width={120} height={40} className="h-8 w-auto object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-black truncate">لوحة التحكم — قصّتي</h1>
            <p className="text-[11px] text-gold-light/80">إدارة قصص الحجاج 1447هـ</p>
          </div>
          <nav className="hidden md:flex gap-1 text-xs font-bold">
            <Link href="/admin" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"><i className="fas fa-inbox me-1" />الطلبات</Link>
            <Link href="/admin/pilgrims" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"><i className="fas fa-certificate me-1" />التذاكير</Link>
            <span className="px-3 py-1.5 rounded-lg bg-gold text-white"><i className="fas fa-book-open me-1" />قصّتي</span>
            <Link href="/admin/story/settings" className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"><i className="fas fa-sliders me-1" />الإعدادات</Link>
          </nav>
          <button onClick={fetchData} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 transition">
            <i className="fas fa-arrows-rotate" /><span className="hidden sm:inline">تحديث</span>
          </button>
          <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gold hover:bg-gold-light transition">
            <i className="fas fa-right-from-bracket" /><span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'إجمالي القصص',    value: stats.total,      icon: 'fa-book-open',    color: 'from-teal-dark to-teal' },
            { label: 'بـ PDF جاهز',     value: stats.withPdf,    icon: 'fa-file-pdf',     color: 'from-gold-dark to-gold' },
            { label: 'بدون PDF',         value: stats.withoutPdf, icon: 'fa-hourglass-half', color: 'from-amber-600 to-amber-500' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gold/10 shadow-card">
              <div className={`inline-flex w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} items-center justify-center text-white mb-2`}>
                <i className={`fas ${c.icon} text-sm`} />
              </div>
              <p className="text-2xl font-black text-teal-dark leading-none">{c.value}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gold/10 shadow-card p-3 sm:p-4 mb-5">
          <input type="search" placeholder="بحث برقم الهوية..."
                 value={query} onChange={e => setQuery(e.target.value.replace(/\D/g, ''))}
                 className="form-input" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
            <i className="fas fa-circle-exclamation me-1" />{error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3" /><p className="text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gold/10 shadow-card">
            <i className="fas fa-book-open text-gold/40 text-5xl mb-4" />
            <p className="text-gray-500 font-medium">{items.length === 0 ? 'لا توجد قصص بعد' : 'لا توجد نتائج'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gold/10 shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream text-teal-dark text-xs">
                <tr>
                  <th className="text-start p-3">رقم الهوية</th>
                  <th className="text-start p-3 hidden sm:table-cell">slug</th>
                  <th className="text-start p-3 hidden sm:table-cell">آخر تحديث</th>
                  <th className="text-center p-3">PDF</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(it => (
                  <tr key={it.nationalId} className="border-t border-gold/10 hover:bg-cream/30 transition">
                    <td className="p-3 font-mono text-xs" dir="ltr">{it.nationalId}</td>
                    <td className="p-3 hidden sm:table-cell font-mono text-xs text-gray-500" dir="ltr">{it.slug}</td>
                    <td className="p-3 hidden sm:table-cell text-xs text-gray-500">{fmt(it.updatedAt)}</td>
                    <td className="p-3 text-center">
                      {it.pdfUrl
                        ? <a href={it.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700"><i className="fas fa-file-pdf" /></a>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-3 text-end">
                      <div className="inline-flex gap-1">
                        <Link href={`/story/s/${it.slug}`} target="_blank"
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-teal-dark/10 hover:bg-teal-dark/20 text-teal-dark text-xs">
                          <i className="fas fa-eye" />
                        </Link>
                        <button onClick={() => remove(it.nationalId)}
                                className="inline-flex items-center px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs">
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

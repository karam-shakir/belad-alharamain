'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Pilgrim, BulkResult, PilgrimsStats } from '@/lib/pilgrims';

function fmtDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('ar-SA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function csvEscape(v: string | number) {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[,"\n]/.test(s) ? `"${s}"` : s;
}

/* Auto-detect delimiter from the first line (handles , ; \t). */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const counts: Record<string, number> = {
    ',':  (firstLine.match(/,/g)  || []).length,
    ';':  (firstLine.match(/;/g)  || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
  };
  // Pick the delimiter with the highest count, default to comma
  return Object.entries(counts).reduce((best, [d, c]) => c > counts[best] ? d : best, ',');
}

/* Minimal CSV parser with delimiter auto-detection + quoted-field support. */
function parseCsv(text: string): string[][] {
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const delim = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delim) { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
        field = ''; row = [];
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

export default function AdminPilgrimsPage() {
  const router = useRouter();
  const [items,   setItems]   = useState<Pilgrim[]>([]);
  const [stats,   setStats]   = useState<PilgrimsStats>({ total: 0, viewed: 0, revoked: 0, byYear: {} });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [query,   setQuery]   = useState('');
  const [yearF,   setYearF]   = useState<string>('all');
  const [statusF, setStatusF] = useState<'all' | 'active' | 'revoked'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen,setBulkOpen]= useState(false);
  const [editing, setEditing] = useState<Pilgrim | null>(null);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/pilgrims', { cache: 'no-store' });
      if (res.status === 401) { router.replace('/admin/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setItems(data.items || []);
      setStats(data.stats || { total: 0, viewed: 0, revoked: 0, byYear: {} });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطأ');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const years = useMemo(() => {
    const ys = new Set<string>(items.map(p => p.hajjYear));
    return Array.from(ys).sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(p => {
      if (yearF !== 'all' && p.hajjYear !== yearF) return false;
      if (statusF === 'active'  && p.revokedAt) return false;
      if (statusF === 'revoked' && !p.revokedAt) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.nationalId.includes(q) || (p.country ?? '').toLowerCase().includes(q);
    });
  }, [items, query, yearF, statusF]);

  const exportCsv = () => {
    const rows = [
      ['nationalId', 'name', 'hajjYear', 'country', 'verifyCode', 'viewCount', 'revoked'],
      ...filtered.map(p => [
        p.nationalId, p.name, p.hajjYear, p.country ?? '', p.verifyCode,
        String(p.viewCount ?? 0), p.revokedAt ? 'yes' : '',
      ]),
    ];
    const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pilgrims-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const csv = 'nationalId,name,hajjYear,country\n1234567890,أحمد بن محمد العتيبي,1447,سعودي\n2345678901,محمد بن علي الحربي,1447,سعودي';
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pilgrims-template.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const remove = async (id: string) => {
    if (!confirm('حذف نهائي لهذا الحاج؟ لا يمكن التراجع.')) return;
    const res = await fetch(`/api/admin/pilgrims/${id}`, { method: 'DELETE' });
    if (!res.ok) { setError('فشل الحذف'); return; }
    fetchData();
  };

  const toggleRevoke = async (p: Pilgrim) => {
    if (p.revokedAt) {
      if (!confirm('إعادة تفعيل هذه الشهادة؟')) return;
      const res = await fetch(`/api/admin/pilgrims/${p.nationalId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unrevoke' }),
      });
      if (!res.ok) { setError('فشل'); return; }
    } else {
      const reason = prompt('سبب إلغاء الشهادة:');
      if (!reason) return;
      const res = await fetch(`/api/admin/pilgrims/${p.nationalId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', reason }),
      });
      if (!res.ok) { setError('فشل'); return; }
    }
    fetchData();
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
            <h1 className="text-sm sm:text-base font-black leading-tight truncate">لوحة التحكم — شهادات الحج</h1>
            <p className="text-[11px] text-gold-light/80">إدارة قائمة الحجاج</p>
          </div>
          <nav className="hidden md:flex gap-1 text-xs font-bold">
            <Link href="/admin"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition">
              <i className="fas fa-inbox me-1" />الطلبات
            </Link>
            <span className="px-3 py-1.5 rounded-lg bg-gold text-white">
              <i className="fas fa-certificate me-1" />الشهادات
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
          <Link href="/admin"
                className="flex-1 text-center py-2 hover:bg-white/10 transition">
            <i className="fas fa-inbox me-1" />الطلبات
          </Link>
          <span className="flex-1 text-center py-2 bg-gold">
            <i className="fas fa-certificate me-1" />الشهادات
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {([
            { label: 'إجمالي الحجاج', value: stats.total,   icon: 'fa-users',         color: 'from-teal-dark to-teal' },
            { label: 'استخرجوا الشهادة', value: stats.viewed, icon: 'fa-certificate', color: 'from-gold-dark to-gold' },
            { label: 'لم يستخرجوا',   value: stats.total - stats.viewed, icon: 'fa-clock', color: 'from-blue-600 to-blue-500' },
            { label: 'ملغاة',         value: stats.revoked, icon: 'fa-ban',          color: 'from-red-600 to-red-500' },
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
                        flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <i className="fas fa-search absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" />
              <input type="search" placeholder="بحث بالاسم، رقم الهوية، الدولة..."
                     value={query} onChange={e => setQuery(e.target.value)}
                     className="form-input ps-10" />
            </div>
            <select value={yearF} onChange={e => setYearF(e.target.value)}
                    className="form-input sm:w-36">
              <option value="all">كل السنوات</option>
              {years.map(y => <option key={y} value={y}>{y} هـ</option>)}
            </select>
            <select value={statusF} onChange={e => setStatusF(e.target.value as 'all' | 'active' | 'revoked')}
                    className="form-input sm:w-36">
              <option value="all">جميع الحالات</option>
              <option value="active">فعّالة</option>
              <option value="revoked">ملغاة</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAddOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                               bg-gold hover:bg-gold-light text-white transition shadow-gold">
              <i className="fas fa-plus" />إضافة حاج
            </button>
            <button onClick={() => setBulkOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                               bg-teal hover:bg-teal-light text-white transition">
              <i className="fas fa-file-csv" />رفع CSV
            </button>
            <button onClick={downloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                               bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
              <i className="fas fa-download" />تحميل قالب CSV
            </button>
            <button onClick={exportCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold
                               bg-gray-100 hover:bg-gray-200 text-gray-700 transition ms-auto">
              <i className="fas fa-file-export" />تصدير
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
            <i className="fas fa-circle-exclamation me-1" />{error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3" />
            <p className="text-sm">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gold/10 shadow-card">
            <i className="fas fa-user-plus text-gold/40 text-5xl mb-4" />
            <p className="text-gray-500 font-medium mb-3">
              {items.length === 0 ? 'لا توجد حجاج بعد. ابدأ بالإضافة أو رفع CSV.' : 'لا توجد نتائج مطابقة'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gold/10 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-dark/40 text-teal-dark">
                  <tr>
                    <th className="px-3 py-3 text-start font-bold text-xs">الاسم</th>
                    <th className="px-3 py-3 text-start font-bold text-xs">رقم الهوية</th>
                    <th className="px-3 py-3 text-start font-bold text-xs">السنة</th>
                    <th className="px-3 py-3 text-start font-bold text-xs hidden sm:table-cell">الجنسية</th>
                    <th className="px-3 py-3 text-start font-bold text-xs hidden md:table-cell">الإصدار</th>
                    <th className="px-3 py-3 text-center font-bold text-xs">المشاهدات</th>
                    <th className="px-3 py-3 text-center font-bold text-xs">الحالة</th>
                    <th className="px-3 py-3 text-end font-bold text-xs">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {filtered.map(p => (
                    <tr key={p.nationalId} className="hover:bg-cream/40 transition-colors">
                      <td className="px-3 py-3 font-semibold text-teal-dark">{p.name}</td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600" dir="ltr">{p.nationalId}</td>
                      <td className="px-3 py-3 font-bold text-gold-dark">{p.hajjYear}</td>
                      <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{p.country ?? '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500 hidden md:table-cell">{fmtDate(p.createdAt)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold
                                          ${(p.viewCount ?? 0) > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-500'}`}>
                          <i className="fas fa-eye text-[10px]" />{p.viewCount ?? 0}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.revokedAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                           bg-red-100 text-red-700 text-xs font-bold">
                            <i className="fas fa-ban text-[10px]" />ملغاة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                           bg-green-100 text-green-700 text-xs font-bold">
                            <i className="fas fa-circle-check text-[10px]" />فعّالة
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-end">
                        <div className="inline-flex gap-1">
                          <a href={`/verify/${p.verifyCode}`} target="_blank" rel="noopener noreferrer"
                             title="معاينة الشهادة" aria-label="معاينة"
                             className="w-7 h-7 inline-flex items-center justify-center rounded-md
                                        text-gold hover:bg-gold/10 transition">
                            <i className="fas fa-eye text-xs" />
                          </a>
                          <button onClick={() => setEditing(p)} title="تعديل"
                                  className="w-7 h-7 inline-flex items-center justify-center rounded-md
                                             text-blue-600 hover:bg-blue-50 transition">
                            <i className="fas fa-pen text-xs" />
                          </button>
                          <button onClick={() => toggleRevoke(p)} title={p.revokedAt ? 'إعادة التفعيل' : 'إلغاء'}
                                  className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition
                                              ${p.revokedAt
                                                ? 'text-green-600 hover:bg-green-50'
                                                : 'text-amber-600 hover:bg-amber-50'}`}>
                            <i className={`fas ${p.revokedAt ? 'fa-rotate-left' : 'fa-ban'} text-xs`} />
                          </button>
                          <button onClick={() => remove(p.nationalId)} title="حذف"
                                  className="w-7 h-7 inline-flex items-center justify-center rounded-md
                                             text-red-600 hover:bg-red-50 transition">
                            <i className="fas fa-trash text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          {items.length > 0 && `${filtered.length} من ${items.length}`}
        </p>
      </main>

      {/* Add modal */}
      {addOpen && <AddModal onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); fetchData(); }} />}

      {/* Edit modal */}
      {editing && <EditModal pilgrim={editing} onClose={() => setEditing(null)}
                             onSaved={() => { setEditing(null); fetchData(); }} />}

      {/* Bulk modal */}
      {bulkOpen && <BulkModal parseCsv={parseCsv} onClose={() => setBulkOpen(false)}
                              onDone={() => { setBulkOpen(false); fetchData(); }} />}
    </div>
  );
}

/* ── Modals ─── */

function AddModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [nid,     setNid]     = useState('');
  const [name,    setName]    = useState('');
  const [year,    setYear]    = useState('1447');
  const [country, setCountry] = useState('');
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState('');

  const save = async () => {
    setErr('');
    if (!/^\d{10}$/.test(nid)) { setErr('رقم الهوية يجب أن يكون 10 أرقام'); return; }
    if (!name.trim() || !year.trim()) { setErr('الاسم والسنة مطلوبان'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/pilgrims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId: nid, name, hajjYear: year, country }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data?.error ?? 'فشل'); return; }
      onSaved();
    } finally { setBusy(false); }
  };

  return (
    <Modal title="إضافة حاج جديد" onClose={onClose}>
      <div className="space-y-3">
        <Field label="رقم الهوية (10 أرقام)" >
          <input className="form-input text-center font-mono tracking-widest" dir="ltr"
                 maxLength={10} value={nid}
                 onChange={e => setNid(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        </Field>
        <Field label="الاسم الكامل بالعربية">
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="سنة الحج (هجري)">
          <input className="form-input" dir="ltr" value={year}
                 onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </Field>
        <Field label="الجنسية (اختياري)">
          <input className="form-input" value={country} onChange={e => setCountry(e.target.value)} />
        </Field>
        {err && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{err}</p>}
      </div>
      <ModalFooter>
        <button onClick={save} disabled={busy}
                className="px-4 py-2 bg-gold hover:bg-gold-light disabled:bg-gold/40
                           text-white font-bold rounded-lg text-sm">
          {busy ? <><i className="fas fa-spinner fa-spin me-1" />جارٍ...</> : 'حفظ'}
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">
          إلغاء
        </button>
      </ModalFooter>
    </Modal>
  );
}

function EditModal({ pilgrim, onClose, onSaved }: { pilgrim: Pilgrim; onClose: () => void; onSaved: () => void }) {
  const [name,    setName]    = useState(pilgrim.name);
  const [year,    setYear]    = useState(pilgrim.hajjYear);
  const [country, setCountry] = useState(pilgrim.country ?? '');
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState('');

  const save = async () => {
    setErr('');
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pilgrims/${pilgrim.nationalId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, hajjYear: year, country }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data?.error ?? 'فشل'); return; }
      onSaved();
    } finally { setBusy(false); }
  };

  return (
    <Modal title="تعديل بيانات الحاج" onClose={onClose}>
      <div className="space-y-3">
        <Field label="رقم الهوية">
          <input className="form-input text-center font-mono bg-gray-100" disabled value={pilgrim.nationalId} dir="ltr" />
        </Field>
        <Field label="الاسم الكامل">
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="سنة الحج">
          <input className="form-input" dir="ltr" value={year} onChange={e => setYear(e.target.value)} />
        </Field>
        <Field label="الجنسية">
          <input className="form-input" value={country} onChange={e => setCountry(e.target.value)} />
        </Field>
        {err && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{err}</p>}
      </div>
      <ModalFooter>
        <button onClick={save} disabled={busy}
                className="px-4 py-2 bg-gold hover:bg-gold-light disabled:bg-gold/40
                           text-white font-bold rounded-lg text-sm">
          {busy ? 'جارٍ...' : 'حفظ التعديلات'}
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">
          إلغاء
        </button>
      </ModalFooter>
    </Modal>
  );
}

function BulkModal({ parseCsv, onClose, onDone }: {
  parseCsv: (text: string) => string[][];
  onClose: () => void;
  onDone: () => void;
}) {
  const [rows,    setRows]    = useState<{ nationalId: string; name: string; hajjYear: string; country?: string }[]>([]);
  const [busy,    setBusy]    = useState(false);
  const [result,  setResult]  = useState<BulkResult | null>(null);
  const [err,     setErr]     = useState('');

  const handleFile = async (f: File) => {
    setErr('');
    setResult(null);
    if (f.size > 5 * 1024 * 1024) { setErr('الحد الأقصى للملف 5MB'); return; }
    const text = await f.text();
    const parsed = parseCsv(text);
    if (!parsed.length) { setErr('الملف فارغ'); return; }

    // Detect header row
    const header = parsed[0].map(c => c.trim().toLowerCase());
    const startIdx = header.includes('nationalid') || header.includes('رقم الهوية') ? 1 : 0;

    const idxId      = Math.max(header.indexOf('nationalid'), header.indexOf('رقم الهوية'), 0);
    const idxName    = Math.max(header.indexOf('name'),       header.indexOf('الاسم'),       1);
    const idxYear    = Math.max(header.indexOf('hajjyear'),   header.indexOf('سنة الحج'),    header.indexOf('السنة'), 2);
    const idxCountry = Math.max(header.indexOf('country'),    header.indexOf('الجنسية'),     header.indexOf('الدولة'), 3);

    const out: typeof rows = [];
    for (let i = startIdx; i < parsed.length; i++) {
      const r = parsed[i];
      if (r.every(c => !c.trim())) continue;
      out.push({
        nationalId: (r[idxId]      ?? '').replace(/\D/g, ''),
        name:       (r[idxName]    ?? '').trim(),
        hajjYear:   (r[idxYear]    ?? '').replace(/\D/g, ''),
        country:    (r[idxCountry] ?? '').trim() || undefined,
      });
    }
    setRows(out);
  };

  const upload = async () => {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/pilgrims', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data?.error ?? 'فشل'); return; }
      setResult(data.result as BulkResult);
    } finally { setBusy(false); }
  };

  return (
    <Modal title="رفع قائمة حجاج (CSV)" onClose={onClose} wide>
      {!result ? (
        <>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">
              <i className="fas fa-info-circle text-gold me-1" />
              الأعمدة المطلوبة: <code className="bg-gray-100 px-1 rounded">nationalId, name, hajjYear, country</code>
              <br />
              <span className="text-gray-400">يدعم رؤوس الأعمدة بالعربية: رقم الهوية، الاسم، سنة الحج، الجنسية</span>
            </p>
            <input type="file" accept=".csv,text/csv"
                   onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                   className="form-input text-sm" />
          </div>

          {rows.length > 0 && (
            <>
              <div className="bg-cream/40 rounded-lg p-3 mb-3 text-sm">
                <strong>{rows.length}</strong> صف للقراءة. الصفوف التالية معاينة:
              </div>
              <div className="overflow-x-auto max-h-64 border border-gold/15 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-cream-dark/50 sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-start">#</th>
                      <th className="px-2 py-2 text-start">رقم الهوية</th>
                      <th className="px-2 py-2 text-start">الاسم</th>
                      <th className="px-2 py-2 text-start">السنة</th>
                      <th className="px-2 py-2 text-start">الجنسية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {rows.slice(0, 50).map((r, i) => {
                      const valid = /^\d{10}$/.test(r.nationalId) && r.name && r.hajjYear;
                      return (
                        <tr key={i} className={valid ? '' : 'bg-red-50'}>
                          <td className="px-2 py-1 text-gray-400">{i + 1}</td>
                          <td className="px-2 py-1 font-mono" dir="ltr">{r.nationalId}</td>
                          <td className="px-2 py-1">{r.name}</td>
                          <td className="px-2 py-1 font-bold">{r.hajjYear}</td>
                          <td className="px-2 py-1 text-gray-500">{r.country ?? '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length > 50 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  ...و {rows.length - 50} صف آخر. سيُعالَج الكل عند الحفظ.
                </p>
              )}
            </>
          )}
          {err && <p className="text-red-600 text-xs bg-red-50 p-2 rounded mt-3">{err}</p>}
        </>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
            <i className="fas fa-circle-check text-green-500 text-3xl mb-2" />
            <p className="font-black text-green-700">تم الرفع بنجاح</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-black text-blue-700">{result.added}</p>
              <p className="text-xs text-blue-600 font-bold">جديد</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-2xl font-black text-amber-700">{result.updated}</p>
              <p className="text-xs text-amber-600 font-bold">محدّث</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-black text-red-700">{result.skipped.length}</p>
              <p className="text-xs text-red-600 font-bold">مُتجاوز</p>
            </div>
          </div>
          {result.skipped.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="font-bold text-red-700 text-xs mb-2">صفوف مُتجاوزة:</p>
              {result.skipped.slice(0, 20).map((s, i) => (
                <p key={i} className="text-[11px] text-red-700">
                  صف {s.row}: {s.reason}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <ModalFooter>
        {!result ? (
          <>
            <button onClick={upload} disabled={busy || rows.length === 0}
                    className="px-4 py-2 bg-gold hover:bg-gold-light disabled:bg-gold/40
                               text-white font-bold rounded-lg text-sm">
              {busy ? <><i className="fas fa-spinner fa-spin me-1" />جاري الرفع...</>
                    : <><i className="fas fa-upload me-1" />رفع {rows.length} صف</>}
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">
              إلغاء
            </button>
          </>
        ) : (
          <button onClick={onDone}
                  className="px-4 py-2 bg-gold hover:bg-gold-light text-white font-bold rounded-lg text-sm">
            تم
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}

/* ── Generic modal shell ─── */
function Modal({ title, children, onClose, wide = false }: {
  title: string; children: React.ReactNode; onClose: () => void; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gold/20
                       ${wide ? 'max-w-3xl' : 'max-w-md'} w-full max-h-[90vh] overflow-y-auto`}
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/15
                        sticky top-0 bg-white z-10">
          <h2 className="text-base font-black text-teal-dark">{title}</h2>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 transition flex items-center justify-center text-gray-500">
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gold/15">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-teal-dark mb-1.5">{label}</label>
      {children}
    </div>
  );
}

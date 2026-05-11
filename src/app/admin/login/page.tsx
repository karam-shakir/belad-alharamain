'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword]   = useState('');
  const [showPwd,  setShowPwd]    = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('أدخل كلمة السر.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'فشل تسجيل الدخول.');
        setLoading(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('تعذّر الاتصال بالخادم.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10
                    bg-gradient-to-br from-teal-dark via-teal to-teal-dark">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-2xl">
            <Image src="/images/logo.png" alt="بلاد الحرمين"
                   width={220} height={80}
                   className="h-16 w-auto object-contain" priority />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gold/15 p-7 sm:p-9">
          <div className="text-center mb-7">
            <div className="inline-flex w-14 h-14 rounded-full bg-gold/15
                            items-center justify-center mb-3">
              <i className="fas fa-lock text-gold text-xl" />
            </div>
            <h1 className="text-2xl font-black text-teal-dark mb-1">لوحة التحكم</h1>
            <p className="text-sm text-gray-500">تسجيل دخول الإدارة</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="pwd" className="block text-sm font-bold text-teal-dark mb-1.5">
                كلمة السر
              </label>
              <div className="relative">
                <input
                  id="pwd"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input pe-12"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
                <button type="button"
                        onClick={() => setShowPwd(v => !v)}
                        className="absolute top-1/2 -translate-y-1/2 end-3
                                   text-gray-400 hover:text-teal-dark transition-colors"
                        aria-label={showPwd ? 'إخفاء' : 'إظهار'}>
                  <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                              rounded-lg p-3 flex items-start gap-2">
                <i className="fas fa-circle-exclamation mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2
                               bg-gold hover:bg-gold-light disabled:bg-gold/60
                               text-white font-bold py-3.5 rounded-xl
                               transition-all duration-300 hover:-translate-y-0.5
                               shadow-gold hover:shadow-gold-lg">
              {loading
                ? <><i className="fas fa-spinner fa-spin" /><span>جاري التحقق...</span></>
                : <><i className="fas fa-sign-in-alt" /><span>دخول</span></>
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            <i className="fas fa-shield-halved" />
            صفحة محمية — للموظفين المخوّلين فقط
          </p>
        </div>

        <p className="text-center text-white/40 text-xs mt-5">
          © 2026 بلاد الحرمين للحج والعمرة
        </p>
      </div>
    </div>
  );
}

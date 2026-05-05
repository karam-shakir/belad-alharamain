'use client';

import { useState, useRef, FormEvent, DragEvent } from 'react';

const benefits = [
  { ar: 'باقات تنافسية مصممة خصيصاً للوكالات الخارجية',      en: 'Competitive packages designed for external agencies'  },
  { ar: 'دعم فني وميداني متخصص على مدار الساعة',              en: '24/7 specialized technical and field support'         },
  { ar: 'عمولات تنافسية وبرامج مكافآت للوكلاء المتميزين',      en: 'Competitive commissions and partner reward programs'  },
  { ar: 'نظام إلكتروني متكامل لإدارة ملفات الحجاج',           en: 'Integrated electronic system for pilgrim management'  },
  { ar: 'تدريب وتأهيل مستمر لموظفي الوكالات الشريكة',         en: 'Ongoing training for partner agency staff'            },
  { ar: 'مواد تسويقية احترافية جاهزة للاستخدام الفوري',        en: 'Professional marketing materials ready to use'        },
];

const countries = [
  'مصر','تركيا','باكستان','بنغلاديش','إندونيسيا','ماليزيا',
  'المغرب','الجزائر','تونس','نيجيريا','السنغال','الهند','أخرى',
];

type Field = { name: string; value: string; required: boolean; error: boolean };

const initialFields = (): Record<string, Field> => ({
  agencyName:    { name: 'agencyName',    value: '', required: true,  error: false },
  country:       { name: 'country',       value: '', required: true,  error: false },
  contactPerson: { name: 'contactPerson', value: '', required: true,  error: false },
  email:         { name: 'email',         value: '', required: true,  error: false },
  phone:         { name: 'phone',         value: '', required: true,  error: false },
});

export default function Agencies() {
  const [fields,   setFields]   = useState(initialFields());
  const [file,     setFile]     = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileErr,  setFileErr]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const fileInput                = useRef<HTMLInputElement>(null);

  const setVal = (key: string, val: string) =>
    setFields(f => ({ ...f, [key]: { ...f[key], value: val, error: false } }));

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('يُسمح بملفات PDF فقط'); return; }
    if (f.size > 10 * 1024 * 1024)    { alert('الحجم الأقصى 10MB');     return; }
    setFile(f); setFileErr(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  const validate = (): boolean => {
    let ok = true;
    const next = { ...fields };
    for (const key in next) {
      const f = next[key];
      let valid = f.value.trim() !== '';
      if (key === 'email' && valid) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
      if (!valid) { next[key] = { ...f, error: true }; ok = false; }
    }
    if (!file) { setFileErr(true); ok = false; }
    setFields(next);
    return ok;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    /* ── Simulate API upload ──
       Replace with:
       const fd = new FormData();
       Object.entries(fields).forEach(([k,v]) => fd.append(k, v.value));
       fd.append('contract', file!);
       await fetch('/api/agency-register', { method: 'POST', body: fd });
    ── */
    await new Promise(r => setTimeout(r, 2000));

    setLoading(false);
    setSuccess(true);
  };

  const inputCls = (key: string) =>
    `form-input ${fields[key]?.error ? 'error' : ''}`;

  return (
    <section id="agencies" className="py-24 bg-pattern relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-24 -start-24 w-72 h-72 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -end-24 w-72 h-72 bg-teal/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-teal text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="للوكالات الخارجية" data-en="External Agencies">للوكالات الخارجية</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="التعاقد مع الوكالات الخارجية" data-en="Partnership with External Agencies">
            التعاقد مع الوكالات الخارجية
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto"
             data-ar="انضم إلى شبكة شركائنا العالميين وقدّم لعملائك تجربة روحانية لا تُنسى"
             data-en="Join our global partner network and offer your clients an unforgettable spiritual experience">
            انضم إلى شبكة شركائنا العالميين وقدّم لعملائك تجربة روحانية لا تُنسى
          </p>
          <div className="gold-divider"><span><i className="fas fa-handshake" /></span></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Left: Info ─── */}
          <div className="reveal-right">
            <div className="bg-teal-gradient rounded-3xl p-8 text-white h-full">
              <h3 className="text-xl font-black text-gold-light mb-6"
                  data-ar="لماذا تشترك معنا؟" data-en="Why Partner With Us?">
                لماذا تشترك معنا؟
              </h3>
              <ul className="space-y-4 mb-8">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/85 leading-relaxed">
                    <i className="fas fa-check-circle text-gold mt-0.5 flex-shrink-0" />
                    <span data-ar={b.ar} data-en={b.en}>{b.ar}</span>
                  </li>
                ))}
              </ul>

              {/* Download contract */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20
                              rounded-2xl p-5 mb-6">
                <p className="text-sm text-white/75 mb-3"
                   data-ar="حمّل نموذج العقد، أكمله وأرسله موقعاً"
                   data-en="Download the contract template, complete it, and submit it signed">
                  حمّل نموذج العقد، أكمله وأرسله موقعاً
                </p>
                <button
                  onClick={() => alert('سيتم رفع ملف العقد قريباً\nThe contract PDF will be available soon.')}
                  className="flex items-center gap-2 bg-gold hover:bg-gold-light text-white
                             font-bold px-5 py-2.5 rounded-full transition-all duration-200
                             hover:-translate-y-0.5 shadow-gold text-sm w-full justify-center"
                  data-ar="تحميل نموذج العقد (PDF)" data-en="Download Contract (PDF)">
                  <i className="fas fa-file-pdf" />
                  تحميل نموذج العقد (PDF)
                </button>
              </div>

              {/* Partner flags */}
              <div>
                <p className="text-xs text-white/50 mb-2 font-semibold"
                   data-ar="شركاؤنا حول العالم" data-en="Our Global Partners">
                  شركاؤنا حول العالم
                </p>
                <div className="flex flex-wrap gap-2 text-2xl">
                  {['🇪🇬','🇹🇷','🇵🇰','🇮🇩','🇲🇾','🇲🇦','🇩🇿','🇳🇬','🇧🇩'].map(f => (
                    <span key={f} className="hover:scale-125 transition-transform duration-200 cursor-default">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Form ─── */}
          <div className="reveal-left">
            <div className="bg-white rounded-3xl shadow-card-lg border border-gold/15 p-8">

              {!success ? (
                <>
                  <div className="flex items-center gap-2 mb-6 pb-5 border-b border-gold/15">
                    <i className="fas fa-file-signature text-gold text-xl" />
                    <h3 className="font-black text-teal-dark text-lg"
                        data-ar="نموذج تسجيل الوكالة" data-en="Agency Registration Form">
                      نموذج تسجيل الوكالة
                    </h3>
                  </div>

                  <form onSubmit={onSubmit} noValidate className="space-y-4">

                    {/* Agency Name */}
                    <div>
                      <label className="block text-sm font-bold text-teal-dark mb-1.5"
                             data-ar="اسم الوكالة / الشركة *" data-en="Agency Name *">
                        اسم الوكالة / الشركة *
                      </label>
                      <input
                        type="text"
                        className={inputCls('agencyName')}
                        placeholder="اسم شركة السفر أو الوكالة"
                        value={fields.agencyName.value}
                        onChange={e => setVal('agencyName', e.target.value)}
                      />
                      {fields.agencyName.error && (
                        <p className="text-red-500 text-xs mt-1"
                           data-ar="هذا الحقل مطلوب" data-en="This field is required">
                          هذا الحقل مطلوب
                        </p>
                      )}
                    </div>

                    {/* Country + Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="الدولة *" data-en="Country *">الدولة *</label>
                        <select
                          className={inputCls('country')}
                          value={fields.country.value}
                          onChange={e => setVal('country', e.target.value)}
                        >
                          <option value="">اختر الدولة</option>
                          {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {fields.country.error && (
                          <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="جهة الاتصال *" data-en="Contact Person *">جهة الاتصال *</label>
                        <input
                          type="text"
                          className={inputCls('contactPerson')}
                          placeholder="الاسم الكامل"
                          value={fields.contactPerson.value}
                          onChange={e => setVal('contactPerson', e.target.value)}
                        />
                        {fields.contactPerson.error && (
                          <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
                        )}
                      </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="البريد الإلكتروني *" data-en="Email *">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          className={inputCls('email')}
                          placeholder="agency@example.com"
                          value={fields.email.value}
                          onChange={e => setVal('email', e.target.value)}
                        />
                        {fields.email.error && (
                          <p className="text-red-500 text-xs mt-1"
                             data-ar="بريد إلكتروني غير صحيح" data-en="Invalid email">
                            بريد إلكتروني غير صحيح
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="رقم الهاتف *" data-en="Phone *">رقم الهاتف *</label>
                        <input
                          type="tel"
                          className={inputCls('phone')}
                          placeholder="+966 5X XXX XXXX"
                          value={fields.phone.value}
                          onChange={e => setVal('phone', e.target.value)}
                        />
                        {fields.phone.error && (
                          <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
                        )}
                      </div>
                    </div>

                    {/* File upload */}
                    <div>
                      <label className="block text-sm font-bold text-teal-dark mb-1.5"
                             data-ar="رفع العقد الموقع (PDF) *" data-en="Upload Signed Contract (PDF) *">
                        رفع العقد الموقع (PDF) *
                      </label>

                      {file ? (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200
                                        rounded-xl p-3 text-sm">
                          <i className="fas fa-file-pdf text-red-500 text-xl" />
                          <span className="flex-1 truncate text-gray-700 font-medium">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-times" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`drop-zone ${dragging ? 'dragging' : ''} ${fileErr ? 'border-red-400' : ''}`}
                          onDragOver={e => { e.preventDefault(); setDragging(true); }}
                          onDragLeave={() => setDragging(false)}
                          onDrop={onDrop}
                          onClick={() => fileInput.current?.click()}
                        >
                          <input
                            ref={fileInput}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e => handleFile(e.target.files?.[0] ?? null)}
                          />
                          <i className="fas fa-cloud-upload-alt text-gold text-3xl mb-2 block" />
                          <p className="text-sm font-semibold text-teal-dark mb-1"
                             data-ar="اسحب الملف هنا أو انقر للاختيار"
                             data-en="Drag file here or click to select">
                            اسحب الملف هنا أو انقر للاختيار
                          </p>
                          <span className="text-xs text-gray-400"
                                data-ar="PDF فقط — الحجم الأقصى 10MB"
                                data-en="PDF only — Max 10MB">
                            PDF فقط — الحجم الأقصى 10MB
                          </span>
                        </div>
                      )}
                      {fileErr && (
                        <p className="text-red-500 text-xs mt-1"
                           data-ar="يرجى رفع العقد الموقع" data-en="Please upload the signed contract">
                          يرجى رفع العقد الموقع
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2
                                 bg-teal hover:bg-teal-light disabled:bg-teal/60
                                 text-white font-bold py-3.5 rounded-xl
                                 transition-all duration-300 hover:-translate-y-0.5
                                 shadow-teal hover:shadow-teal-lg"
                    >
                      {loading ? (
                        <><i className="fas fa-spinner fa-spin" />
                          <span data-ar="جاري الإرسال..." data-en="Sending...">جاري الإرسال...</span></>
                      ) : (
                        <><i className="fas fa-paper-plane" />
                          <span data-ar="إرسال طلب التسجيل" data-en="Submit Registration">إرسال طلب التسجيل</span></>
                      )}
                    </button>

                  </form>
                </>
              ) : (
                /* Success */
                <div className="py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center
                                  justify-center mx-auto mb-6">
                    <i className="fas fa-check-circle text-green-500 text-4xl" />
                  </div>
                  <h4 className="text-xl font-black text-teal-dark mb-2"
                      data-ar="تم استلام طلبكم بنجاح!" data-en="Request Received!">
                    تم استلام طلبكم بنجاح!
                  </h4>
                  <p className="text-gray-500 text-sm"
                     data-ar="سيتواصل معكم فريقنا خلال 48 ساعة عمل"
                     data-en="Our team will contact you within 48 business hours">
                    سيتواصل معكم فريقنا خلال 48 ساعة عمل
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { contact } from '@/content/site';

// Format WhatsApp number for display: 966500000000 -> +966 50 000 0000
const fmtWa = (n: string) => {
  const c = n.replace(/\D/g, '');
  if (c.length < 4) return '+' + c;
  return `+${c.slice(0,3)} ${c.slice(3,5)} ${c.slice(5,8)} ${c.slice(8)}`.trim();
};
const waDisplay = fmtWa(contact.whatsapp);

const waMsg = encodeURIComponent('السلام عليكم، أودّ الاستفسار عن خدمات الحج/العمرة.');

const contactInfo = [
  { icon: 'fa-location-dot', title_ar: 'العنوان',           title_en: 'Address',
    value_ar: contact.address.ar, value_en: contact.address.en,
    ltr: false, link: '' },
  { icon: 'fa-phone',        title_ar: 'الهاتف',            title_en: 'Phone',
    value_ar: contact.phone,      value_en: contact.phone,
    ltr: true,  link: `tel:${contact.phone.replace(/\s+/g, '')}` },
  { icon: 'fab fa-whatsapp', title_ar: 'واتساب',            title_en: 'WhatsApp',
    value_ar: waDisplay,          value_en: waDisplay,
    ltr: true,  link: `https://wa.me/${contact.whatsapp}?text=${waMsg}` },
  { icon: 'fa-envelope',     title_ar: 'البريد الإلكتروني', title_en: 'Email',
    value_ar: contact.email,      value_en: contact.email,
    ltr: true,  link: `mailto:${contact.email}` },
  { icon: 'fa-clock',        title_ar: 'ساعات العمل',       title_en: 'Working Hours',
    value_ar: contact.hours.ar,   value_en: contact.hours.en,
    ltr: false, link: '' },
];

const subjects = [
  { ar: 'استفسار عن باقات الحج',   en: 'Hajj Package Inquiry'    },
  { ar: 'استفسار عن باقات العمرة', en: 'Umrah Package Inquiry'   },
  { ar: 'الخدمات الفاخرة VIP',     en: 'VIP Services'            },
  { ar: 'تعاقد الوكالات',          en: 'Agency Partnership'      },
  { ar: 'أخرى',                    en: 'Other'                   },
];

export default function Contact() {
  const [fields, setFields] = useState({ name:'', phone:'', email:'', subject:'', message:'' });
  const [errors, setErrors] = useState<Record<string,boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => {
    setFields(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: false }));
  };

  const validate = () => {
    const e: Record<string,boolean> = {};
    if (!fields.name.trim())    e.name    = true;
    if (!fields.phone.trim())   e.phone   = true;
    if (!fields.message.trim()) e.message = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;
    setLoading(true);
    try {
      const hp = (document.getElementById('contact-hp') as HTMLInputElement | null)?.value ?? '';
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, hp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data?.error || 'تعذّر إرسال الرسالة، حاول لاحقاً.');
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setErrorMsg('تعذّر الاتصال بالخادم، تحقّق من الإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const cls = (k: string) =>
    `form-input ${errors[k] ? 'error' : ''}`;

  return (
    <section id="contact" className="py-24 bg-pattern-white relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-32 -end-32 w-80 h-80 bg-teal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -start-32 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14 reveal">
          <span className="inline-block bg-gold text-white text-xs font-bold tracking-widest
                           uppercase px-4 py-1.5 rounded-full mb-4"
                data-ar="تواصل معنا" data-en="Contact Us">تواصل معنا</span>
          <h2 className="text-3xl sm:text-4xl font-black text-teal-dark mb-4"
              data-ar="نحن هنا لخدمتكم" data-en="We Are Here to Serve You">
            نحن هنا لخدمتكم
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto"
             data-ar="تواصلوا معنا لأي استفسار أو للتسجيل في خدماتنا المتميزة"
             data-en="Contact us for any inquiry or to register for our distinguished services">
            تواصلوا معنا لأي استفسار أو للتسجيل في خدماتنا المتميزة
          </p>
          <div className="gold-divider"><span><i className="fas fa-envelope" /></span></div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Contact Info + Map ─── */}
          <div className="lg:col-span-2 reveal-right space-y-4">
            <div className="bg-teal-gradient rounded-3xl p-5 sm:p-7 text-white">
              <h3 className="font-black text-gold-light mb-5 text-lg"
                  data-ar="بيانات التواصل" data-en="Contact Details">بيانات التواصل</h3>
              <div className="space-y-4">
                {contactInfo.map((c, i) => (
                  <div key={i} className="flex items-start gap-3.5 py-3
                                          border-b border-white/10 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center
                                    justify-center flex-shrink-0">
                      <i className={`${c.icon.startsWith('fab') ? c.icon : `fas ${c.icon}`}
                                     text-gold-light text-sm`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/55 text-xs font-semibold mb-0.5"
                         data-ar={c.title_ar} data-en={c.title_en}>{c.title_ar}</p>
                      {c.link ? (
                        <a href={c.link}
                           target={c.link.startsWith('http') ? '_blank' : undefined}
                           rel={c.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                           dir={c.ltr ? 'ltr' : undefined}
                           className="text-white text-sm font-medium hover:text-gold-light
                                      transition-colors duration-200 break-words"
                           data-ar={c.value_ar} data-en={c.value_en}>
                          {c.value_ar}
                        </a>
                      ) : (
                        <p className="text-white text-sm font-medium"
                           dir={c.ltr ? 'ltr' : undefined}
                           data-ar={c.value_ar} data-en={c.value_en}>
                          {c.value_ar}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden h-52 shadow-card border border-gold/10">
              <iframe
                src={contact.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                title="موقع الشركة"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>

            {/* Google My Business CTA */}
            {contact.googleBusinessUrl && (
              <a href={contact.googleBusinessUrl}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 bg-white hover:bg-gold/5
                            border border-gold/30 hover:border-gold text-teal-dark hover:text-gold-dark
                            font-bold text-sm px-5 py-3 rounded-2xl transition-all duration-200
                            shadow-card hover:-translate-y-0.5"
                 data-ar="اطلع علينا على Google واترك تقييمك"
                 data-en="View us on Google & leave a review">
                <i className="fab fa-google text-gold text-base" />
                اطلع علينا على Google واترك تقييمك
              </a>
            )}
          </div>

          {/* ── Form ─── */}
          <div className="lg:col-span-3 reveal-left">
            <div className="bg-white rounded-3xl shadow-card-lg border border-gold/15 p-5 sm:p-8">

              {!success ? (
                <>
                  <div className="flex items-center gap-2 mb-6 pb-5 border-b border-gold/15">
                    <i className="fas fa-paper-plane text-gold text-xl" />
                    <h3 className="font-black text-teal-dark text-lg"
                        data-ar="أرسل لنا رسالة" data-en="Send Us a Message">
                      أرسل لنا رسالة
                    </h3>
                  </div>

                  <form onSubmit={onSubmit} noValidate className="space-y-4">
                    {/* Honeypot — hidden from humans, bots fill it */}
                    <input
                      type="text" name="hp" id="contact-hp" tabIndex={-1} autoComplete="off"
                      aria-hidden="true"
                      style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
                    />

                    {errorMsg && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                                      rounded-lg p-3 flex items-start gap-2">
                        <i className="fas fa-circle-exclamation mt-0.5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-teal-dark mb-1.5"
                             data-ar="الاسم الكامل *" data-en="Full Name *">الاسم الكامل *</label>
                      <input type="text" className={cls('name')}
                             placeholder="أدخل اسمك الكامل"
                             value={fields.name} onChange={e => set('name', e.target.value)} />
                      {errors.name && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="رقم الهاتف *" data-en="Phone *">رقم الهاتف *</label>
                        <input type="tel" className={cls('phone')}
                               placeholder="+966 5X XXX XXXX"
                               value={fields.phone} onChange={e => set('phone', e.target.value)} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-teal-dark mb-1.5"
                               data-ar="البريد الإلكتروني" data-en="Email">البريد الإلكتروني</label>
                        <input type="email" className="form-input"
                               placeholder="example@email.com"
                               value={fields.email} onChange={e => set('email', e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-teal-dark mb-1.5"
                             data-ar="الموضوع" data-en="Subject">الموضوع</label>
                      <select className="form-input" value={fields.subject}
                              onChange={e => set('subject', e.target.value)}>
                        <option value="">اختر الموضوع</option>
                        {subjects.map(s => (
                          <option key={s.ar} value={s.ar}
                                  data-ar={s.ar} data-en={s.en}>{s.ar}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-teal-dark mb-1.5"
                             data-ar="الرسالة *" data-en="Message *">الرسالة *</label>
                      <textarea className={`${cls('message')} min-h-[130px] resize-y`}
                                placeholder="اكتب رسالتك هنا..."
                                value={fields.message} onChange={e => set('message', e.target.value)} />
                      {errors.message && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
                    </div>

                    <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2
                                       bg-gold hover:bg-gold-light disabled:bg-gold/60
                                       text-white font-bold py-3.5 rounded-xl
                                       transition-all duration-300 hover:-translate-y-0.5
                                       shadow-gold hover:shadow-gold-lg">
                      {loading
                        ? <><i className="fas fa-spinner fa-spin" /> <span data-ar="جاري الإرسال..." data-en="Sending...">جاري الإرسال...</span></>
                        : <><i className="fas fa-paper-plane" /> <span data-ar="إرسال الرسالة" data-en="Send Message">إرسال الرسالة</span></>
                      }
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-14 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center
                                  justify-center mx-auto mb-6">
                    <i className="fas fa-check-circle text-green-500 text-4xl" />
                  </div>
                  <h4 className="text-xl font-black text-teal-dark mb-2"
                      data-ar="شكراً لتواصلكم معنا!" data-en="Thank you!">
                    شكراً لتواصلكم معنا!
                  </h4>
                  <p className="text-gray-500 text-sm"
                     data-ar="سيتواصل معكم فريقنا في أقرب وقت ممكن"
                     data-en="Our team will contact you as soon as possible">
                    سيتواصل معكم فريقنا في أقرب وقت ممكن
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

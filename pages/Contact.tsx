
import React from 'react';
import { useLanguage } from '../App';

const Contact: React.FC = () => {
  const { t, lang } = useLanguage();
  return (
    <div className="py-24 bg-[#f8f9fa] font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t.contact.title}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t.contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex items-start gap-6">
              <div className="w-16 h-16 bg-[#7B2CF6]/10 text-[#7B2CF6] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                <i className="fas fa-phone"></i>
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-black text-slate-900 mb-2">{t.contact.phone}</h3>
                <p className="text-slate-600 font-bold text-lg" dir="ltr">+213 696 43 97 71</p>
                <p className="text-slate-400 font-medium mt-1">{t.contact.hours}</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex items-start gap-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                <i className="fas fa-envelope"></i>
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-black text-slate-900 mb-2">{t.contact.email}</h3>
                <p className="text-slate-600 font-bold text-lg">contact@almuraqib.ai</p>
                <p className="text-slate-400 font-medium mt-1">{t.contact.replyTime}</p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex items-start gap-6">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-black text-slate-900 mb-2">{t.contact.address}</h3>
                <p className="text-slate-600 font-bold text-lg">{t.contact.addressVal}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-8">{t.contact.formTitle}</h3>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert(t.contact.successMsg); }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t.contact.nameLabel}</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7B2CF6] transition-all font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t.contact.phoneLabel}</label>
                  <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7B2CF6] transition-all font-bold" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t.contact.subjectLabel}</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7B2CF6] transition-all font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t.contact.messageLabel}</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 h-32 outline-none focus:ring-2 focus:ring-[#7B2CF6] transition-all font-bold resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-[#7B2CF6] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#6A0DAD] shadow-xl shadow-violet-500/20 transition-all">
                {t.contact.submitBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;


import React from 'react';
import { useLanguage } from '../App';

const Privacy: React.FC = () => {
  const { t, lang } = useLanguage();
  return (
    <div className="py-24 bg-white font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-black text-slate-900 mb-12 text-center">{t.privacy.title}</h1>
        
        <div className="space-y-12 text-lg text-slate-600 leading-relaxed font-medium">
          {t.privacy.sections.map((section: any, idx: number) => (
            <section key={idx} className={idx === 2 ? "bg-slate-50 p-8 rounded-[40px] border border-slate-100" : ""}>
              <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                <i className={`fas ${idx === 0 ? 'fa-shield-alt' : idx === 1 ? 'fa-microchip' : idx === 2 ? 'fa-hdd' : 'fa-user-lock'} text-[#7B2CF6]`}></i>
                {section.t}
              </h2>
              {section.d && <p>{section.d}</p>}
              {section.items && (
                <ul className={`list-disc ${lang === 'ar' ? 'pr-6' : 'pl-6'} space-y-3`}>
                  {section.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="text-center pt-12 border-t border-slate-100">
            <p className="text-sm text-slate-400">{t.privacy.lastUpdate}</p>
            <p className="text-sm text-slate-400 mt-2">{t.privacy.contactPrivacy}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

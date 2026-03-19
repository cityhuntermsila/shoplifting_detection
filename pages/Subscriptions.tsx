
import React from 'react';
import { useLanguage } from '../App';

const Subscriptions: React.FC = () => {
  const { t, lang } = useLanguage();
  const plans = [
    { id: 'FREE', ...t.subscriptions.plans.free },
    { id: 'PREMIUM', ...t.subscriptions.plans.premium, highlighted: true },
    { id: 'ENTERPRISE', ...t.subscriptions.plans.enterprise }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t.subscriptions.title}</h1>
        <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg">
          {t.subscriptions.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`rounded-[40px] p-10 border transition-all ${
              plan.highlighted 
                ? 'bg-slate-900 text-white border-[#7B2CF6] shadow-2xl scale-105 relative z-10' 
                : 'bg-white text-slate-900 border-slate-200 shadow-lg'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#7B2CF6] text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">
                {t.subscriptions.mostPopular}
              </div>
            )}
            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.id !== 'ENTERPRISE' && <span className={`text-sm mx-2 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{t.subscriptions.monthly}</span>}
            </div>
            <p className={`text-sm mb-8 font-medium leading-relaxed ${plan.highlighted ? 'text-slate-400' : 'text-slate-600'}`}>
              {plan.desc}
            </p>
            <ul className="space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-bold">
                  <i className={`fas ${feature.startsWith('✕') ? 'fa-times text-red-500' : 'fa-check text-green-500'} mt-1`}></i>
                  <span>{feature.replace('✕ ', '')}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-4 rounded-2xl font-black transition-all ${
              plan.highlighted 
                ? 'bg-[#7B2CF6] hover:bg-[#6A0DAD] text-white shadow-xl shadow-violet-600/30' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 bg-slate-900 rounded-[50px] p-12 lg:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B2CF6]/10 blur-3xl rounded-full"></div>
        <h2 className="text-3xl font-black mb-6 relative z-10">{t.subscriptions.consultTitle}</h2>
        <p className="text-slate-400 mb-10 max-w-2xl mx-auto font-medium text-lg relative z-10">
          {t.subscriptions.consultDesc}
        </p>
        <button className="px-12 py-5 bg-white text-slate-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl relative z-10">
          {t.subscriptions.consultBtn}
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;

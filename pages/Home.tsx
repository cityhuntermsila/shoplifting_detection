
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../App';

const Home: React.FC = () => {
  const { t, lang } = useLanguage();

  const keyFeatures = [
    {
      img: "images/cam1.jpg",
      title: t.keyFeatures.f1.t,
      desc: t.keyFeatures.f1.d
    },
    {
      img: "images/dashboard.jpeg",
      title: t.keyFeatures.f2.t,
      desc: t.keyFeatures.f2.d
    },
    {
      img: "images/alert.jpg",
      title: t.keyFeatures.f3.t,
      desc: t.keyFeatures.f3.d
    },
    {
      img: "images/feature-mobile.jpeg",
      title: t.keyFeatures.f4.t,
      desc: t.keyFeatures.f4.d
    },
    {
      img: "images/config.jpg",
      title: t.keyFeatures.f5.t,
      desc: t.keyFeatures.f5.d
    },
    {
      img: "images/feature-privacy.jpg",
      title: t.keyFeatures.f6.t,
      desc: t.keyFeatures.f6.d
    }
  ];

  return (
    <div className="overflow-hidden font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative bg-white text-slate-900 pt-14 pb-12 md:pt-20 md:pb-20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_#7B2CF622_0%,_transparent_50%)]"></div>
        </div>

        {/* Decorative Hero Images - No transparency, reduced size */}
        <div className="absolute left-4 top-10 hidden lg:block w-[270px] h-[270px] rotate-[-8deg] pointer-events-none z-0 px-2">
          <img src="images/monitor.jpg" className="w-full h-full object-cover rounded-[48px] border-[10px] border-white shadow-2xl" alt="" />
        </div>
        <div className="absolute right-4 top-10 hidden lg:block w-[270px] h-[270px] rotate-[8deg] pointer-events-none z-0 px-2">
          <img src="images/hero.jpeg" className="w-full h-full object-cover rounded-[48px] border-[10px] border-white shadow-2xl" alt="" />
        </div>

        <div className="max-w-2xl mx-auto px-4 relative z-10 text-center">
          <span className="inline-block px-4 py-1 bg-red-600 text-white rounded-full text-[10px] font-black mb-2 md:mb-2 uppercase tracking-widest shadow-lg shadow-red-200">
            {t.hero.tag}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-2 md:mb-3 tracking-tighter text-red-600">
            {t.hero.title}
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-2xl font-black mb-6 md:mb-10 text-slate-900 max-w-4xl mx-auto leading-tight">
            {t.hero.titleAccent}
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.hero.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/demo" className="px-8 py-4 md:px-12 md:py-5 bg-[#7B2CF6] hover:bg-[#8B5CF6] text-white rounded-3xl font-black text-lg md:text-xl transition-all shadow-2xl shadow-violet-200 hover:-translate-y-1">
              {t.hero.ctaDemo}
            </Link>
            <Link to="/subscriptions" className="px-8 py-4 md:px-12 md:py-5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-3xl font-black text-lg md:text-2xl transition-all">
              {t.hero.ctaPricing}
            </Link>
          </div>

          <div className="mt-14 relative max-w-xl mx-auto">
            <div className="bg-[#100821] rounded-[40px] p-3 shadow-3xl border-[8px] border-slate-50 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
              <img
                src="images/hero.jpg"
                alt="AI Surveillance"
                className="w-full rounded-[32px] opacity-80"
              />
            </div>
            <div className={`absolute -top-8 -right-6 bg-red-600 text-white p-4 rounded-[24px] shadow-2xl hidden lg:block animate-bounce-slow`}>
              <i className="fas fa-shield-check text-4xl mb-2"></i>
              <p className="font-black text-2xl">{lang === 'ar' ? 'حماية فورية' : 'Instant Guard'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="pt-14 pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-4">{t.keyFeatures.title}</h2>
            <div className="w-24 h-2 bg-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {keyFeatures.map((feature, i) => (
              <div key={i} className="bg-white rounded-[40px] p-8 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.08)] border border-slate-50 flex flex-col items-center text-center hover:translate-y-[-10px] transition-all duration-500 group">
                <div className="w-full aspect-video rounded-3xl overflow-hidden mb-8 shadow-inner bg-slate-50">
                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-snug">{feature.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed px-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

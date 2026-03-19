
import React from 'react';
import { useLanguage } from '../App';

const About: React.FC = () => {
  const { t, lang } = useLanguage();
  const teamImages = [
    "https://ui-avatars.com/api/?name=Imad+Eddine&background=7B2CF6&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Maryem&background=7B2CF6&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Mustafa&background=7B2CF6&color=fff&size=200",
    "https://ui-avatars.com/api/?name=Mufdi&background=7B2CF6&color=fff&size=200"
  ];

  return (
    <div className="bg-white font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-[#f8f4ff] to-[#f0e8ff]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
            {t.about.hero.split(' ').map((word: string, i: number) => i > 3 ? <span key={i} className="text-[#7B2CF6]"> {word}</span> : word + ' ')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {t.about.heroDesc}
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <h2 className="text-3xl font-black text-slate-900 mb-8">{t.about.visionTitle}</h2>
            <div className="space-y-6">
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {t.about.vision1}
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {t.about.vision2}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-[#7B2CF6]/10 blur-3xl rounded-full"></div>
            <img src="images/secure.jpg" className="relative rounded-[40px] shadow-2xl border-8 border-white" alt="Retail Safety" />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-16 text-slate-900">{t.about.teamTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.about.team.map((member: any, i: number) => (
              <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm text-center border border-slate-100 hover:shadow-xl transition-all group">
                <img src={teamImages[i]} className="w-40 h-40 rounded-full mx-auto mb-8 border-4 border-slate-50 group-hover:scale-105 transition-transform" alt={member.name} />
                <h3 className="text-2xl font-black mb-2 text-slate-900">{member.name}</h3>
                <p className="text-[#7B2CF6] font-bold mb-4">{member.role}</p>
                <p className="text-slate-500 font-medium leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

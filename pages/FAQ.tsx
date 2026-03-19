
import React, { useState } from 'react';
import { useLanguage } from '../App';

const FAQItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full"
      >
        <span className="text-xl font-bold text-slate-900">{question}</span>
        <i className={`fas ${isOpen ? 'fa-minus' : 'fa-plus'} text-[#7B2CF6] transition-transform`}></i>
      </button>
      {isOpen && (
        <div className="mt-4 text-slate-600 leading-relaxed text-lg">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const { t, lang } = useLanguage();
  return (
    <div className="py-24 bg-white font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t.faq.title}</h1>
          <p className="text-xl text-slate-600">{t.faq.subtitle}</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          {t.faq.items.map((faq: any, index: number) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </div>
        
        <div className="mt-16 bg-[#7B2CF6]/5 rounded-3xl p-12 text-center border border-[#7B2CF6]/10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t.faq.moreQuestions}</h2>
          <p className="text-slate-600 mb-8 font-medium">{t.faq.moreQuestionsDesc}</p>
          <a href="/#/contact" className="inline-block px-10 py-4 bg-[#7B2CF6] text-white rounded-full font-black text-lg shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform">{t.faq.contactBtn}</a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

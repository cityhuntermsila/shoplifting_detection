
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Demo from './pages/Demo';
import Subscriptions from './pages/Subscriptions';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import UserManagement from './pages/UserManagement';
import { Language } from './types';
import { translations } from './i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/about', label: t.nav.about },
    { path: '/subscriptions', label: t.nav.pricing },
    { path: '/faq', label: t.nav.faq },
    { path: '/contact', label: t.nav.contact },
    { path: '/demo', label: t.nav.demo },
  ];

  return (
    <nav className="bg-white sticky top-0 z-[100] border-b border-slate-200 shadow-sm font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button 
                onClick={() => setLang('ar')} 
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'ar' ? 'bg-white text-[#7B2CF6] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >AR</button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-[#7B2CF6] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >EN</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#7B2CF6] p-1.5 md:p-2 rounded-xl shadow-lg shadow-violet-200">
                <i className="fas fa-eye text-lg md:text-xl text-white"></i>
              </div>
              <Link to="/" onClick={closeMenu} className="text-lg md:text-2xl font-black tracking-tight text-slate-900">{t.brand}</Link>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-8">
            <div className={`flex items-center gap-6 ${lang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-base font-bold transition-colors ${isActive(link.path) ? 'text-[#7B2CF6]' : 'text-slate-600 hover:text-[#7B2CF6]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            

          </div>

          <div className="flex items-center gap-4">
             <Link to="/demo" onClick={closeMenu} className="hidden sm:inline-block px-6 py-2.5 bg-[#7B2CF6] text-white rounded-full font-bold hover:bg-[#6A0DAD] transition-all shadow-md shadow-violet-100">{t.nav.dashboard}</Link>
             <button onClick={toggleMenu} className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
               <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
             </button>
          </div>
        </div>
      </div>

      <div className={`xl:hidden fixed inset-0 top-20 bg-white z-[90] transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="flex flex-col p-6 space-y-2 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={closeMenu} className={`text-xl font-black py-4 px-4 rounded-xl border-b border-slate-50 transition-all ${isActive(link.path) ? 'bg-violet-50 text-[#7B2CF6]' : 'text-slate-900 hover:bg-slate-50'}`}>
              {link.label}
            </Link>
          ))}

          <div className="pt-6 px-4">
            <Link to="/demo" onClick={closeMenu} className="w-full inline-block text-center py-4 bg-[#7B2CF6] text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-200">{t.nav.dashboard}</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </LanguageContext.Provider>
  );
};

export default App;

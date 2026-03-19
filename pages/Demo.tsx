import React, { useState, useRef, useEffect } from 'react';
import { analyzeFrames, QuotaError } from '../services/geminiService';
import { DetectionResult, RiskLevel, Suspect } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../App';

const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#100821]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-violet-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <i className="fas fa-lock text-4xl"></i>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-4">{lang === 'ar' ? 'ميزة البث المباشر' : 'Live Stream Feature'}</h3>
        <p className="text-slate-600 mb-10 font-bold leading-relaxed text-lg">
          {lang === 'ar'
            ? 'عذراً، الوصول المباشر لكاميرات المراقبة الحية هو خيار متاح بعد الاشتراك في الباقة المميزة.'
            : 'Sorry, direct access to live security cameras is a premium option available after subscription.'}
        </p>
        <div className="flex flex-col gap-4">
          <Link to="/subscriptions" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-lg">
            {t.hero.ctaPricing}
          </Link>
          <button onClick={onClose} className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black">
            {lang === 'ar' ? 'ربما لاحقاً' : 'Maybe later'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Demo: React.FC = () => {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'surveillance' | 'alerts' | 'statistics' | 'settings'>('surveillance');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, msg: string, type: RiskLevel | 'ERROR' }[]>([]);
  const [currentPeople, setCurrentPeople] = useState<Suspect[]>([]);
  const [alertsHistory, setAlertsHistory] = useState<DetectionResult[]>([]);
  const detectionStageRef = useRef<0 | 1 | 2>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US'));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = (msg: string, type: RiskLevel | 'ERROR') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 8000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
      setIsAnalyzing(false);
      setCurrentPeople([]);
      setAlertsHistory([]);
      detectionStageRef.current = 0;
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const captureAndAnalyze = async (isInitial = false) => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) return;
    if (!isInitial && (videoRef.current.paused || videoRef.current.ended)) {
      if (isAnalyzing) setIsAnalyzing(false);
      return;
    }

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const frames: string[] = [];
        const numFrames = isInitial ? 1 : 4;
        const interval = 100;

        for (let i = 0; i < numFrames; i++) {
          if (!isInitial && videoRef.current.paused) break;
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', isInitial ? 0.95 : 0.85));
          if (i < numFrames - 1) await new Promise(resolve => setTimeout(resolve, interval));
        }

        if (frames.length === 0) return;

        const result = await analyzeFrames(frames, lang);

        if (result.suspects && result.suspects.length > 0) {
          const suspect = result.suspects.find(s => s.riskLevel === 'HIGH' || s.riskLevel === 'MEDIUM') || result.suspects[0];
          if (suspect && suspect.box) {
            const cropFrame = (frameDataUrl: string) => {
              return new Promise<string>((resolve) => {
                const img = new Image();
                img.onload = () => {
                  const cropCanvas = document.createElement('canvas');
                  const { ymin, xmin, ymax, xmax } = suspect.box;
                  const sy = (ymin / 1000) * img.height;
                  const sx = (xmin / 1000) * img.width;
                  const sh = ((ymax - ymin) / 1000) * img.height;
                  const sw = ((xmax - xmin) / 1000) * img.width;

                  const padX = sw * 0.8;
                  const padY = sh * 0.8;
                  const finalSx = Math.max(0, sx - padX);
                  const finalSy = Math.max(0, sy - padY);
                  const finalSw = Math.min(img.width - finalSx, sw + padX * 2);
                  const finalSh = Math.min(img.height - finalSy, sh + padY * 2);

                  cropCanvas.width = finalSw;
                  cropCanvas.height = finalSh;
                  const ctx = cropCanvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, finalSx, finalSy, finalSw, finalSh, 0, 0, finalSw, finalSh);
                    resolve(cropCanvas.toDataURL('image/jpeg', 0.9));
                  } else {
                    resolve(frameDataUrl);
                  }
                };
                img.src = frameDataUrl;
              });
            };
            if (frames.length >= 1) {
              const p1 = await cropFrame(frames[frames.length - 1]);
              result.suspectPhotos = [p1];
            }
          }
        }

        if (result.suspects) {
          setCurrentPeople(result.suspects.filter(s => s && s.box));
        }

        let isFirstDetection = false;
        let isSecondDetection = false;
        
        if (detectionStageRef.current === 0 && result.suspects && result.suspects.some(s => s.riskLevel === 'MEDIUM' || s.riskLevel === 'HIGH' || result.isTheft)) {
          detectionStageRef.current = 1;
          isFirstDetection = true;
        }

        if (detectionStageRef.current === 1 && (result.isTheft || result.riskLevel === 'HIGH')) {
          detectionStageRef.current = 2;
          isSecondDetection = true;
        }

        if (isFirstDetection) {
          const reason1 = lang === 'ar' ? 'اكتشاف مشتبه به (Détection de suspect)' : 'Détection de suspect';
          addToast(reason1, 'MEDIUM');
          setAlertsHistory(prev => [{ ...result, reason: reason1, riskLevel: 'MEDIUM' }, ...prev]);
        }

        if (isSecondDetection) {
          const reason2 = lang === 'ar' ? 'حركة مشبوهة (Geste du suspect)' : 'Geste du suspect';
          
          setTimeout(() => {
            addToast(reason2, 'HIGH');
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => { });
            setAlertsHistory(prev => [{ ...result, reason: reason2, riskLevel: 'HIGH' }, ...prev]);
            
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.pause();
              }
              setIsAnalyzing(false);
            }, 800);
          }, isFirstDetection ? 1200 : 0);
        }
      } else {
        // This 'else' block corresponds to 'if (context)'
        addToast(lang === 'ar' ? "حدث خطأ في الاتصال بالخدمة الذكية." : "Connection error with smart service.", 'ERROR');
      }
    } catch (err: any) {
      console.error("Analysis Loop Error:", err);
      if (err instanceof QuotaError) {
        addToast(err.message, 'ERROR');
      } else {
        addToast(lang === 'ar' ? 'حدث خطأ في الاتصال بالذكاء الاصطناعي' : 'Error connecting to AI', 'ERROR');
      }
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const handleMetadata = () => captureAndAnalyze(true);
      videoRef.current.addEventListener('loadedmetadata', handleMetadata);
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => { });
      }, 1000);
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleMetadata);
        clearTimeout(timer);
      };
    }
  }, [videoUrl]);

  useEffect(() => {
    let interval: number;
    if (isAnalyzing && videoUrl) { interval = window.setInterval(captureAndAnalyze, 500); }
    else { setCurrentPeople([]); }
    return () => clearInterval(interval);
  }, [isAnalyzing, videoUrl, lang]);

  const getRiskColor = (level?: RiskLevel | 'ERROR') => {
    switch (level) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-blue-500';
      case 'ERROR': return 'bg-slate-900';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FE] overflow-hidden font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} />

      <div className={`fixed top-24 left-4 right-4 md:left-auto md:right-auto ${lang === 'ar' ? 'md:left-8' : 'md:right-8'} z-[300] flex flex-col gap-4 pointer-events-none md:w-full md:max-w-sm`}>
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto bg-white border-${lang === 'ar' ? 'r' : 'l'}-8 ${toast.type === 'HIGH' ? 'border-red-600 shadow-red-200' : toast.type === 'ERROR' ? 'border-black shadow-slate-200' : 'border-amber-500 shadow-amber-100'} shadow-2xl rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-${lang === 'ar' ? 'left' : 'right'} duration-500`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'HIGH' ? 'bg-red-50 text-red-600' : toast.type === 'ERROR' ? 'bg-slate-900 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <i className={`fas ${toast.type === 'HIGH' ? 'fa-exclamation-circle' : toast.type === 'ERROR' ? 'fa-bolt' : 'fa-user-secret'} text-xl`}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 mb-0.5 text-sm">
                {toast.type === 'HIGH' ? (lang === 'ar' ? 'تنبيه أمني عاجل' : 'Urgent Security Alert') :
                  toast.type === 'ERROR' ? (lang === 'ar' ? 'خطأ في النظام' : 'System Error') :
                    (lang === 'ar' ? 'نشاط مشبوه مرصود' : 'Suspicious Activity Detected')}
              </h4>
              <p className="text-xs text-slate-600 font-bold leading-tight">{toast.msg}</p>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-300 hover:text-slate-600"><i className="fas fa-times"></i></button>
          </div>
        ))}
      </div>

      <aside className="w-80 bg-[#100821] shadow-2xl flex flex-col hidden lg:flex z-20">
        <div className="p-6 border-b border-white/5 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-600 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-red-900/40 transform hover:rotate-6 transition-transform">
              <i className="fas fa-eye text-3xl"></i>
            </div>
            <div>
              <span className="text-2xl font-black block text-white tracking-wider">{t.brand}</span>
              <span className="text-[10px] text-red-400 font-black tracking-[0.2em] mt-1 block uppercase">AI SURVEILLANCE</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-6 py-10 space-y-4">
          {[
            { id: 'surveillance', label: t.demo.surveillance, icon: 'fa-video' },
            { id: 'alerts', label: t.demo.alerts, icon: 'fa-history', badge: alertsHistory.length },
            { id: 'statistics', label: t.demo.statistics, icon: 'fa-chart-pie' },
            { id: 'users', label: t.demo.staff, icon: 'fa-users' },
            { id: 'settings', label: t.demo.settings, icon: 'fa-sliders-h' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => item.id === 'users' ? navigate('/users') : setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-5 px-6 py-5 rounded-[24px] font-black transition-all duration-300 group ${activeTab === item.id ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <i className={`fas ${item.icon} w-6 text-xl group-hover:scale-110 transition-transform`}></i>
              <span className="text-sm">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`mr-auto px-3 py-1 rounded-full text-[10px] font-black ${activeTab === item.id ? 'bg-white text-red-600' : 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md px-10 py-4 flex items-center justify-between border-b border-slate-100 z-10">
          <div className="flex items-center gap-10">
            <div className="px-6 py-3 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4">
              <i className="fas fa-clock text-red-600"></i>
              <span className="font-mono font-black text-red-600 text-sm">{currentTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`relative flex h-3 w-3 ${isAnalyzing ? 'opacity-100' : 'opacity-0'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{isAnalyzing ? t.demo.activeAnalysis : (lang === 'ar' ? 'خامل' : 'IDLE')}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'surveillance' && (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 items-center">
                  <div className="w-full text-center lg:text-right">
                    <h1 className="text-3xl font-black text-slate-900 mb-1">{t.demo.surveillance}</h1>
                    <p className="text-slate-400 font-bold text-xs mb-6">{lang === 'ar' ? 'تتبع الأشخاص والتعرف الذكي على السلوك' : 'Person Tracking & Behavioral Identification'}</p>
                  </div>

                  <div className="bg-[#100821] rounded-[30px] p-4 shadow-3xl border-4 border-white relative overflow-hidden w-full max-w-md transform transition-all duration-500 min-h-[250px] flex items-center justify-center">
                    {videoUrl ? (
                      <div className="relative inline-block mx-auto group">
                        <video
                          ref={videoRef}
                          src={videoUrl}
                          className="max-h-[40vh] w-auto rounded-[15px] opacity-90 shadow-2xl"
                          controls
                          onPlay={() => setIsAnalyzing(true)}
                          onPause={() => setIsAnalyzing(false)}
                          onEnded={() => setIsAnalyzing(false)}
                        />
                        <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <button
                            onClick={triggerFileUpload}
                            className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl text-slate-800 hover:bg-red-600 hover:text-white shadow-2xl transition-all flex items-center gap-3 font-black text-xs"
                          >
                            <i className="fas fa-plus-circle"></i>
                            {lang === 'ar' ? 'تحميل جديد' : 'Upload New'}
                          </button>
                        </div>
                        {isAnalyzing && (
                          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[20px]">
                            <div className="w-full h-1 bg-red-600/30 absolute top-0 animate-[scan_4s_linear_infinite] shadow-[0_0_20px_red]"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center p-8">
                        <div className="text-center cursor-pointer group flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl w-full border border-white/10 hover:border-red-500/50 transition-all mb-6" onClick={triggerFileUpload}>
                          <div className="w-20 h-20 bg-red-600/20 text-red-600 rounded-[28px] flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xl shadow-red-900/20">
                            <i className="fas fa-video text-3xl"></i>
                          </div>
                          <h3 className="text-white text-xl font-black mb-2">{lang === 'ar' ? 'توصيل الكاميرا الذكية' : 'Connect Smart Camera'}</h3>
                          <p className="text-red-200/40 font-bold text-[10px] mb-6 max-w-xs">{lang === 'ar' ? 'قم برفع ملف فيديو لبدء تحليل التهديدات والتعرف على السلوك عبر الذكاء الاصطناعي' : 'Upload a video file to start AI-powered theft detection and behavioral analysis'}</p>
                          <div className="px-6 py-3 bg-red-600 text-white rounded-xl font-black text-xs shadow-lg shadow-red-900/40 group-hover:bg-red-700 active:scale-95 transition-all">
                            <i className="fas fa-plus-circle ml-2 ltr:mr-2"></i>
                            {lang === 'ar' ? 'تحميل ملف فيديو' : 'Load Video File'}
                          </div>
                        </div>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
                  </div>

                  <div className="flex flex-col gap-4 w-full max-w-2xl px-4 mt-2">
                    <div className="flex flex-wrap items-center justify-between w-full gap-4">
                      <div className="flex gap-2 items-center">
                        <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-red-600 animate-pulse' : 'bg-slate-400'}`}></div>
                        <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase font-mono">{lang === 'ar' ? 'تحليل التهديدات' : 'THEFT_SCAN'}: {isAnalyzing ? 'ACTIVE' : 'IDLE'}</span>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); setVideoUrl('/video1.mp4'); setIsAnalyzing(false); setCurrentPeople([]); setAlertsHistory([]); detectionStageRef.current = 0; }}
                          className={`px-4 py-2 rounded-xl font-black text-[10px] shadow-sm transition-all flex items-center gap-2 ${videoUrl === '/video1.mp4' ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-600 border border-slate-100 hover:border-red-200'}`}
                        >
                          <i className="fas fa-play"></i>
                          {lang === 'ar' ? 'نموذج 1' : 'Example 1'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setVideoUrl('/video2.mp4'); setIsAnalyzing(false); setCurrentPeople([]); setAlertsHistory([]); detectionStageRef.current = 0; }}
                          className={`px-4 py-2 rounded-xl font-black text-[10px] shadow-sm transition-all flex items-center gap-2 ${videoUrl === '/video2.mp4' ? 'bg-red-600 text-white shadow-red-200' : 'bg-white text-slate-600 border border-slate-100 hover:border-red-200'}`}
                        >
                          <i className="fas fa-play"></i>
                          {lang === 'ar' ? 'نموذج 2' : 'Example 2'}
                        </button>
                        <button
                          onClick={triggerFileUpload}
                          className="px-4 py-2 bg-[#100821] text-white rounded-xl text-[10px] font-black shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 hover:bg-red-600 hover:shadow-red-900/40"
                        >
                          <i className="fas fa-upload"></i>
                          {lang === 'ar' ? 'تحميل فيديو' : 'Upload Video'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 h-full">
                  <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col h-[650px]">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-t-[40px]">
                      <h3 className="font-black text-slate-900 text-sm">{t.demo.activityFeed}</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-red-600 font-mono tracking-tighter">AI_TRACKER</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {alertsHistory.length === 0 ? (
                        <div className="text-center py-20 opacity-20">
                          <i className="fas fa-satellite-dish text-5xl mb-4 text-red-600"></i>
                          <p className="font-black text-xs uppercase tracking-widest">Scanning network...</p>
                        </div>
                      ) : (
                        alertsHistory.map((res, i) => (
                          <div
                            key={i}
                            className={`p-5 rounded-[28px] bg-white border border-slate-100 hover:border-red-200 transition-all transform hover:-translate-y-1 shadow-sm relative overflow-hidden group ${res.riskLevel === 'HIGH' ? 'border-red-200 bg-red-50/20' : ''}`}
                          >
                            {i === 0 && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                            )}
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black text-slate-400 font-mono">{res.timestamp}</span>
                              <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black text-white ${getRiskColor(res.riskLevel)} shadow-sm uppercase`}>{res.riskLevel}</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight mb-2">{res.reason}</p>
                            {((res.suspectPhotos && res.suspectPhotos.length > 0) || res.screenshot) && (
                              <div className="mt-3">
                                <div className="w-full rounded-2xl overflow-hidden border border-slate-200 h-[210px] relative shadow-inner bg-slate-100 flex items-center justify-center group/img">
                                  <img
                                    src={(res.suspectPhotos && res.suspectPhotos.length > 0) ? res.suspectPhotos[0] : res.screenshot}
                                    className="w-full h-full object-contain transition-transform duration-500 hover:scale-105 bg-black/5"
                                    alt="Incident Snapshot"
                                  />
                                  <a
                                    href={(res.suspectPhotos && res.suspectPhotos.length > 0) ? res.suspectPhotos[0] : res.screenshot}
                                    download={`incident_${res.timestamp.replace(/:/g, '-')}.jpg`}
                                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl text-slate-800 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-2xl flex items-center gap-3 font-black text-xs"
                                  >
                                    <i className="fas fa-download"></i>
                                    {lang === 'ar' ? 'تحميل' : 'Download'}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <h1 className="text-4xl font-black text-slate-900">{t.demo.alerts}</h1>
                <div className="bg-white rounded-[50px] shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
                        <th className="p-6">{lang === 'ar' ? 'الوقت' : 'Time'}</th>
                        <th className="p-6">{lang === 'ar' ? 'الحدث' : 'Event'}</th>
                        <th className="p-6">{lang === 'ar' ? 'المستوى' : 'Level'}</th>
                        <th className="p-6">{lang === 'ar' ? 'الدقة' : 'Conf.'}</th>
                        <th className="p-6">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {alertsHistory.map((alert, i) => (
                        <tr key={i} className="hover:bg-red-50/20 transition-colors group">
                          <td className="p-6 font-mono font-bold text-slate-400 text-xs">{alert.timestamp}</td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              {((alert.suspectPhotos && alert.suspectPhotos.length > 0) || alert.screenshot) && (
                                <img src={(alert.suspectPhotos && alert.suspectPhotos.length > 0) ? alert.suspectPhotos[0] : alert.screenshot} className="w-10 h-10 rounded-lg object-cover shadow-sm grayscale" />
                              )}
                              <p className="text-xs font-black text-slate-800">{alert.reason}</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black text-white ${getRiskColor(alert.riskLevel)} shadow-sm`}>{alert.riskLevel}</span>
                          </td>
                          <td className="p-6 font-black text-red-600 text-xs">{(alert.confidence * 100).toFixed(0)}%</td>
                          <td className="p-6">
                            <button className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all"><i className="fas fa-eye text-xs"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'statistics' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex justify-between items-end">
                  <h1 className="text-4xl font-black text-slate-900">{t.demo.statistics}</h1>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[50px] shadow-sm border border-slate-100 col-span-2">
                    <h3 className="font-black text-slate-900 mb-10">{lang === 'ar' ? 'نشاط حماية الأرباح الأسبوعي' : 'Weekly Profit Protection Activity'}</h3>
                    <div className="flex items-end justify-between h-48 gap-4 px-4">
                      {[45, 80, 55, 90, 40, 70, 60].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="w-full bg-red-50 rounded-t-xl relative overflow-hidden transition-all group-hover:bg-red-600" style={{ height: `${h}%` }}></div>
                          <span className="text-[10px] font-black text-slate-400">Day {i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#100821] p-10 rounded-[50px] shadow-2xl text-white">
                    <h3 className="font-black mb-8">{lang === 'ar' ? 'تحليل المخاطر' : 'Risk Analysis'}</h3>
                    <div className="space-y-6">
                      {[
                        { label: 'High Risk', val: 12, color: 'bg-red-600' },
                        { label: 'Medium Risk', val: 45, color: 'bg-amber-500' },
                        { label: 'Low Suspicion', val: 88, color: 'bg-blue-600' }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black">
                            <span className="text-slate-400">{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${(item.val / 145) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Demo;

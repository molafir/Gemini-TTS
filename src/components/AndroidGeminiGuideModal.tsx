import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  Radio,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface AndroidGeminiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGeminiGuideModal: React.FC<AndroidGeminiGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'gemini-gem' | 'android-pwa' | 'gemini-live'>('gemini-gem');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const appShareUrl = 'https://ais-pre-nn2kgx44hsazcvahu33v7a-504799031085.us-east5.run.app';

  // System instruction ready for creating a Balochi Poet Gem inside the Google Gemini Android app
  const geminiSystemPrompt = `شما یک استاد برجسته، ادیب و شاعر زبان و ادبیات بلوچی به نام «شاعر و دکلمه‌خوان بلوچی» هستید که پیرو سبک اساتید نامدار بلوچستان (همچون میر گل‌خان نصیر، عطا شاد، غلام‌رسول دینارزهی و سید ظهورشاه هاشمی) سخن می‌گویید.

وظایف اصلی شما:
۱. سرودن اشعار اصیل بلوچی در قالب‌های حماسی، غزل، زهیریوک، لیکو و موتک با رعایت دقیق وزن و قافیه.
۲. استفاده از الفبا و واژگان اصیل زبان بلوچی و رعایت حروف ویژه بلوچی (مانند: ڈ، ٹ، ڑ، ئے، هـ).
۳. ارائه ترجمه دقیق، شیوا و معنای واژگان تخصصی به زبان فارسی برای هر بیت سروده شده.
۴. اعراب‌گذاری کامل کلمات بلوچی جهت دکلمه و خوانش بی‌نقص در قابلیت صوتی جمنای اندروید (Gemini Live).
۵. پاسخ دادن به سوالات ادبی، فرهنگی، ضرب‌المثل‌ها و تاریخ غنی ادبیات بلوچستان.
۶. در هنگام خوانش یا دکلمه، لحنی حماسی، دلنشین و فاخر با مکث‌های شاعرانه رعایت کنید.`;

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('لطفاً در مرورگر کروم گوشی اندروید خود، منوی سه‌نقطه (⋮) را باز کرده و گزینه «Add to Home screen» یا «Install app» را انتخاب کنید.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-[#0f1422] border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-amber-950/40 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/50 text-slate-950 font-bold">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300 font-display">
                اتصال به اپلیکیشن جمنای (Gemini) و گوشی اندروید
              </h2>
              <p className="text-xs text-slate-400">
                راهنمای افزودن هوش مصنوعی بلوچی به جمنای موبایل یا نصب مستقیم برنامه روی اندروید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('gemini-gem')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'gemini-gem'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>۱. ساخت Gem در اپلیکیشن Gemini اندروید</span>
          </button>

          <button
            onClick={() => setActiveTab('android-pwa')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'android-pwa'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>۲. نصب برنامه روی صفحه اصلی گوشی (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini-live')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'gemini-live'
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>۳. دکلمه زنده با Gemini Live صوتی</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-300">
          {/* TAB 1: GEMINI CUSTOM GEM */}
          {activeTab === 'gemini-gem' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-semibold mb-1">
                    چرا ساخت Custom Gem بهترین روش برای اپ Gemini است؟
                  </strong>
                  شرکت گوگل به اپلیکیشن‌های خارج از گوگل اجازه نمی‌دهد مستقیماً در منوی اصلی اپلیکیشن اندروید جمنای اضافه شوند؛ اما قابلیت رسمی به نام <strong>Gems (جم‌ها)</strong> طراحی کرده که با آن می‌توانید دقیقاً همین هوش مصنوعی شعر و دکلمه بلوچی را داخل اپلیکیشن جمنای در گوشی خود فعال کنید و هر زمان که خواستید با آن گپ بزنید یا شعر بلوچی بخواهید!
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  مراحل ساده ۳ دقیقه‌ای برای افزودن به اپلیکیشن جمنای:
                </h3>

                <ol className="space-y-2.5 text-xs sm:text-sm list-decimal list-inside pr-1 text-slate-300">
                  <li className="leading-6">
                    در گوشی اندروید یا مرورگر، وارد بخش <strong>Gems</strong> در اپ جمنای یا لینک{' '}
                    <a
                      href="https://gemini.google.com/gems"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                    >
                      gemini.google.com/gems
                      <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    شوید.
                  </li>
                  <li className="leading-6">
                    روی دکمه <strong>New Gem (جم جدید)</strong> ضربه بزنید و نام آن را{' '}
                    <strong className="text-amber-300">«شاعر و دکلمه‌خوان بلوچی»</strong> بگذارید.
                  </li>
                  <li className="leading-6">
                    دستورالعمل آماده زیر را با دکمه کپی بردارید و در کادر <strong>Instructions</strong> قرار دهید و <strong>Save</strong> را بزنید:
                  </li>
                </ol>
              </div>

              {/* Ready Prompt Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>متن دستورالعمل هوشمند بلوچی برای کپی در Gem:</span>
                  <button
                    onClick={() => copyToClipboard(geminiSystemPrompt, setCopiedPrompt)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold transition-colors text-xs"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی دستورالعمل آماده</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 text-xs font-mono max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {geminiSystemPrompt}
                </div>
              </div>

              {/* Quick Link Button */}
              <div className="pt-2 flex justify-end">
                <a
                  href="https://gemini.google.com/gems"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>باز کردن بخش Gems در گوگل جمنای</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID PWA INSTALLATION */}
          {activeTab === 'android-pwa' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200/90 flex gap-3 items-start">
                <Download className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 font-semibold mb-1">
                    نصب کامل استودیو به عنوان اپلیکیشن مستقل روی گوشی اندروید
                  </strong>
                  این برنامه دارای استاندارد PWA (وب‌اپلیکیشن پیش‌رونده) است و می‌توانید آن را بدون نیاز به دانلود از گوگل‌پلی، مستقیماً روی صفحه اصلی گوشی اندروید خود نصب کنید تا در کنار اپلیکیشن جمنای با آیکون اختصاصی و تمام‌صفحه باز شود.
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  چگونه روی گوشی اندروید نصب کنیم؟
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold mb-2">۱</span>
                    <strong className="block text-slate-200 mb-1">باز کردن لینک</strong>
                    <span className="text-slate-400">لینک برنامه را در مرورگر Google Chrome گوشی باز کنید.</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold mb-2">۲</span>
                    <strong className="block text-slate-200 mb-1">منوی سه‌نقطه</strong>
                    <span className="text-slate-400">روی منوی سه‌نقطه (⋮) در بالای سمت راست کروم ضربه بزنید.</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold mb-2">۳</span>
                    <strong className="block text-slate-200 mb-1">نصب برنامه</strong>
                    <span className="text-slate-400">گزینه «Install app» یا «Add to Home screen» را انتخاب کنید.</span>
                  </div>
                </div>
              </div>

              {/* Install and Share Actions */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {isInstallable && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>نصب فوری روی این دستگاه (Install Now)</span>
                    </button>
                  )}

                  <button
                    onClick={() => copyToClipboard(appShareUrl, setCopiedUrl)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>لینک کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-400" />
                        <span>کپی لینک برنامه برای ارسال به گوشی</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono text-center break-all select-all">
                  {appShareUrl}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEMINI LIVE AUDIO */}
          {activeTab === 'gemini-live' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs sm:text-sm text-cyan-200/90 flex gap-3 items-start">
                <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cyan-300 font-semibold mb-1">
                    نحوه فعال‌سازی گفتگوی زنده صوتی (Gemini Live) با شاعر بلوچی در اندروید
                  </strong>
                  در اپلیکیشن رسمی Gemini در گوشی اندروید، قابلیتی به نام <strong>Gemini Live</strong> وجود دارد که با آیکون امواج صوتی در گوشه پایین مشخص است.
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <p>پس از ساخت Gem در مرحله اول:</p>
                <ol className="space-y-2 list-decimal list-inside pr-1">
                  <li>در اپلیکیشن Gemini اندروید، Gem «شاعر و دکلمه‌خوان بلوچی» را انتخاب کنید.</li>
                  <li>روی دکمه میکروفون یا آیکون <strong>Gemini Live (امواج صوتی)</strong> ضربه بزنید.</li>
                  <li>
                    به زبان فارسی یا بلوچی بگویید:
                    <div className="mt-1.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-medium text-xs">
                      «یک شعر حماسی بلوچی درباره وطن و شجاعت به سبک میر گل‌خان نصیر برای من بسرا و با صدای گیرا بخوان»
                    </div>
                  </li>
                  <li>هوش مصنوعی به صورت مکالمه‌ای و صوتی برای شما شعر می‌سراید و دکلمه می‌کند!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            استودیوی شعر و دکلمه بلوچی • قدرت‌گرفته از Gemini 3.8 Flash
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium text-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

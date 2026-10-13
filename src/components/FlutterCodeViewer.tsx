import React, { useState } from 'react';
import { FLUTTER_MAIN_DART, FLUTTER_PUBSPEC_YAML } from '../utils/flutterCode';
import { 
  CODEMAGIC_YAML, 
  ANDROID_MANIFEST_XML, 
  README_CODEMAGIC_MD, 
  generateCodemagicProjectZip 
} from '../utils/flutterProjectExport';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  FileTerminal, 
  ExternalLink,
  Smartphone,
  Cpu
} from 'lucide-react';

export const FlutterCodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'codemagic' | 'dart' | 'yaml' | 'manifest' | 'guide'>('codemagic');
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  let currentContent = '';
  let filename = '';

  if (activeTab === 'codemagic') {
    currentContent = CODEMAGIC_YAML;
    filename = 'codemagic.yaml';
  } else if (activeTab === 'dart') {
    currentContent = FLUTTER_MAIN_DART;
    filename = 'main.dart';
  } else if (activeTab === 'yaml') {
    currentContent = FLUTTER_PUBSPEC_YAML;
    filename = 'pubspec.yaml';
  } else if (activeTab === 'manifest') {
    currentContent = ANDROID_MANIFEST_XML;
    filename = 'AndroidManifest.xml';
  } else {
    currentContent = README_CODEMAGIC_MD;
    filename = 'README_CODEMAGIC.md';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      await generateCodemagicProjectZip();
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Intro Header: Codemagic APK Production Ready */}
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-4 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-orange-500/25 text-orange-400 border border-orange-500/40 text-[11px] font-mono font-bold tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                CODEMAGIC CI/CD READY
              </span>
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider font-mono">
                Android APK Build Output
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              تجميع تطبيق الأندرويد (APK) عبر منصة كود ماجيك (Codemagic)
            </h2>

            <p className="text-xs md:text-sm text-slate-300/90 max-w-2xl leading-relaxed">
              هنا جميع الملفات اللازمة لتوليد ملف <strong className="text-amber-400 font-mono">.APK</strong> حقيقي جاهز للتثبيت على هواتف الأندرويد. تم إعداد ملف <strong className="text-amber-400 font-mono">codemagic.yaml</strong> وهيكل مشروع <strong className="text-orange-400 font-mono">Flutter & Dart</strong> بالكامل لتقوم المنصة بتجميعه وتنزيل الـ APK خلال دقائق!
            </p>
          </div>

          {/* Primary Action: 1-Click ZIP Download for Codemagic */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs md:text-sm font-black transition-all shadow-[0_4px_30px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Package className="w-5 h-5 stroke-[2.5]" />
              <span>{isExportingZip ? 'جاري تجهيز الـ ZIP...' : 'تحميل مشروع كود ماجيك (.ZIP)'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer backdrop-blur-md active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Instruction Card in Arabic */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <strong className="text-white block font-semibold">حمل ملف الـ ZIP</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">اضغط على الزر الذهبي لتحميل أرشيف المشروع المهيأ لكود ماجيك.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-6 h-6 rounded-full bg-orange-400/20 text-orange-300 font-mono font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <strong className="text-white block font-semibold">ارفع المشروع لـ GitHub</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">فك الضغط وارفع المجلد على مستودع جديد في GitHub أو Bitbucket.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
            <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 font-mono font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <strong className="text-white block font-semibold">تجميع الـ APK في Codemagic</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">اربط المستودع بـ codemagic.io واضغط Start build للحصول على الـ APK.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel (Frosted IDE Glass) */}
      <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-black/50 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 md:gap-2">
            
            <button
              onClick={() => setActiveTab('codemagic')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'codemagic'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-amber-300/80 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <FileTerminal className="w-3.5 h-3.5" />
              <span>codemagic.yaml</span>
            </button>

            <button
              onClick={() => setActiveTab('dart')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dart'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>lib/main.dart</span>
            </button>

            <button
              onClick={() => setActiveTab('yaml')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'yaml'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>pubspec.yaml</span>
            </button>

            <button
              onClick={() => setActiveTab('manifest')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'manifest'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>AndroidManifest.xml</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(234,88,12,0.4)]'
                  : 'text-orange-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>دليل Codemagic (Guide)</span>
            </button>
          </div>

          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-mono transition-colors shrink-0 ml-2"
            title={`Download ${filename}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{filename}</span>
          </button>
        </div>

        {/* Code Content Viewport */}
        <pre className="p-5 md:p-7 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-all no-scrollbar">
          <code>{currentContent}</code>
        </pre>
      </div>

    </div>
  );
};

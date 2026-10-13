import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Battery, Wifi, Signal, Sparkles } from 'lucide-react';

interface AndroidFrameProps {
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  isPhoneFrame,
  onToggleFrame,
  children,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isPhoneFrame) {
    return (
      <div className="w-full min-h-screen bg-[#06080d] text-slate-100 relative selection:bg-amber-500/30 selection:text-amber-200">
        {/* Ambient background light leaks */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-orange-600/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040508] py-6 px-4 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/[0.08] via-orange-600/[0.04] to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Mode Switcher Top Pill */}
      <div className="mb-4 flex items-center gap-3 z-10">
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#111624]/80 backdrop-blur-md border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:border-amber-400/50 hover:bg-[#182033]/90 transition-all shadow-[0_8px_25px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95"
          title="Toggle Full Desktop Layout vs Android Phone Frame"
        >
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span>Switch to Fullscreen Glass Mode</span>
        </button>
      </div>

      {/* Android Device Outer Bezel - Titanium Glass Flagship */}
      <div className="relative w-full max-w-[420px] h-[900px] max-h-[92vh] bg-[#0c101a] rounded-[52px] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] border-[3px] border-[#1e2638] flex flex-col overflow-hidden ring-1 ring-amber-500/15">
        
        {/* Subtle metallic edge reflections */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute -left-[5px] top-28 w-[3px] h-12 bg-gradient-to-b from-[#2d3850] to-[#1c2434] rounded-l" />
        <div className="absolute -left-[5px] top-44 w-[3px] h-12 bg-gradient-to-b from-[#2d3850] to-[#1c2434] rounded-l" />
        <div className="absolute -right-[5px] top-36 w-[3px] h-16 bg-gradient-to-b from-[#ea580c]/80 to-[#f59e0b]/60 rounded-r" />

        {/* Inner Screen Display with Glass Texture */}
        <div className="w-full h-full bg-[#06080d] rounded-[42px] flex flex-col overflow-hidden relative border border-white/[0.06] shadow-inner">
          
          {/* Android Status Bar */}
          <div className="w-full h-8 bg-[#090d16]/85 backdrop-blur-md z-30 shrink-0 px-6 flex items-center justify-between text-[11px] font-mono text-slate-300 select-none border-b border-white/[0.04]">
            <span className="font-semibold tracking-tight text-white/90">{time || '09:41'}</span>
            
            {/* Front Camera Punch-hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#020305] border border-white/10 flex items-center justify-center shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0d1626] ring-1 ring-amber-400/30" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                <span>98%</span>
                <Battery className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Screen Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
            {children}
          </div>

          {/* Android Gesture Navigation Bar */}
          <div className="w-full h-5 bg-[#080b12]/90 backdrop-blur-md shrink-0 flex items-center justify-center border-t border-white/[0.04]">
            <div className="w-32 h-1 bg-white/20 rounded-full hover:bg-amber-400/70 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};


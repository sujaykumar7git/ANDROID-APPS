import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Maximize2, 
  Minimize2, 
  Smartphone,
  Signal,
  Flame,
  User,
  Activity,
  Calendar,
  UtensilsCrossed,
  Sparkles
} from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
}

export default function AndroidFrame({ children, activeTab, setActiveTab, title }: AndroidFrameProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Generate real-time standard HH:mm format
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "briefing", label: "Daily Brief", icon: Sparkles },
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "schedule", label: "Titration", icon: Calendar },
    { id: "nutrition", label: "Menu Plans", icon: UtensilsCrossed },
    { id: "profile", label: "Biometrics", icon: User },
  ];

  const FrameWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isFullscreen) {
      return (
        <div className="w-full min-h-[92vh] flex flex-col bg-slate-50 text-slate-950 transition-all duration-300">
          {children}
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center py-6 px-4 bg-slate-100 min-h-[92vh] transition-all duration-300">
        <div className="relative w-full max-w-[412px] h-[840px] rounded-[48px] border-[10px] border-slate-900 bg-white shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-800/10 transition-all duration-300">
          {/* Punch Hole Camera & Speaker */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-2xl z-50 flex justify-center items-start pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2 border border-slate-950"></span>
            <span className="w-16 h-1 bg-slate-800 rounded-full mt-1"></span>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Top Banner Control Panel (Not inside the phone) */}
      <div className="bg-slate-905 bg-[#121824] px-6 py-3 border-b border-slate-800 flex justify-between items-center text-white text-xs sm:text-sm shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-300">
            Android UI Simulation Engine
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-white font-medium transition cursor-pointer"
            id="toggle-fullscreen-btn"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-emerald-400" />
                <span>Phone Window Frame</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                <span>Full Screen View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Simulator Body */}
      <FrameWrapper>
        {/* Top Native Status Bar (Material M3 Surface Container Style) */}
        <div className="bg-m3-surface-container text-m3-on-surface text-[11px] px-6 pt-7 pb-2 flex justify-between items-center z-40 select-none font-sans border-b border-m3-outline-variant/10">
          <span className="font-extrabold tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5 opacity-85">
            <Signal className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wide text-[9.5px]">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-m3-on-surface/80" />
          </div>
        </div>

        {/* Dynamic Navigation Header (Material You Style) */}
        <header className="bg-m3-surface-container text-m3-on-surface px-5 py-4 flex items-center justify-between border-b border-m3-outline-variant/20 shadow-xs z-30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-m3-primary-container rounded-2xl border border-m3-outline/10 text-m3-on-primary-container shadow-xs animate-scale-up">
              <Flame className="w-5 h-5 fill-m3-on-primary-container/20" />
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-m3-on-surface leading-tight font-display">
                {title}
              </h1>
              <p className="text-[9px] text-m3-outline tracking-wider font-extrabold uppercase font-mono">
                NOVELTREAT HEALTH SYSTEM
              </p>
            </div>
          </div>
        </header>

        {/* Phone Content Screen */}
        <main className="flex-1 overflow-y-auto bg-m3-surface-container-low relative z-10 p-4 scrollbar-thin scrollbar-thumb-m3-outline-variant/30">
          {children}
        </main>

        {/* Bottom Material 3 Navigation Bar */}
        <nav className="bg-m3-surface-container border-t border-m3-outline-variant/35 px-2 py-3 text-m3-on-surface flex justify-around items-center z-40 select-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1.5 py-0.5 px-1.5 cursor-pointer relative group transition-all w-20"
              >
                {/* Active Indicator Pill centered around the icon */}
                <div 
                  className={`relative w-14 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-m3-primary-container text-m3-on-primary-container scale-100 shadow-xs" : "bg-transparent text-m3-on-surface-variant scale-90 group-hover:bg-m3-surface-container-high/60"
                  }`} 
                >
                  <Icon 
                    className={`w-[22px] h-[22px] transition-all duration-200 ${
                      isActive ? "scale-105 stroke-[2.5]" : "stroke-[1.8]"
                    }`} 
                  />
                </div>
                
                <span 
                  className={`text-[9.5px] tracking-tight transition-all duration-200 mt-0.5 font-sans leading-none ${
                    isActive ? "text-m3-primary font-black scale-105" : "text-m3-on-surface-variant font-semibold hover:text-m3-on-surface"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Phone Navigation Bar Gesture Pill */}
        {!isFullscreen && (
          <div className="bg-m3-surface-container pb-2 pt-0.5 flex justify-center items-center z-40 select-none">
            <div className="w-28 h-1.5 rounded-full bg-m3-outline/35"></div>
          </div>
        )}
      </FrameWrapper>
    </div>
  );
}

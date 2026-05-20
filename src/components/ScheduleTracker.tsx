import React, { useState, useEffect } from "react";
import { InjectionLog, SideEffectLog, SideEffectType, UserProfile } from "../types";
import { 
  Plus, 
  Calendar, 
  AlertTriangle, 
  Map, 
  Heart, 
  Star, 
  History, 
  Check, 
  Info, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Trash2,
  X
} from "lucide-react";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleTrackerProps {
  profile: UserProfile;
  injectionLogs: InjectionLog[];
  onAddLog: (log: InjectionLog) => void;
  onDeleteLog: (id: string) => void;
}

const SIDE_EFFECT_OPTIONS: { type: SideEffectType; label: string; tip: string }[] = [
  { 
    type: "nausea", 
    label: "Nausea (Queasiness)", 
    tip: "Eat slowly. Avoid greasy, highly spiced foods. Sip cold water and peppermint or ginger tea." 
  },
  { 
    type: "fatigue", 
    label: "Fatigue / Weakness", 
    tip: "Maintain electrolytes, verify adequate complex hydration, and check protein-intake targets." 
  },
  { 
    type: "headache", 
    label: "Headaches", 
    tip: "Blood sugar may stabilize quickly; consume hydration salts and regular small protein servings." 
  },
  { 
    type: "constipation", 
    label: "Constipation (Very common)", 
    tip: "Delayed muscular stomach movement is standard. Increase dietary fiber and drink plain water." 
  },
  { 
    type: "diarrhea", 
    label: "Diarrhea", 
    tip: "Switch to bland binding foods (bananas, white rice, applesauce) and maintain secure hydration logs." 
  },
  { 
    type: "sour_stomach", 
    label: "Sour Stomach / Reflux", 
    tip: "Do not lie down for 2-3 hours after feeding. Reduce dietary fat and carbonated drinks." 
  },
  { 
    type: "indigestion", 
    label: "Bloating / Indigestion", 
    tip: "Eat smaller meals. Digestion takes much longer now. Chew thoroughly before swallowing." 
  },
  { 
    type: "appetite_loss", 
    label: "Extreme Appetite Loss", 
    tip: "Normal effect, but don't skip meals entirely. Focus on consuming calorie-dense healthy protein." 
  }
];

const INJECTION_SITES = [
  { id: "left_abdomen", name: "Left Abdomen (Lower)", color: "border-teal-300 bg-teal-50" },
  { id: "right_abdomen", name: "Right Abdomen (Lower)", color: "border-teal-300 bg-teal-50" },
  { id: "left_thigh", name: "Left Thigh (Outer)", color: "border-indigo-300 bg-indigo-50" },
  { id: "right_thigh", name: "Right Thigh (Outer)", color: "border-indigo-300 bg-indigo-50" },
  { id: "left_arm", name: "Left Upper Arm", color: "border-amber-300 bg-amber-50" },
  { id: "right_arm", name: "Right Upper Arm", color: "border-amber-300 bg-amber-50" },
];

export default function ScheduleTracker({ profile, injectionLogs, onAddLog, onDeleteLog }: ScheduleTrackerProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [doseMg, setDoseMg] = useState(profile.currentDoseLevel);
  const [selectedSite, setSelectedSite] = useState("left_abdomen");
  const [activeSideEffects, setActiveSideEffects] = useState<SideEffectLog[]>([]);
  const [notes, setNotes] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Custom user-defined side effects options list
  const [customSideEffects, setCustomSideEffects] = useState<{ type: string; label: string; tip: string; isCustom: boolean }[]>(() => {
    const saved = localStorage.getItem("noveltreat_custom_side_effects_list");
    return saved ? JSON.parse(saved) : [];
  });
  const [newCustomSideEffect, setNewCustomSideEffect] = useState("");

  // Auto-sync custom options list to localStorage
  useEffect(() => {
    localStorage.setItem("noveltreat_custom_side_effects_list", JSON.stringify(customSideEffects));
  }, [customSideEffects]);

  // Helper calculation to verify standard next injection date
  const getNextInjectionDetails = () => {
    if (injectionLogs.length === 0) {
      return { msg: "Schedule logged first injection", dateStr: "Pending first entry", daysLeft: 0, overdue: false };
    }

    // Sort logs descending
    const sorted = [...injectionLogs].sort((a, b) => new Date(b.injectedAt).getTime() - new Date(a.injectedAt).getTime());
    const lastInjected = new Date(sorted[0].injectedAt);
    
    // Add 7 days
    const nextInjected = new Date(lastInjected.getTime() + 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    // Calculate differences
    const diffTime = nextInjected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;

    return {
      dateStr: nextInjected.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
      daysLeft: isOverdue ? Math.abs(diffDays) : diffDays,
      overdue: isOverdue
    };
  };

  const scheduleInfo = getNextInjectionDetails();

  const handleToggleSideEffect = (type: string, isCustom = false) => {
    const exists = activeSideEffects.find(s => s.type === type);
    if (exists) {
      setActiveSideEffects(activeSideEffects.filter(s => s.type !== type));
    } else {
      setActiveSideEffects([...activeSideEffects, { 
        type, 
        severity: 2, 
        duration: "", 
        timeOfDay: "", 
        isCustom 
      }]);
    }
  };

  const handleChangeSeverity = (type: string, severity: number) => {
    setActiveSideEffects(activeSideEffects.map(s => s.type === type ? { ...s, severity } : s));
  };

  const handleUpdateSideEffectDetail = (type: string, field: 'duration' | 'timeOfDay', value: string) => {
    setActiveSideEffects(activeSideEffects.map(s => s.type === type ? { ...s, [field]: value } : s));
  };

  const handleAddCustomSideEffect = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = newCustomSideEffect.trim();
    if (!normalized) return;

    // Check pre-existing options to prevent duplicates
    const inPredefined = SIDE_EFFECT_OPTIONS.some(o => o.label.toLowerCase() === normalized.toLowerCase() || o.type.toLowerCase() === normalized.toLowerCase());
    const inCustom = customSideEffects.some(o => o.label.toLowerCase() === normalized.toLowerCase());

    if (inPredefined || inCustom) {
      alert("This option already exists in the side effects listings.");
      return;
    }

    const typeKey = "custom_" + normalized.replace(/\s+/g, "_").toLowerCase() + "_" + Date.now();
    const newOption = {
      type: typeKey,
      label: normalized,
      tip: "Custom symptom. Keep a record of duration and time of day experienced for clinic consultation.",
      isCustom: true
    };

    setCustomSideEffects([...customSideEffects, newOption]);
    setNewCustomSideEffect("");

    // Auto check/activate the newly added side effect
    setActiveSideEffects([...activeSideEffects, {
      type: typeKey,
      severity: 2,
      duration: "",
      timeOfDay: "",
      isCustom: true
    }]);
  };

  const getSideEffectLabel = (type: string) => {
    const predefined = SIDE_EFFECT_OPTIONS.find(o => o.type === type);
    if (predefined) return predefined.label;
    
    const custom = customSideEffects.find(o => o.type === type);
    if (custom) return custom.label;

    if (type.startsWith("custom_")) {
      const parts = type.split("_");
      // slice(1, -1) skips "custom_" and the trailing timestamp
      const words = parts.slice(1, parts.length - 1);
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    return type;
  };

  const allSideEffectOptions = [
    ...SIDE_EFFECT_OPTIONS.map(o => ({ ...o, isCustom: false })),
    ...customSideEffects
  ];

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: InjectionLog = {
      id: "inj_" + Date.now(),
      injectedAt: new Date().toISOString(),
      doseMg,
      injectionSite: INJECTION_SITES.find(s => s.id === selectedSite)?.name || selectedSite,
      sideEffects: activeSideEffects,
      notes
    };

    onAddLog(newLog);
    setFormSuccess("✅ Injection dose successfully tracked!");
    setTimeout(() => {
      setFormSuccess("");
      setShowLogForm(false);
      // Reset state fields
      setActiveSideEffects([]);
      setNotes("");
    }, 1500);
  };

  return (
    <div className="space-y-4 py-1 animate-fade-in font-sans">
      {/* Reminders Grid Card - Expressive Forest Core Container */}
      <div className="bg-[#002112] text-white rounded-[28px] p-5 border border-[#97f7c1]/10 shadow-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-m3-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 bg-[#96f7be]/15 border border-[#96f7be]/10 px-3 py-1 rounded-full text-[#96f7be] text-[10px] font-black tracking-wide uppercase font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-m3-primary" /> NOVELTREAT SCHEDULE
          </div>
          {injectionLogs.length > 0 && (
            <span className={`text-[9.5px] px-3 py-0.5 rounded-full font-black uppercase font-mono tracking-wider ${
              scheduleInfo.overdue 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" 
                : "bg-m3-primary/20 text-[#96f7be] border border-[#96f7be]/10"
            }`}>
              {scheduleInfo.overdue ? "Overdue" : "In Cycle"}
            </span>
          )}
        </div>

        {injectionLogs.length === 0 ? (
          <div className="space-y-3.5">
            <h3 className="text-base font-black font-display text-white">No Injections Logged Yet</h3>
            <p className="text-[11.5px] text-[#96f7be]/80 leading-relaxed font-medium">
              Track your initial therapeutic dose to auto-compute your weekly titration cycle. Recommended starting titration is 0.25 mg.
            </p>
            <button
              type="button"
              onClick={() => setShowLogForm(true)}
              className="py-2.5 px-5 bg-m3-primary hover:bg-[#008154] font-extrabold text-white text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer hover:scale-[1.03] duration-150"
            >
              <Plus className="w-4 h-4 stroke-[3.5]" /> Log First Dose
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 border-r border-m3-outline-variant/10 pr-2">
              <span className="text-[9.5px] text-[#96f7be]/70 font-mono tracking-wider uppercase block">Next Target Dose</span>
              <div className="font-display text-base font-black text-white flex items-baseline gap-1">
                {scheduleInfo.dateStr}
              </div>
              <p className="text-[10px] text-m3-primary-container/85 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#96f7be]" />
                Dose day: {DAYS_OF_WEEK[profile.doseDayOfWeek]}
              </p>
            </div>
            
            <div className="space-y-1 flex flex-col justify-center">
              <span className="text-[9.5px] text-[#96f7be]/70 font-mono tracking-wider uppercase block font-medium">
                {scheduleInfo.overdue ? "Delayed by" : "Remaining Time"}
              </span>
              <div className="text-2xl font-black text-m3-primary font-display">
                {scheduleInfo.daysLeft} {scheduleInfo.daysLeft === 1 ? 'Day' : 'Days'}
              </div>
              <p className="text-[10px] text-[#96f7be]/80">
                {scheduleInfo.overdue ? "⚠️ Overdue for dose!" : "Until weekly syringe log"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Track Dose Toggle button */}
      {!showLogForm && (
        <button
          type="button"
          onClick={() => {
            setDoseMg(profile.currentDoseLevel);
            setShowLogForm(true);
          }}
          className="w-full py-4 px-4 bg-m3-surface-container-lowest rounded-[24px] border border-m3-outline-variant/20 text-m3-on-surface hover:bg-m3-surface-container-low transition-all flex items-center justify-between shadow-xs cursor-pointer group hover:scale-[1.01] duration-200"
          id="btn-trigger-log"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-m3-primary-container text-m3-on-primary-container rounded-[16px] group-hover:bg-m3-primary/10 transition-colors">
              <Plus className="w-4.5 h-4.5 text-m3-primary stroke-[3]" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-black text-m3-on-surface leading-tight font-display">Log Injection Dose</p>
              <p className="text-[10.5px] text-m3-on-surface-variant font-medium">Track injection site & active side effects</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-m3-outline group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Log Injection Form Panel */}
      {showLogForm && (
        <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4.5 animate-fade-in">
          <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-3">
            <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
              <Heart className="w-4 h-4 text-m3-primary" /> SYRINGE LOG ENTRY
            </h3>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="text-xs font-black text-m3-outline hover:text-m3-on-surface cursor-pointer py-1 px-3 bg-m3-surface-container-low rounded-full border border-m3-outline-variant/20 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitLog} className="space-y-4.5">
            {/* Dose Level selection inside entry */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-2 font-mono uppercase tracking-wider">Weekly Dosage Tracked</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0.25, 0.5, 1.0, 1.7, 2.4].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDoseMg(val)}
                    className={`py-2 text-xs font-black rounded-xl border text-center transition-all cursor-pointer ${
                      doseMg === val 
                        ? "bg-[#002112] font-black border-[#002112] text-[#96f7be] shadow-sm" 
                        : "bg-m3-surface-container-low border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Injection Site Mock map selection visual */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-2 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Map className="w-4 h-4 text-m3-primary" /> Injection Rotation Site
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INJECTION_SITES.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSite(site.id)}
                    className={`p-3 rounded-[16px] text-xs border font-bold text-left transition-all uppercase cursor-pointer ${
                      selectedSite === site.id 
                        ? "border-[#006c47] ring-4 ring-[#006c47]/10 bg-[#eefaf4] text-[#003922] font-extrabold" 
                        : "bg-m3-surface-container-low border-m3-outline-variant/20 hover:bg-m3-surface-container-high text-m3-on-surface-variant"
                    }`}
                  >
                    <span>{site.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-m3-on-surface-variant mt-2 flex items-start gap-1.5 leading-snug">
                <Info className="w-4 h-4 text-m3-primary flex-shrink-0 mt-0.5" />
                <span>Alternate sites weekly to prevent lipodystrophy or injection-site soreness.</span>
              </p>
            </div>

            {/* Side effects selectors during injection log */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-m3-on-surface mb-2 font-mono uppercase tracking-wider">
                Active Side Effects (Check, rate severity & specify logistics)
              </label>
              <div className="space-y-2 max-h-68 overflow-y-auto border border-m3-outline-variant/20 p-2.5 rounded-[24px] bg-m3-surface-container-low/50 shadow-inner">
                {allSideEffectOptions.map((opt) => {
                  const logged = activeSideEffects.find(s => s.type === opt.type);
                  return (
                    <div 
                      key={opt.type} 
                      className={`p-3 rounded-[20px] transition-all border ${
                        logged ? "bg-white border-[#96f7be] shadow-sm" : "border-m3-outline-variant/10 bg-white/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-m3-on-surface">
                          <input
                            type="checkbox"
                            checked={!!logged}
                            onChange={() => handleToggleSideEffect(opt.type, opt.isCustom)}
                            className="w-4.5 h-4.5 rounded-[4px] border border-m3-outline text-m3-primary focus:ring-m3-primary/30 transition-all cursor-pointer"
                          />
                          <span className="leading-tight">{opt.label}</span>
                          {opt.isCustom && (
                            <span className="text-[8.5px] font-black uppercase py-0.5 px-2 bg-m3-primary-container text-m3-on-primary-container border border-m3-primary/10 rounded-full">
                              Custom
                            </span>
                          )}
                        </label>
                        
                        <div className="flex items-center gap-2">
                          {/* 1 to 5 Star Rating system */}
                          {logged && (
                            <div className="flex items-center gap-1 bg-m3-surface-container-low px-2 py-0.5 rounded-full border border-m3-outline-variant/10">
                              <span className="text-[9px] text-m3-outline font-black font-mono">Lvl:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleChangeSeverity(opt.type, s)}
                                    className="p-0.5 cursor-pointer hover:scale-125 transition-transform"
                                  >
                                    <Star 
                                      className={`w-3.5 h-3.5 ${
                                        s <= logged.severity 
                                          ? "text-amber-500 fill-amber-500" 
                                          : "text-m3-outline-variant"
                                      }`} 
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {opt.isCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomSideEffects(customSideEffects.filter(c => c.type !== opt.type));
                                setActiveSideEffects(activeSideEffects.filter(s => s.type !== opt.type));
                              }}
                              className="text-m3-outline hover:text-red-500 p-1 rounded-full hover:bg-m3-surface-container transition-colors cursor-pointer"
                              title="Delete custom option"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                                       {/* Detailed entries: Time of Day and Duration */}
                      {logged && (
                        <div className="mt-2.5 pt-2.5 border-t border-m3-outline-variant/10 space-y-2 animate-fade-in">
                          <div className="grid grid-cols-2 gap-2">
                            {/* Time of Day */}
                            <div>
                              <label className="block text-[9.5px] font-black text-m3-outline uppercase tracking-tight mb-1 font-mono">Time of Day</label>
                              <select
                                value={logged.timeOfDay || ""}
                                onChange={(e) => handleUpdateSideEffectDetail(opt.type, 'timeOfDay', e.target.value)}
                                className="w-full text-[10.5px] font-bold py-1.5 px-2 bg-m3-surface border border-m3-outline-variant/30 rounded-xl focus:outline-none focus:border-m3-primary"
                              >
                                <option value="">-- Specify Time --</option>
                                <option value="Morning">Morning 🌅</option>
                                <option value="Afternoon">Afternoon ☀️</option>
                                <option value="Evening">Evening 🌇</option>
                                <option value="Night">Night 🌙</option>
                                <option value="All Day">All Day 🔄</option>
                              </select>
                            </div>

                            {/* Duration */}
                            <div>
                              <label className="block text-[9.5px] font-black text-m3-outline uppercase tracking-tight mb-1 font-mono">Duration</label>
                              <input
                                type="text"
                                value={logged.duration || ""}
                                onChange={(e) => handleUpdateSideEffectDetail(opt.type, 'duration', e.target.value)}
                                placeholder="e.g. 2 hrs, all day"
                                className="w-full text-[10.5px] font-bold py-1.5 px-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl focus:outline-none focus:border-m3-primary cursor-text"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive tips showing up immediately */}
                      {logged && opt.tip && (
                        <div className="mt-2 text-[10px] text-m3-primary bg-[#eefaf4] p-2.5 rounded-xl border border-m3-primary/10 leading-relaxed font-normal">
                          💡 <strong>Clinical tip:</strong> {opt.tip}
                        </div>
                      )}
                    </div>
                  );
                })}

                {allSideEffectOptions.length === 0 && (
                  <p className="text-center text-m3-outline text-[11px] py-4">No side effects listed. Add a custom symptom trigger below!</p>
                )}
              </div>

              {/* Add Custom Side Effect option element */}
              <div className="flex gap-1.5 bg-m3-surface-container p-1.5 border border-m3-outline-variant/10 rounded-full">
                <input
                  type="text"
                  value={newCustomSideEffect}
                  onChange={(e) => setNewCustomSideEffect(e.target.value)}
                  placeholder="Symptom name (Heartburn, joint aches...)"
                  className="flex-1 px-4 py-1.5 bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-full text-xs font-bold focus:outline-none focus:border-m3-primary cursor-text placeholder:text-m3-outline"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSideEffect}
                  className="px-4 py-1.5 bg-[#002112] border border-[#002112] text-[#96f7be] hover:opacity-95 font-black rounded-full text-xs transition-colors cursor-pointer"
                >
                  + Add Option
                </button>
              </div>
            </div>

            {/* Syringe notes */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 font-mono uppercase tracking-wider">
                Clinical observations / Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. Feeling full extremely fast, mild evening reflux, or specific physical symptoms."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-m3-surface-container border border-m3-outline-variant/20 rounded-2xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors"
              />
            </div>

            {formSuccess && (
              <div className="p-2.5 bg-[#eefaf4] border border-[#96f7be]/30 text-[#003922] text-xs font-extrabold text-center rounded-xl animate-scale-up">
                {formSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-m3-primary hover:bg-[#008154] text-white font-extrabold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer text-xs tracking-widest shadow-md hover:scale-[1.01]"
              id="submit-log"
            >
              <Check className="w-4 h-4 text-white stroke-[3.5]" />
              <span>SAVE INJECTION RECORD</span>
            </button>
          </form>
        </div>
      )}

      {/* Symptoms Remedies Grid (Highly functional static guide always visible below timeline) */}
      <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-m3-on-surface-variant tracking-wider uppercase flex items-center gap-1.5 font-display">
          <Info className="w-4 h-4 text-m3-primary" /> BARIATRIC PATIENT EDUCATION
        </h3>
        
        <div className="space-y-2">
          {SIDE_EFFECT_OPTIONS.slice(0, 3).map((item) => (
            <div key={item.type} className="flex gap-2.5 items-start bg-m3-surface-container-low p-3 border border-m3-outline-variant/15 rounded-[20px]">
              <span className="text-base">📌</span>
              <div className="space-y-0.5">
                <p className="text-[11.5px] font-black text-[#003922]">{item.label}</p>
                <p className="text-[10px] text-m3-on-surface-variant leading-relaxed font-medium">{item.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Dose database section */}
      <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs">
        <h3 className="text-xs font-black text-m3-on-surface-variant tracking-wider uppercase flex items-center gap-1.5 mb-3.5 font-display">
          <History className="w-4 h-4 text-m3-primary" /> LOGGED DOSE HISTORY
        </h3>

        {injectionLogs.length === 0 ? (
          <p className="text-center font-black text-m3-outline text-xs py-4 font-mono">No records in bariatric history repository.</p>
        ) : (
          <div className="space-y-2.5">
            {[...injectionLogs]
              .sort((a, b) => new Date(b.injectedAt).getTime() - new Date(a.injectedAt).getTime())
              .map((log) => {
                const dateObj = new Date(log.injectedAt);
                const formatD = dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
                const formatT = dateObj.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
                return (
                  <div key={log.id} className="border border-m3-outline-variant/20 bg-m3-surface-container-low p-4 rounded-[22px] flex justify-between items-start text-xs relative group animate-fade-in hover:bg-m3-surface-container-high transition-colors">
                    <div className="space-y-2 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white bg-[#002112] px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                          {log.doseMg} mg
                        </span>
                        <span className="text-[9.5px] text-m3-outline font-black font-mono tracking-tight">
                          {formatD} @ {formatT}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-m3-on-surface-variant font-bold leading-none">
                        📍 Site: <strong className="text-m3-on-surface uppercase font-black">{log.injectionSite}</strong>
                      </p>

                      {log.sideEffects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {log.sideEffects.map((se, index) => {
                            const label = getSideEffectLabel(se.type);
                            const metaDetail = [];
                            if (se.timeOfDay) metaDetail.push(se.timeOfDay);
                            if (se.duration) metaDetail.push(se.duration);
                            return (
                              <div 
                                key={se.type + index} 
                                className="bg-[#fff7f7] border border-red-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-xl flex flex-col gap-0.5 shadow-2xs"
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold">{label}</span>
                                  <span className="text-[8.5px] font-mono px-1 py-0.2 bg-red-100 rounded text-rose-900 font-black">
                                    Lvl {se.severity}
                                  </span>
                                </div>
                                {metaDetail.length > 0 && (
                                  <span className="text-[8.5px] font-mono text-rose-500 font-semibold leading-none">
                                    ⏳ {metaDetail.join(" • ")}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {log.notes && (
                        <p className="text-[10px] text-m3-outline bg-m3-surface-container-lowest border border-m3-outline-variant/10 p-2 rounded-xl mt-1 select-all italic font-medium leading-relaxed">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteLog(log.id)}
                      className="text-m3-outline hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 cursor-pointer self-center transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

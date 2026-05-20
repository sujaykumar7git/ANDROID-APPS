import React, { useState, useEffect } from "react";
import { 
  Check, 
  Plus, 
  Droplet, 
  Flame, 
  CheckSquare, 
  AlertCircle, 
  Sparkles, 
  Moon, 
  TrendingDown, 
  Heart, 
  Compass, 
  ShoppingBag, 
  Dumbbell, 
  ListTodo,
  Smile,
  Volume2,
  Calendar,
  RotateCw,
  Trash2,
  Bell,
  Sliders,
  Settings
} from "lucide-react";
import { UserProfile, WeightRecord, MealItem } from "../types";
import { SEVEN_DAY_PLANS } from "../clinicalProtocolData";

// Powerful clinical affirmations to override alcohol and junk food cravings (presets)
const PRESET_AFFIRMATIONS = [
  "My body is a temple of healing and metabolic recovery. Alcohol and greasy junk food have no place in my journey.",
  "Every high-quality gram of protein is a building block for my brand new life. I choose fuel over empty indulgence.",
  "I quieten the artificial food noise. My stomach is shrinking, my mind is clearing, and I am fully in control.",
  "Alcohol triggers liver stress and severe nausea on Semaglutide. I protect my organs with pure water instead.",
  "Deep fried foods slow down my digestion, causing pain and heartburn. I chose light, nutritious foods that love me back.",
  "This clinical titration is a gift of longevity. I do not trade my long-term triumph for five minutes of chemical grease.",
  "I am learning to feel true hunger, and it is satisfied with pure protein, fermented ambali, and clean greens.",
  "My dedication to my goal weight is stronger than any temporary craving. I am stronger than the menu."
];

// Muscle preservation motivating taglines & guides
const EXERCISE_MOTIVATIONS = [
  {
    title: "Preserve Skeletal Muscle Mass",
    text: "Rapid bariatric weight loss can draft up to 25% of weight from muscle. Do 15 minutes of resistance weights to defend your lean mass!",
    intensity: "High Priority"
  },
  {
    title: "Post-Meal Moto Walk (15min)",
    text: "Walking 15 minutes immediately after lunch or dinner accelerates gastric emptying, prevents reflux, and stabilizes insulin spikes.",
    intensity: "Easy & HighMotility"
  },
  {
    title: "Strengthen Your Core",
    text: "A strong core supports a healthy posture and relieves back fatigue as your center of gravity rapidly shifts during slimming.",
    intensity: "10-Min Core Routine"
  },
  {
    title: "Hydration-Supported Aerobics",
    text: "Cardio is more efficient when highly hydrated. Drink 1 before you walk to boost systemic oxygen supply.",
    intensity: "Low Intensity Steady State"
  }
];

interface DailyBriefingProps {
  profile: UserProfile;
  mealLogs: MealItem[];
  injectionLogs: any[];
  weightRecords: WeightRecord[];
  waterIntakeMl: number;
  onUpdateWater: (mlDelta: number) => void;
  onAddWeight: (weightVal: number) => void;
  setActiveTab: (tab: string) => void;
}

export default function DailyBriefing({
  profile,
  mealLogs,
  injectionLogs,
  weightRecords,
  waterIntakeMl,
  onUpdateWater,
  onAddWeight,
  setActiveTab
}: DailyBriefingProps) {
  // Determine current day of week to auto load correct plan
  // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const dayIndex = new Date().getDay();
  const DAY_MAP_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const currentDayShort = DAY_MAP_SHORT[dayIndex];

  // States
  const [selectedDayTab, setSelectedDayTab] = useState(currentDayShort);
  const [inlineWeightInput, setInlineWeightInput] = useState("");
  const [weightLoggedSuccess, setWeightLoggedSuccess] = useState(false);
  const [activeAffirmationIndex, setActiveAffirmationIndex] = useState(0);
  const [checkedPreps, setCheckedPreps] = useState<Record<string, boolean>>({});
  const [customAffirmationInput, setCustomAffirmationInput] = useState("");
  const [showAffirmationsManager, setShowAffirmationsManager] = useState(false);
  
  // Custom toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "water" | "weight" } | null>(null);

  // Trigger app Toast
  const triggerToast = (message: string, type: "success" | "info" | "water" | "weight" = "success") => {
    setToast({ message, type });
  };

  // Auto hide Toast inside the Dev environment frame
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Affirmations list state loaded from localStorage
  const [affirmations, setAffirmations] = useState<string[]>(() => {
    const saved = localStorage.getItem("noveltreat_custom_affirmations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse custom affirmations", e);
      }
    }
    return [...PRESET_AFFIRMATIONS];
  });

  const [eatenFoods, setEatenFoods] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("noveltreat_briefing_eaten_foods");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist checked meals
  useEffect(() => {
    localStorage.setItem("noveltreat_briefing_eaten_foods", JSON.stringify(eatenFoods));
  }, [eatenFoods]);

  // Handle Rotation of Affirmations
  const rotateAffirmation = () => {
    if (affirmations.length === 0) return;
    setActiveAffirmationIndex((prev) => (prev + 1) % affirmations.length);
    triggerToast("🔄 Fetched next wise Clean Food Mindset Mantra", "info");
  };

  // Add custom affirmation avoiding alcohol/junk
  const handleAddCustomAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = customAffirmationInput.trim();
    if (!cleanVal) {
      triggerToast("⚠️ Affirmation copy cannot be blank.", "info");
      return;
    }
    
    const updatedAffirmations = [...affirmations, cleanVal];
    setAffirmations(updatedAffirmations);
    localStorage.setItem("noveltreat_custom_affirmations", JSON.stringify(updatedAffirmations));
    
    // Instantly slide index to view this newly generated booster!
    setActiveAffirmationIndex(updatedAffirmations.length - 1);
    setCustomAffirmationInput("");
    triggerToast("✨ Saved custom clean-food mindset mantra!", "success");
  };

  // Delete a custom affirmation
  const handleDeleteAffirmation = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const affirmationText = affirmations[indexToDelete];
    const isPreset = PRESET_AFFIRMATIONS.includes(affirmationText);
    
    if (isPreset) {
      triggerToast("🔒 Preset core clinical guidelines cannot be deleted.", "info");
      return;
    }

    const updatedAffirmations = affirmations.filter((_, idx) => idx !== indexToDelete);
    setAffirmations(updatedAffirmations);
    localStorage.setItem("noveltreat_custom_affirmations", JSON.stringify(updatedAffirmations));

    if (activeAffirmationIndex >= updatedAffirmations.length) {
      setActiveAffirmationIndex(Math.max(0, updatedAffirmations.length - 1));
    }
    triggerToast("🗑️ Avoidance mantra successfully retracted from cycle.", "info");
  };

  // Auto detect current day plan
  const activePlan = SEVEN_DAY_PLANS.find(p => p.day === selectedDayTab) || SEVEN_DAY_PLANS[0];

  // Resolve tomorrow's plan index
  const nextDayShort = (() => {
    const idx = DAY_MAP_SHORT.indexOf(selectedDayTab);
    const nextIdx = (idx + 1) % 7;
    return DAY_MAP_SHORT[nextIdx];
  })();
  const tomorrowPlan = SEVEN_DAY_PLANS.find(p => p.day === nextDayShort) || SEVEN_DAY_PLANS[0];

  // Resolve tonight's prep items based on tomorrow's dietary guidelines!
  const getTomorrowPrepItems = () => {
    const preps = [
      {
        id: "sleep",
        title: "Clinical Sleep Fast",
        desc: "Fast at least 2 hours before target clock. Skip late midnight snacking to avoid morning gastrointestinal acidity on Semaglutide."
      }
    ];

    // Tomorrow's menu peeking
    if (tomorrowPlan.day === "SUN") {
      preps.unshift(
        {
          id: "meat_prep",
          title: "Sunday Lean Meat Stock",
          desc: "Tomorrow is Lean Chicken breast day! Ensure 200g of biological-grade skinless chicken breast is defrosted in the refrigerator."
        }
      );
    }
    
    // Check if tomorrow involves soaking grain/legumes (such as soya chunks, chickpeas, rajma, chana dal mix)
    const tomorrowFoods = JSON.stringify(tomorrowPlan.meals).toLowerCase();
    if (tomorrowFoods.includes("soya") || tomorrowFoods.includes("chickpeas") || tomorrowFoods.includes("rajma") || tomorrowFoods.includes("chana")) {
      preps.unshift({
        id: "soak",
        title: "Legume hydration / Overnight Soak",
        desc: "Overnight hydration: Soak tomorrow's lentils (Soya chunks, Rajma, or Chickpeas) in fresh water tonight. This breaks complex gas-producing starch arrays and optimizes stomach motility."
      });
    }

    if (tomorrowPlan.meals.some(m => m.label.toLowerCase().includes("ambali"))) {
      preps.unshift({
        id: "ambali",
        title: "Ambali Ferment Checkup",
        desc: "Is your fermented Ragi or Kodo millet ambali in a pottery crock/jar ready to rest at room temp? Ensure the bacterial culture develops undisturbed."
      });
    }

    if (tomorrowFoods.includes("egg")) {
      preps.push({
        id: "eggs_prep",
        title: "Egg Boiler Setup",
        desc: "Place 4 to 6 fresh eggs near your stove or boiler. Peeling boiled eggs in the night saves 15 critical morning minutes."
      });
    }

    // Add water fill prep
    preps.push({
      id: "water_bottle",
      title: "5-Liter Hydration Deployment",
      desc: "Clean and fill your main hydration jars. Knowing your target is a massive 5,000 ml water volume tomorrow means having vessels ready tonight is mandatory!"
    });

    return preps;
  };

  const tomorrowPreps = getTomorrowPrepItems();

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inlineWeightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      onAddWeight(val);
      setInlineWeightInput("");
      setWeightLoggedSuccess(true);
      triggerToast(`⚖️ Baseline recorded: ${val} kg logged empty-stomach!`, 'weight');
      setTimeout(() => setWeightLoggedSuccess(false), 4000);
    } else {
      triggerToast("⚠️ Enter valid weight parameter (30 - 300 kg)", "info");
    }
  };

  // Daily water math
  const waterTargetMl = 5000; // Calibrated for this high-intake user requested: 5 Liters daily!
  const waterProgressPct = Math.min(100, Math.round((waterIntakeMl / waterTargetMl) * 100));

  const handleWaterClick = (mlDelta: number) => {
    onUpdateWater(mlDelta);
    const updated = waterIntakeMl + mlDelta;
    if (mlDelta > 0) {
      triggerToast(`💧 Hydration added! Total now: ${updated} ml / 5000 ml`, 'water');
    } else {
      triggerToast(`↩️ Correction applied: Hydration adjusted to ${updated} ml`, 'info');
    }
  };

  // Determine if today's weight has already been logged
  const todayStr = new Date().toISOString().substring(0, 10);
  const loggedWeightToday = weightRecords.find(w => w.date === todayStr);

  const keyDeltas = (() => {
    if (weightRecords.length === 0) return { start: 0, total: 0 };
    const sorted = [...weightRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const initial = sorted[0].weight;
    const latest = sorted[sorted.length - 1].weight;
    return {
      start: initial,
      total: Math.max(0, parseFloat((initial - latest).toFixed(1))),
      targetPct: Math.min(100, Math.max(0, Math.round(((initial - latest) / Math.max(1, initial - profile.targetWeight)) * 100)))
    };
  })();

  const handleToggleMealEaten = (mealUid: string) => {
    setEatenFoods(prev => {
      const updated = {
        ...prev,
        [mealUid]: !prev[mealUid]
      };
      const mealPart = mealUid.split('_')[2] || "Meal Intake";
      if (updated[mealUid]) {
        triggerToast(`🍽️ Logged: "${mealPart}" checkmarked under metabolic plan.`, 'success');
      } else {
        triggerToast(`↩️ Reverted: "${mealPart}" checkmark removed.`, 'info');
      }
      return updated;
    });
  };

  const handleTogglePrep = (id: string, title: string) => {
    setCheckedPreps(prev => {
      const updated = {
        ...prev,
        [id]: !prev[id]
      };
      if (updated[id]) {
        triggerToast(`🌙 Evening Prep Done: "${title}" is set for tomorrow!`, 'success');
      } else {
        triggerToast(`↩️ Evening Prep Reverted: "${title}".`, 'info');
      }
      return updated;
    });
  };

  // Test Notification Suite simulation triggers
  const handleTestNotification = (testType: string) => {
    switch (testType) {
      case "water":
        triggerToast("🔊 Water Reminder: Keep sipping! 5 Liters daily target optimizes GLP-1 kidney clearance.", 'water');
        break;
      case "weight":
        triggerToast("⚖️ Log Weight Reminder: Time to log morning dry body mass baseline empty-stomach.", 'weight');
        break;
      case "prep":
        triggerToast("🌙 Evening Setup: Check beforehand to soaking chickpeas/meat stock for tomorrow's diet.", 'success');
        break;
      case "mindset":
        triggerToast("🧘 Craving Shield: Refuse alcohol and high calorie junk foods to maintain muscle mass.", 'info');
        break;
      default:
        triggerToast("🔔 System Notification Alert: Titration pipeline online.", 'success');
    }
  };

  return (
    <div className="space-y-5 py-1 animate-fade-in font-sans pb-12 relative">
      
      {/* 🌟 CHIC TOP PERSISTENT TOAST FOR CLINICAL REMINDERS 🌟 */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#002112] text-[#96f7be] border-2 border-[#96f7be]/30 px-4 py-3 rounded-2xl shadow-xl z-55 flex items-start gap-2.5 max-w-[90%] w-80 animate-scale-up">
          <div className="p-1.5 rounded-full bg-[#96f7be]/15 text-[#96f7be] mt-0.5 animate-bounce">
            <Bell className="w-4 h-4 text-m3-primary" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <span className="text-[9px] uppercase font-mono block tracking-wider font-extrabold text-[#96f7be]/70">Clinical Notification</span>
            <span className="text-[11px] font-black leading-tight text-white block break-words">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Dynamic Day Selector Hub */}
      <div className="bg-[#002112] border border-[#96f7be]/15 rounded-[28px] p-4.5 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-m3-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-1 bg-[#96f7be]/15 border border-[#96f7be]/10 px-2.5 py-0.5 rounded-full text-[#96f7be] text-[9px] font-black tracking-wider uppercase font-mono">
              <Sparkles className="w-3 h-3 text-m3-primary animate-pulse" /> Daily Patient Dossier
            </div>
            <h2 className="text-base font-black font-display text-white mt-1 uppercase font-display">TODAY'S PLAN: {activePlan.name}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#96f7be]/80 font-black font-mono block">DATE PROTOCOL</span>
            <span className="text-xs font-bold text-white bg-m3-primary px-3 py-1 rounded-full">{todayStr}</span>
          </div>
        </div>

        {/* Day selection tabs */}
        <div className="grid grid-cols-7 gap-1 bg-[#00170a] p-1 border border-[#96f7be]/10 rounded-full text-center">
          {DAY_MAP_SHORT.map((day) => {
            const isToday = day === currentDayShort;
            const isSelected = day === selectedDayTab;
            return (
              <button
                key={day}
                onClick={() => setSelectedDayTab(day)}
                type="button"
                className={`py-1.5 rounded-full text-[10.5px] font-black tracking-tighter cursor-pointer transition-all ${
                  isSelected
                    ? "bg-m3-primary text-white shadow-xs"
                    : isToday 
                      ? "text-m3-primary font-black underline decoration-2 underline-offset-4" 
                      : "text-[#96f7be]/65 hover:text-white"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Daily Food to be Eaten That Day */}
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-2.5">
          <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
            <CheckSquare className="w-4.5 h-4.5 text-m3-primary" /> Meals Checklist & Targets
          </h3>
          <span className="text-[10px] text-m3-outline font-black font-mono tracking-wider">
            Target: ~140g Protein
          </span>
        </div>

        <p className="text-[11px] text-m3-on-surface-variant font-medium leading-relaxed">
          Semaglutide slows stomach emptying. Tick off meals once fully ingested. Focus on lean protein components first!
        </p>

        <div className="space-y-3">
          {activePlan.meals.map((meal, index) => {
            const isAmbali = meal.label.toLowerCase().includes("ambali");
            const mealUid = `${selectedDayTab}_${index}_${meal.label}`;
            const isEaten = !!eatenFoods[mealUid];

            return (
              <div 
                key={index} 
                className={`p-3.5 border rounded-[22px] transition-all relative overflow-hidden ${
                  isEaten 
                    ? "bg-[#eefaf4]/45 border-[#96f7be] opacity-75 animate-fade-in" 
                    : "bg-m3-surface-container-low border-m3-outline-variant/20 hover:border-m3-primary/30"
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMealEaten(mealUid)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                        isEaten 
                          ? "bg-m3-primary border-m3-primary text-white" 
                          : "border-m3-outline bg-white hover:border-m3-primary"
                      }`}
                    >
                      {isEaten && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                    </button>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-black font-mono uppercase ${
                      isAmbali 
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100" 
                        : "bg-m3-primary-container text-m3-on-primary-container border border-m3-primary/10"
                    }`}>
                      {meal.label}
                    </span>
                    <span className="text-[10px] text-m3-outline font-bold font-mono">{meal.time}</span>
                  </div>
                </div>

                {/* Recipes / Ingredients */}
                <ul className="space-y-1 pl-6 mb-2">
                  {meal.items.map((it, idx) => (
                    <li 
                      key={idx} 
                      className={`text-xs flex justify-between items-baseline leading-snug font-bold ${
                        isEaten ? "line-through text-m3-outline decoration-2 font-medium" : "text-m3-on-surface"
                      }`}
                    >
                      <span>{it.name} <span className="text-[10.5px] text-m3-on-surface-variant font-medium font-mono">({it.quantity})</span></span>
                      <span className="text-[10px] font-black font-mono text-m3-primary whitespace-nowrap pl-2">
                        {it.protein}g P / {it.calories} kcal
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Clinical cooking tips */}
                {meal.note && (
                  <p className="pl-6 text-[10px] text-m3-on-surface-variant italic leading-normal border-l-2 border-m3-outline-variant/30 mt-1">
                    📖 Prep: {meal.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Daily Weight Log Reminder */}
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-2.5">
          <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
            <TrendingDown className="w-4.5 h-4.5 text-m3-primary" /> Daily Weight Log Reminder
          </h3>
          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black uppercase font-mono ${
            loggedWeightToday 
              ? "bg-[#eefaf4] text-m3-primary border border-m3-primary/10" 
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            {loggedWeightToday ? "Logged Today" : "Action Required"}
          </span>
        </div>

        {loggedWeightToday ? (
          <div className="p-3 bg-[#eefaf4] border border-[#96f7be]/30 rounded-[18px] text-center space-y-1">
            <p className="text-xs font-black text-[#003922]">🎉 Fantastic job logging today!</p>
            <p className="text-[11px] text-[#003922]/80 leading-relaxed font-medium">
              Your registered baseline for today is <strong className="font-extrabold">{loggedWeightToday.weight} kg</strong>. 
              Only {Math.max(0, parseFloat((loggedWeightToday.weight - profile.targetWeight).toFixed(1)))} kg left to reach your dream target of {profile.targetWeight} kg.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <p className="text-[11px] text-m3-on-surface-variant leading-relaxed font-semibold">
              ⚠️ <strong>Clinical Standard Checklist:</strong> Always weigh yourself empty-stomach immediately in the morning after bladder voiding to register true biological weight without water fluctuations.
            </p>

            <form onSubmit={handleWeightSubmit} className="flex gap-2 bg-m3-surface-container p-1 rounded-full border border-m3-outline-variant/10">
              <input
                type="number"
                step="0.1"
                placeholder="Log weight in kg (e.g. 91.2)"
                value={inlineWeightInput}
                onChange={(e) => setInlineWeightInput(e.target.value)}
                className="flex-1 px-4 py-1.5 bg-m3-surface-container-lowest border border-m3-outline-variant/10 rounded-full text-xs font-bold focus:outline-none focus:border-m3-primary placeholder:text-m3-outline cursor-text"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#002112] text-[#96f7be] font-black rounded-full text-xs hover:opacity-95 transition-all cursor-pointer"
              >
                Log Now
              </button>
            </form>
          </div>
        )}

        {weightLoggedSuccess && (
          <p className="text-[10px] text-m3-primary text-center font-bold animate-ping-once">
            ✔️ Weight database successfully refreshed! Syncing vectors.
          </p>
        )}

        {/* Projection Delta Badge Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-m3-surface-container p-3 rounded-[20px] text-center space-y-0.5 border border-m3-outline-variant/5">
            <span className="text-[9px] text-[#96f7be] bg-[#002112] px-2 py-0.5 rounded-full font-mono font-bold block w-fit mx-auto">START BASELINE</span>
            <span className="text-base font-black text-m3-on-surface font-display block pt-1">{keyDeltas.start} kg</span>
          </div>
          <div className="bg-m3-surface-container p-3 rounded-[20px] text-center space-y-0.5 border border-m3-outline-variant/5">
            <span className="text-[9px] text-[#96f7be] bg-m3-primary px-2 py-0.5 rounded-full font-mono font-bold block w-fit mx-auto">TOTAL SHED WEIGHT</span>
            <span className="text-base font-black text-m3-primary font-display block pt-1">-{keyDeltas.total} kg</span>
          </div>
        </div>
      </div>

      {/* 3. 🌙 Evening Prep For Tomorrow & Check Beforehand */}
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-2.5">
          <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
            <Moon className="w-4.5 h-4.5 text-m3-primary" /> 🌙 Evening Prep & Setup
          </h3>
          <span className="text-[10px] text-m3-outline font-black font-mono tracking-wider">
            For {tomorrowPlan.name}
          </span>
        </div>

        <p className="text-[11px] text-m3-on-surface-variant font-medium leading-relaxed">
          Stay on top of things: Complete these nightly tasks before sleeping so tomorrow runs fully on auto-pilot.
        </p>

        <div className="p-3 bg-[#002112] rounded-[22px] text-white space-y-0.5 border border-[#96f7be]/15">
          <span className="text-[8.5px] text-[#96f7be] font-mono tracking-wider font-extrabold block">TOMORROW'S PREVIEW MEAL MATRIX</span>
          <p className="text-xs font-black font-display text-[#96f7be]">{tomorrowPlan.subtitle}</p>
        </div>

        <div className="space-y-2.5 pt-1">
          {tomorrowPreps.map((prep) => {
            const isChecked = !!checkedPreps[prep.id];
            return (
              <div 
                key={prep.id}
                onClick={() => handleTogglePrep(prep.id, prep.title)}
                className={`p-3 rounded-[18px] border transition-all cursor-pointer flex gap-3 items-start ${
                  isChecked 
                    ? "bg-[#eefaf4]/30 border-[#96f7be]/60 opacity-60" 
                    : "bg-m3-surface-container border-m3-outline-variant/10 hover:border-m3-primary/20"
                }`}
              >
                <div className={`mt-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
                  isChecked 
                    ? "bg-m3-primary border-m3-primary text-white" 
                    : "border-m3-outline bg-white"
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[4]" />}
                </div>
                <div className="flex-1 space-y-0.5 text-left">
                  <p className={`text-[11.5px] font-black ${
                    isChecked ? "line-through text-m3-outline decoration-2 font-black" : "text-m3-on-surface"
                  }`}>{prep.title}</p>
                  <p className="text-[10px] text-m3-on-surface-variant leading-relaxed font-medium">
                    {prep.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WATER REMINDER: 5 LITERS Target Gauge */}
      <div className="bg-[#002112] border border-[#96f7be]/15 rounded-[28px] p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 bg-[#96f7be]/15 border border-[#96f7be]/10 px-3 py-1 rounded-full text-[#96f7be] text-[10px] font-black tracking-wide uppercase font-mono">
              <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" /> Constipation Countermeasure
            </div>
            <h3 className="text-sm font-black font-display text-white mt-2 leading-none uppercase font-display">5-Liter Water Reminder</h3>
          </div>
          <span className="text-[10px] bg-sky-500/25 text-white border border-sky-400/30 px-2.5 py-0.5 rounded-full font-mono font-black tracking-wider">
            Hydration Goal
          </span>
        </div>

        <p className="text-[11px] text-[#96f7be]/80 leading-relaxed font-medium mb-4">
          Drink 5 Liters (5,000 ml) daily to flush excess cellular uric acid, relieve GLP-1 induced gut motility blockages, and safeguard renal health.
        </p>

        {/* Dynamic Water filled UI visualizer */}
        <div className="relative h-11 bg-black/30 rounded-full overflow-hidden border border-sky-400/20 mb-4 flex items-center justify-between px-5 font-mono select-none">
          {/* Wave effect animation */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-sky-600/70 to-sky-400/80 transition-all duration-500 ease-out" 
            style={{ width: `${waterProgressPct}%` }}
          />
          <div className="relative z-10 font-bold uppercase text-[10px] text-sky-200">Hydration Progress</div>
          <div className="relative z-10 font-black text-xs text-white">
            {waterIntakeMl} ml / {waterTargetMl} ml ({waterProgressPct}%)
          </div>
        </div>

        {/* Hydration Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleWaterClick(250)}
            className="py-2.5 px-1 bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-sky-200 border border-sky-400/20 text-[10.5px] font-black rounded-full transition-all cursor-pointer text-center"
          >
            +250ml Glass
          </button>
          <button
            type="button"
            onClick={() => handleWaterClick(500)}
            className="py-2.5 px-1 bg-sky-500/20 hover:bg-sky-500/30 active:scale-95 text-sky-200 border border-sky-400/20 text-[10.5px] font-black rounded-full transition-all cursor-pointer text-center"
          >
            +500ml Bottle
          </button>
          <button
            type="button"
            onClick={() => handleWaterClick(1000)}
            className="py-2.5 px-1 bg-sky-500/30 hover:bg-sky-500/40 active:scale-95 text-white border border-sky-400/30 text-[10.5px] font-black rounded-full transition-all cursor-pointer text-center"
          >
            +1 Liter Jar
          </button>
        </div>

        {/* Reset / Subtract option */}
        <div className="flex justify-between items-center text-[10px] text-[#96f7be]/60 mt-3 pt-1 border-t border-[#96f7be]/10">
          <span>Active alert interval: Every 60 mins</span>
          <button
            type="button"
            onClick={() => handleWaterClick(-250)}
            className="hover:text-white cursor-pointer transition-colors"
          >
            (Correct mistake -250ml)
          </button>
        </div>
      </div>

      {/* 5. AFFIRMATIONS TO AVOID ALCOHOL AND JUNK FOOD */}
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-2.5">
          <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
            <Heart className="w-4.5 h-4.5 text-m3-primary" /> Clean Food Shield Affirmations
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={rotateAffirmation}
              className="text-m3-primary hover:opacity-85 cursor-pointer px-2.5 py-1 rounded-full hover:bg-m3-surface-container transition-all flex items-center gap-1 text-[10px] font-black font-mono tracking-tight"
              title="Next Affirmation"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin-hover" /> Next wise
            </button>
          </div>
        </div>

        {/* Affirmation Card Content */}
        <div className="bg-rose-50/55 border-l-4 border-rose-500 rounded-[18px] p-4 relative overflow-hidden">
          <div className="absolute right-2 top-2 text-[45px] text-rose-500/5 select-none font-mono">🧘</div>
          <p className="text-xs text-rose-950 font-black italic ltr leading-relaxed pr-3 select-all">
            "{affirmations[activeAffirmationIndex]}"
          </p>
          <span className="text-[8px] bg-rose-500/15 text-rose-800 font-mono font-bold px-1.5 py-0.5 rounded-md uppercase absolute bottom-2 right-2">
            Mantra {activeAffirmationIndex + 1} of {affirmations.length}
          </span>
        </div>

        {/* Add custom affirmation form */}
        <form onSubmit={handleAddCustomAffirmation} className="space-y-2 mt-1.5 pt-3 border-t border-m3-outline-variant/15">
          <label className="block text-[11px] font-black text-m3-on-surface-variant font-mono uppercase tracking-wider">
            ➕ Add Your Custom Clean-Food Affirmation
          </label>
          <div className="flex gap-1.5 bg-m3-surface-container p-1 rounded-xl border border-m3-outline-variant/10">
            <input
              type="text"
              placeholder="e.g., I respect my titration. No high-grease menus today."
              value={customAffirmationInput}
              onChange={(e) => setCustomAffirmationInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-m3-surface-container-lowest border border-m3-outline-variant/10 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary placeholder:text-m3-outline cursor-text text-m3-on-surface"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#002112] text-[#96f7be] font-black rounded-lg text-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add
            </button>
          </div>
        </form>

        {/* Manage list toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAffirmationsManager(!showAffirmationsManager)}
            className="text-xs font-black text-m3-primary hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAffirmationsManager ? "Hide Avoidance List Manager" : "Manage & Audit Affirmations avoiding Junk / Alcohol"}</span>
          </button>

          {showAffirmationsManager && (
            <div className="mt-3 bg-m3-surface-container p-3.5 rounded-[22px] border border-m3-outline-variant/15 space-y-2 max-h-60 overflow-y-auto scrollbar-thin animate-scale-up">
              <p className="text-[10px] text-m3-outline font-black font-mono tracking-wider uppercase">Active Affirmation Catalog</p>
              <div className="space-y-2">
                {affirmations.map((aff, idx) => {
                  const isPreset = PRESET_AFFIRMATIONS.includes(aff);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActiveAffirmationIndex(idx);
                        triggerToast(`🧘 Switched to avoidance mantra ${idx + 1}`, 'info');
                      }}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-left cursor-pointer transition-all flex items-start gap-2 justify-between ${
                        idx === activeAffirmationIndex 
                          ? "bg-[#eefaf4] border-[#96f7be] text-rose-950 font-black" 
                          : "bg-m3-surface-container-lowest border-m3-outline-variant/10 hover:border-m3-primary/20 text-m3-on-surface-variant"
                      }`}
                    >
                      <span className="flex-1 leading-snug">
                        {idx + 1}. "{aff}" 
                        {isPreset && <span className="ml-1 text-[8px] bg-slate-100 text-slate-500 font-bold px-1 rounded-md uppercase">Preset</span>}
                      </span>
                      {!isPreset && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAffirmation(idx, e)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                          title="Delete Custom Mantra"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-100 p-3 rounded-[18px] text-[10.5px] text-m3-outline leading-normal font-sans border border-m3-outline-variant/10">
          💡 <strong>GLP-1 Gastric Block Note:</strong> Nausea occurs when highly slow-digesting grease sits in the stomach. Avoiding burgers and alcohol cancels 90% of intense side effects immediately!
        </div>
      </div>

      {/* 6. CARDIO & EXERCISE MOTIVATIONS */}
      <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/15 pb-2.5">
          <h3 className="text-xs font-black text-m3-on-surface tracking-wider uppercase flex items-center gap-1.5 font-display">
            <Dumbbell className="w-4.5 h-4.5 text-m3-primary" /> Muscle Defense Motive Feed
          </h3>
          <span className="text-[10px] text-m3-outline font-black font-mono">
            Active Feed
          </span>
        </div>

        <div className="space-y-3">
          {EXERCISE_MOTIVATIONS.map((ex, index) => (
            <div key={index} className="flex gap-3 items-start bg-m3-surface-container-low p-3.5 border border-m3-outline-variant/15 rounded-[18px]">
              <div className="p-2.5 bg-m3-primary-container text-m3-on-primary-container rounded-[16px] flex-shrink-0 mt-0.5">
                <Dumbbell className="w-4 h-4 text-m3-primary" />
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <p className="text-[11.5px] font-black text-[#003922] leading-tight">{ex.title}</p>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 bg-m3-primary/15 text-[#006c47] rounded-md font-black uppercase">
                    {ex.intensity}
                  </span>
                </div>
                <p className="text-[10px] text-m3-on-surface-variant leading-relaxed font-medium">
                  {ex.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⚠️ CLINICAL ALERTS SIMULATOR DRIVER ⚠️ */}
      <div className="bg-[#002112]/95 border border-[#96f7be]/20 rounded-[28px] p-5 text-[#96f7be] shadow-inner space-y-4">
        <div className="flex justify-between items-center border-b border-[#96f7be]/10 pb-2.5">
          <h3 className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5 font-display text-white">
            <Settings className="w-4.5 h-4.5 text-m3-primary animate-spin" /> Reminders & Notification Diagnostic Suite
          </h3>
          <span className="text-[8.5px] bg-m3-primary text-white border border-[#96f7be]/20 px-2 py-0.5 rounded-full font-mono font-black uppercase">
            Simulator
          </span>
        </div>

        <p className="text-[11px] text-white/80 leading-relaxed font-medium">
          Aesthetically verify app notifications and scheduled alarms for high-priority Semaglutide guidelines on demand.
        </p>

        <div className="grid grid-cols-2 gap-2 text-center">
          <button
            type="button"
            onClick={() => handleTestNotification("water")}
            className="p-2 bg-[#00170a] border border-[#96f7be]/10 hover:border-sky-400 text-sky-300 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <Droplet className="w-3.5 h-3.5 shrink-0" /> Water Alert
          </button>
          <button
            type="button"
            onClick={() => handleTestNotification("weight")}
            className="p-2 bg-[#00170a] border border-[#96f7be]/10 hover:border-amber-400 text-amber-300 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5 shrink-0" /> Log Weight
          </button>
          <button
            type="button"
            onClick={() => handleTestNotification("prep")}
            className="p-2 bg-[#00170a] border border-[#96f7be]/10 hover:border-[#96f7be] text-[#96f7be] rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <Moon className="w-3.5 h-3.5 shrink-0" /> Tomorrow Prep
          </button>
          <button
            type="button"
            onClick={() => handleTestNotification("mindset")}
            className="p-2 bg-[#00170a] border border-[#96f7be]/10 hover:border-rose-400 text-rose-300 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 shrink-0" /> Avoid Junk
          </button>
        </div>

        <div className="text-[9.5px] text-[#96f7be]/60 italic font-mono leading-normal text-center pt-1">
          ✓ Alarmer triggers scheduled push reminders to keep you strictly on top of targets.
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { UserProfile, MealItem, AiDietPlan, FoodAnalysisResponse } from "../types";
import { 
  Sparkles, 
  Flame, 
  Utensils, 
  Activity, 
  Search, 
  Droplet, 
  Plus, 
  Heart, 
  Info, 
  Check, 
  Coffee, 
  Apple, 
  X,
  RefreshCw,
  Loader2,
  AlertOctagon,
  TrendingDown,
  BookOpen,
  ChefHat,
  ShoppingBag,
  CheckSquare,
  Square,
  TrendingUp
} from "lucide-react";
import { 
  SEVEN_DAY_PLANS, 
  TITRATION_SCHEDULE, 
  WEIGHT_PROJECTION, 
  PROTEIN_SOURCES, 
  WEEKLY_SHOPPING, 
  COOKING_INTELLIGENCE,
  DayPlan,
  MealPeriod
} from "../clinicalProtocolData";

interface NutritionGuideProps {
  profile: UserProfile;
  dietPlan: AiDietPlan | null;
  onUpdateDietPlan: (plan: AiDietPlan) => void;
  mealLogs: MealItem[];
  onAddMealLog: (meal: MealItem) => void;
  onDeleteMealLog: (id: string) => void;
}

export default function NutritionGuide({ 
  profile, 
  dietPlan, 
  onUpdateDietPlan, 
  mealLogs, 
  onAddMealLog, 
  onDeleteMealLog 
}: NutritionGuideProps) {
  // Navigation Tabs
  const [viewMode, setViewMode] = useState<'clinical' | 'interactive'>('clinical');
  const [clinicalSection, setClinicalSection] = useState<'menu' | 'ambali' | 'titration' | 'protein' | 'shopping'>('menu');

  // Trigger feedback popups
  const [loggedFeedback, setLoggedFeedback] = useState("");

  // Default day is resolved dynamically relative to current weekday
  const weekdaysArr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [activeDay, setActiveDay] = useState<string>(() => {
    const todayIndex = new Date().getDay();
    return weekdaysArr[todayIndex];
  });

  // Checked stores synced with localStorage
  const [shoppingChecked, setShoppingChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("noveltreat_shopping_checked");
    return saved ? JSON.parse(saved) : {};
  });

  const [titrationChecked, setTitrationChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("noveltreat_titration_checked");
    return saved ? JSON.parse(saved) : { "Initiation": true };
  });

  useEffect(() => {
    localStorage.setItem("noveltreat_shopping_checked", JSON.stringify(shoppingChecked));
  }, [shoppingChecked]);

  useEffect(() => {
    localStorage.setItem("noveltreat_titration_checked", JSON.stringify(titrationChecked));
  }, [titrationChecked]);

  // AI Generation States
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  
  // Food Analysis States
  const [foodQuery, setFoodQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  // Custom Manual Add Custom Meal states
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customProt, setCustomProt] = useState("");
  const [customType, setCustomType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const generateAIPerformancePlan = async () => {
    setGenerating(true);
    setGenError("");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: profile.weight,
          height: profile.height,
          gender: profile.gender,
          age: profile.age,
          targetWeight: profile.targetWeight,
          currentDoseLevel: profile.currentDoseLevel,
          sideEffects: []
        }),
      });

      if (!response.ok) {
        throw new Error("Clinical backend server could not compute. Try again.");
      }

      const data = await response.json();
      onUpdateDietPlan(data);
    } catch (err: any) {
      console.error(err);
      setGenError("Could not log into AI Medical Dietitian. Check connection and retry.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim()) return;

    setAnalyzing(true);
    setAnalysisError("");
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodInput: foodQuery,
          currentDoseLevel: profile.currentDoseLevel,
          sideEffects: []
        })
      });

      if (!response.ok) {
        throw new Error("Food Database is temporarily unresponsive.");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError("AI Gastric analyzer failed to evaluate food item security.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddCustomMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const meal: MealItem = {
      id: "meal_" + Date.now(),
      name: customName,
      calories: Number(customCal) || 0,
      protein: Number(customProt) || 0,
      mealType: customType,
      timestamp: new Date().toISOString()
    };

    onAddMealLog(meal);
    setCustomName("");
    setCustomCal("");
    setCustomProt("");
    setShowAddMealForm(false);
  };

  const handleAddAnalyzedMealToLog = () => {
    if (!analysisResult) return;
    
    const meal: MealItem = {
      id: "meal_" + Date.now(),
      name: foodQuery,
      calories: analysisResult.estimatedCalories,
      protein: analysisResult.proteinGrams,
      mealType: 'breakfast',
      timestamp: new Date().toISOString()
    };

    onAddMealLog(meal);
    setFoodQuery("");
    setAnalysisResult(null);
  };

  // Log planned meals directly to intake diary
  const handleLogPlannedMeal = (mealName: string, calories: number, protein: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const meal: MealItem = {
      id: "meal_pla_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: mealName,
      calories,
      protein,
      mealType,
      timestamp: new Date().toISOString()
    };
    onAddMealLog(meal);
    setLoggedFeedback(`Logged ${protein}g protein: "${mealName}"`);
    setTimeout(() => {
      setLoggedFeedback("");
    }, 2500);
  };

  // Toggle Shopping checked elements state
  const handleToggleShopping = (id: string) => {
    setShoppingChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleTitration = (phaseName: string) => {
    setTitrationChecked(prev => ({
      ...prev,
      [phaseName]: !prev[prevDayCheck(phaseName) ? phaseName : phaseName] // just toggler
    }));
  };

  const prevDayCheck = (phaseName: string) => {
    return true; // placeholder mock check
  };

  // Compute calculated values
  const combinedCals = mealLogs.reduce((acc, current) => acc + current.calories, 0);
  const combinedProtein = mealLogs.reduce((acc, current) => acc + current.protein, 0);

  // Filter 7-Day Plans based on Day selection
  const activePlan = SEVEN_DAY_PLANS.find(p => p.day === activeDay) || SEVEN_DAY_PLANS[0];

  // Live Counter for Shopping Checklist
  const totalShoppingItems = WEEKLY_SHOPPING.length;
  const checkedShoppingCount = Object.values(shoppingChecked).filter(Boolean).length;

  return (
    <div className="space-y-4 py-1 relative font-sans">
      {/* Toast feedback notifier */}
      {loggedFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#002112] text-[#96f7be] font-black border border-[#96f7be]/25 py-2.5 px-5 rounded-full text-xs shadow-xl z-55 flex items-center gap-1.5 animate-scale-up">
          <span className="w-2 h-2 rounded-full bg-m3-primary animate-ping"></span>
          <span>{loggedFeedback}</span>
        </div>
      )}

      {/* Primary Intake Dashboard Tracker */}
      <div className="bg-[#002112] border border-[#96f7be]/10 text-[#96f7be] rounded-[28px] p-5 flex justify-between items-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-m3-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[9px] text-[#96f7be] font-mono tracking-wider font-extrabold uppercase">DIGESTIVE Compliance Status</span>
          <div className="text-xl font-black font-display text-white flex items-baseline gap-1 animate-scale-up">
            {combinedCals} <span className="text-xs text-[#96f7be]/80 font-normal">kcal logged</span>
          </div>
          <p className="text-[10px] text-[#96f7be]/80">Protein: <strong className="text-white bg-m3-primary/20 px-1.5 py-0.2 rounded-md">{combinedProtein}g</strong> / 140g target</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddMealForm(true)}
            className="px-4 py-2.5 bg-m3-primary hover:bg-[#008154] active:scale-95 text-white rounded-full cursor-pointer transition-all flex items-center gap-1.5 text-xs font-black"
          >
            <Plus className="w-4 h-4 stroke-[3.5]" /> Food Log
          </button>
        </div>
      </div>

      {/* Add Custom Meal Input Drawer */}
      {showAddMealForm && (
        <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-5 shadow-xs animate-fade-in relative z-20">
          <button 
            type="button"
            onClick={() => setShowAddMealForm(false)} 
            className="absolute top-4 right-4 text-m3-outline hover:text-m3-on-surface p-1 rounded-full hover:bg-m3-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h4 className="text-xs font-black text-m3-on-surface uppercase font-display tracking-wider mb-3">Add Custom Food Intake Log</h4>
          <form onSubmit={handleAddCustomMealSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black text-m3-on-surface-variant uppercase font-mono tracking-tight mb-1.5">Meal Classification</label>
              <div className="grid grid-cols-4 gap-1">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCustomType(type)}
                    className={`py-1.5 rounded-xl text-[10.5px] uppercase font-black text-center border transition-all cursor-pointer ${
                      customType === type 
                        ? "bg-[#002112] border-[#002112] text-[#96f7be]" 
                        : "bg-m3-surface-container-low border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="E.g. Moong Sprouts, Soya Bhurji, Protein Shake"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary cursor-text"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Calories (kcal)"
                value={customCal}
                onChange={(e) => setCustomCal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary cursor-text"
              />
              <input
                type="number"
                placeholder="Protein (grams)"
                value={customProt}
                onChange={(e) => setCustomProt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary cursor-text"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#002112] hover:bg-[#003922] text-[#96f7be] font-black rounded-full text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Save Food Intake
            </button>
          </form>
        </div>
      )}

      {/* Main Dual-View Toggles: High-Protein Clinical Protocol vs AI & Custom Tools */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-m3-surface-container-low border border-m3-outline-variant/15 rounded-full">
        <button
          type="button"
          onClick={() => setViewMode('clinical')}
          className={`py-2 px-1 rounded-full text-center text-xs font-extrabold transition-all duration-250 cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'clinical' 
              ? "bg-[#002112] text-[#96f7be] shadow-xs" 
              : "text-m3-outline hover:text-m3-on-surface"
          }`}
        >
          <ChefHat className="w-4 h-4 text-m3-primary" />
          <span className="font-black font-display text-[11px]">Bariatric Protocol Guide</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('interactive')}
          className={`py-2 px-1 rounded-full text-center text-xs font-extrabold transition-all duration-250 cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'interactive' 
              ? "bg-[#002112] text-[#96f7be] shadow-xs" 
              : "text-m3-outline hover:text-m3-on-surface"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-black font-display text-[11px]">Gastric Bypass Log & AI</span>
        </button>
      </div>

      {/* VIEW PANEL 1: SugarFit Clinical Protocol */}
      {viewMode === 'clinical' && (
        <div className="space-y-3.5">
          {/* Clinical Banner */}
          <div className="bg-[#002112] border border-[#96f7be]/10 rounded-[24px] p-5 text-[#96f7be] space-y-1.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-m3-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center">
              <span className="text-[9px] bg-m3-primary-container text-m3-on-primary-container border border-m3-primary/10 px-2.5 py-0.5 rounded-full font-mono tracking-widest uppercase">
                Approved Patient Copy
              </span>
              <span className="text-[10px] text-[#96f7be]/80 font-black font-mono">SugarFit • Semaglutide</span>
            </div>
            <h2 className="text-sm font-black font-display tracking-tight text-white leading-snug uppercase">SEMAGLUTIDE METABOLIC DIET DOSSIER</h2>
            <div className="grid grid-cols-2 gap-2 text-[10.5px] text-m3-primary-container font-bold">
              <p>🎯 Target Protein: <strong className="text-white">~140g / day</strong></p>
              <p>🔥 Energy Target: <strong className="text-white">&lt; 1400 kcal</strong></p>
            </div>
          </div>

          {/* Internal clinical sub-sections toolbar */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none text-[10.5px]">
            {[
              { id: 'menu', label: '7-Day Plan', icon: Utensils },
              { id: 'ambali', label: 'Millet Ambali', icon: Coffee },
              { id: 'titration', label: 'Titration', icon: TrendingUp },
              { id: 'protein', label: 'Protein Matrix', icon: Heart },
              { id: 'shopping', label: `Shopping (${checkedShoppingCount}/${totalShoppingItems})`, icon: ShoppingBag }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = clinicalSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setClinicalSection(sec.id as any)}
                  className={`py-2 px-3 rounded-full flex items-center gap-1.5 border font-black transition-all whitespace-nowrap cursor-pointer hover:scale-[1.025] ${
                    isActive 
                      ? "bg-[#002112] border-[#002112] text-[#96f7be] shadow-sm transform scale-95" 
                      : "bg-m3-surface-container-low border-m3-outline-variant/20 text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-container"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* sub-section VIEW: 7-DAY MEAL SYSTEM */}
          {clinicalSection === 'menu' && (
            <div className="space-y-3.5 animate-scale-up">
              {/* Day selection pill matrix */}
              <div className="grid grid-cols-7 gap-1 bg-m3-surface-container-low p-1 border border-m3-outline-variant/15 rounded-full">
                {SEVEN_DAY_PLANS.map(plan => {
                  const isSelected = activeDay === plan.day;
                  return (
                    <button
                      key={plan.day}
                      type="button"
                      onClick={() => setActiveDay(plan.day)}
                      className={`py-1.5 rounded-full text-center text-[10.5px] font-black transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-[#002112] text-[#96f7be] font-black shadow-xs" 
                          : "text-m3-outline hover:text-m3-on-surface"
                      }`}
                    >
                      {plan.day}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Stats Card */}
              <div className="bg-m3-surface-container-lowest border border-m3-outline-variant/20 rounded-[28px] p-4.5 space-y-3 shadow-xs">
                <div className="flex justify-between items-baseline border-b border-m3-outline-variant/10 pb-2.5">
                  <div>
                    <h3 className="text-xs font-black text-m3-on-surface font-display">{activePlan.name} Plan</h3>
                    <p className="text-[10px] text-m3-on-surface-variant leading-normal font-sans font-medium">{activePlan.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono block font-black text-m3-primary">{activePlan.totalProtein}g Protein</span>
                    <span className="text-[9.5px] font-mono text-m3-outline font-black">{activePlan.totalCalories} kcal</span>
                  </div>
                </div>

                {/* Day Meals list with Add buttons */}
                <div className="space-y-3 ">
                  {activePlan.meals.map((mealPeriod, idx) => {
                    const combinedMealName = mealPeriod.items.map(i => `${i.name} (${i.quantity})`).join(", ");
                    const mealCals = mealPeriod.items.reduce((acc, current) => acc + current.calories, 0);
                    const mealProt = mealPeriod.items.reduce((acc, current) => acc + current.protein, 0);

                    return (
                      <div key={idx} className="border border-m3-outline-variant/15 bg-m3-surface-container-low/70 p-3.5 rounded-[22px] space-y-3 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-[#eefaf4] text-[#006c47] font-black px-2 py-0.5 rounded-md font-mono uppercase">
                              {mealPeriod.label}
                            </span>
                            <span className="text-[9.5px] text-m3-outline font-black font-mono tracking-tight">{mealPeriod.time}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleLogPlannedMeal(combinedMealName, mealCals, mealProt, mealPeriod.type)}
                            className="bg-m3-primary hover:bg-[#008154] text-white font-extrabold text-[9.5px] px-3 py-1 rounded-full transition-all flex items-center gap-1 shadow-3xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3 h-3 stroke-[3.5]" />
                            <span>Log Intake</span>
                          </button>
                        </div>

                        {/* Ingredients */}
                        <div className="space-y-1.5 pl-0.5">
                          {mealPeriod.items.map((it, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between items-center text-xs">
                              <span className="text-slate-800 font-semibold text-[11px]">{it.name} <b className="text-[10px] text-slate-400 font-normal">({it.quantity})</b></span>
                              <div className="flex gap-2 text-[10px] font-mono text-slate-500 font-bold">
                                <span className="text-[#0f172a]">{it.protein}g P</span>
                                <span>{it.calories} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cooking instructions note */}
                        <p className="text-[10px] leading-relaxed text-slate-500 italic bg-white p-2 rounded-xl border border-slate-100 pl-2">
                           📜 {mealPeriod.note}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* sub-section VIEW: MILLET AMBALI RECIPES */}
          {clinicalSection === 'ambali' && (
            <div className="space-y-3 animate-scale-up text-xs">
              <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-2.5">
                <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  MICROFLORA DEFENSE SYSTEM
                </span>
                <h3 className="text-sm font-black text-slate-800">Fermented Millet Ambali Guide</h3>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
                  Ambali is a traditional fermented millet porridge. High gastric slowing on Semaglutide often triggers severe constipation and acid build-up. Fermented bacteria replenish gut health optimally.
                </p>
                <div className="p-2 border border-amber-100 bg-amber-50 rounded-xl flex items-start gap-1 text-[9.5px] text-amber-900 leading-normal font-medium">
                  <Info className="w-3.5 h-3.5 mt-0.5 text-amber-600 self-start shrink-0" />
                  <p><strong>Clinical Timing Rule:</strong> Drink 300ml daily between 10:00 AM & 10:30 AM only — on a partially empty stomach between breakfast & lunch. Never immediately after a high-protein meal.</p>
                </div>
              </div>

              {/* Ragi Ambali Recipe */}
              <div className="bg-[#fcfdfd] border border-slate-150 p-4 rounded-3xl space-y-2">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-1.5">
                  <h4 className="font-bold text-slate-800 text-[12.5px]">1. Ragi Ambali (Classic)</h4>
                  <span className="text-[10px] font-mono font-bold text-teal-600">~5g Protein | ~145 kcal</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
                  <strong>Ingredients:</strong> 60g ragi (finger millet) flour, 500ml water, salt, roasted jeera powder, hing.
                </p>
                <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 pl-3">
                  <li>Mix ragi flour with 200ml water to a smooth lump-free paste.</li>
                  <li>Bring remaining 300ml water to boil. Add ragi paste slowly while stirring.</li>
                  <li>Cook on low flame 8-10 minutes, stirring continuously until thickened.</li>
                  <li>Remove from heat, cool completely to room temperature.</li>
                  <li>Cover loosely and ferment at room temp for 6-8 hours (or overnight).</li>
                  <li>Thin with cool water, add black salt + jeera + pinch of hing and drink cool.</li>
                </ol>
              </div>

              {/* Kodo Millet Ambali Recipe */}
              <div className="bg-[#fcfdfd] border border-slate-150 p-4 rounded-3xl space-y-2">
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-1.5">
                  <h4 className="font-bold text-slate-800 text-[12.5px]">2. Kodo Millet Ambali (Light)</h4>
                  <span className="text-[10px] font-mono font-bold text-teal-600">~4g Protein | ~120 kcal</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
                  <strong>Ingredients:</strong> 60g kodo millet, 450ml water, black salt, lemon juice, roasted jeera.
                </p>
                <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-100 pl-3">
                  <li>Soak kodo millet in 250ml water overnight (minimum 8 hours).</li>
                  <li>Transfer soaked millet with soaking water to blender.</li>
                  <li>Add 150-200ml fresh water, blend 2 minutes until smooth.</li>
                  <li>Strain through fine muslin cloth or mesh sieve.</li>
                  <li>Season with black salt, lemon juice, and roasted jeera. Drink cool.</li>
                </ol>
              </div>

              {/* WHY AMBALI TABLE */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-3xl space-y-2">
                <span className="text-[9.5px] font-bold text-slate-400 font-mono block uppercase">AMBALI GASTRIC VALUE ADVANTAGE</span>
                <div className="space-y-2 text-[10.5px]">
                  {[
                    { b: "Probiotic Bacteria", desc: "Restores gut flora — counters semaglutide-induced constipation directly." },
                    { b: "Low Glycemic Carbs", desc: "Slow carb release. No blood sugar spike. Sustained energy." },
                    { b: "Pre-digested Starch", desc: "Easier on stomach. Significantly reduces bloating triggers." },
                    { b: "Cooling Effect", desc: "Traditional 'cold food' — counters nausea and acidity side effects." }
                  ].map((row, idx) => (
                    <div key={idx} className="flex gap-2 py-1.5 border-b border-slate-50 last:border-0 pl-1">
                      <div className="w-1/3 font-bold text-slate-800 leading-tight shrink-0">{row.b}</div>
                      <div className="w-2/3 text-slate-500 font-normal leading-normal">{row.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* sub-section VIEW: TITRATION & WEIGHT PROGRESSION */}
          {clinicalSection === 'titration' && (
            <div className="space-y-4 animate-scale-up text-xs">
              {/* Titration table */}
              <div className="bg-white border border-slate-100 rounded-3xl p-3.5 space-y-3">
                <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-widest font-black">1. titration titration steps</span>
                <div className="space-y-2">
                  {TITRATION_SCHEDULE.map(sch => {
                    const isChecked = titrationChecked[sch.phase];
                    return (
                      <div 
                        key={sch.phase}
                        onClick={() => handleToggleTitration(sch.phase)}
                        className={`p-3 rounded-2.5xl border flex gap-3 transition-colors duration-200 cursor-pointer ${
                          isChecked ? "bg-emerald-50/50 border-emerald-100 text-slate-800" : "bg-white border-slate-100 text-slate-500"
                        }`}
                      >
                        <div className="self-start mt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex justify-between items-baseline">
                            <strong className="text-[11.5px] font-bold text-slate-900">{sch.phase} ({sch.weeks})</strong>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{sch.cost}/mo</span>
                          </div>
                          <p className="text-[12px] font-bold text-emerald-700 font-mono">Dose: {sch.dose}</p>
                          <p className="text-[10.5px] text-slate-600 leading-normal font-normal">{sch.effect}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weight projection curves */}
              <div className="bg-white border border-slate-100 rounded-3xl p-3.5 space-y-3">
                <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-widest font-black">2. biometrics target projection</span>
                <div className="space-y-2">
                  {WEIGHT_PROJECTION.map(weightRecord => (
                    <div key={weightRecord.date} className="p-2.5 border border-slate-50 bg-slate-50/40 rounded-2xl flex gap-3 text-xs justify-between">
                      <div className="space-y-0.5 flex-1">
                        <span className="text-[10px] text-slate-400 font-mono tracking-tight font-medium block">{weightRecord.date}</span>
                        <p className="text-slate-900 font-bold text-[11px] leading-snug">{weightRecord.note}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-[#047857] text-[11.5px] font-extrabold font-mono">Target: {weightRecord.target}</p>
                        {weightRecord.totalLoss !== '—' && (
                          <span className="text-[9.5px] text-rose-500 font-bold font-mono">Est loss: -{weightRecord.totalLoss}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* sub-section VIEW: PROTEIN REFERENCE MATRIX */}
          {clinicalSection === 'protein' && (
            <div className="space-y-3 animate-scale-up text-xs">
              <div className="bg-white border border-slate-100 rounded-3xl p-3.5 space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Protein Reference</h3>
                  <p className="text-[9.5px] text-slate-400 leading-normal">Density ranked — optimize every meal around these</p>
                </div>

                <div className="space-y-2.5">
                  {PROTEIN_SOURCES.map(source => (
                    <div key={source.rank} className="p-2.5 border border-slate-50 bg-slate-50/30 rounded-2xl flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10.5px] shrink-0 font-mono mt-0.5">
                        {source.rank}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-slate-800 font-bold text-[11.5px] leading-none">{source.food}</strong>
                          <span className="text-emerald-700 text-[10.5px] font-black font-mono whitespace-nowrap pl-2">
                            {source.protein} <b className="text-[9.5px] text-slate-400 font-normal">per {source.per}</b>
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-mono font-medium leading-none">Calories: {source.kcal}</p>
                        <p className="text-slate-500 text-[10px] leading-relaxed font-normal pt-1 border-t border-slate-50/50">{source.use}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Intelligence cards */}
              <div className="space-y-2">
                <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-widest font-black pl-1">Clinical Prep Masterclasses</span>
                <div className="space-y-2">
                  {COOKING_INTELLIGENCE.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-3.5 rounded-3xl space-y-1 text-xs">
                      <h4 className="font-extrabold text-[#064e3b] text-[11.5px] flex items-center gap-1.5 leading-none">
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        {item.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal pl-5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* sub-section VIEW: SHOPPING CHECKLIST */}
          {clinicalSection === 'shopping' && (
            <div className="space-y-3 animate-scale-up text-xs">
              <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex justify-between items-center">
                  <span>Grocery Checklist</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-mono">
                    {checkedShoppingCount} / {totalShoppingItems} Complete
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal pr-3">
                  This exact listing covers all high-protein ingredients required for the 7-Day SugarFit food schedule. Settle with dry soya and eggs in bulk!
                </p>

                {/* Checklist loop */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-50">
                  {WEEKLY_SHOPPING.map(grocery => {
                    const isChecked = !!shoppingChecked[grocery.id];
                    return (
                      <div 
                        key={grocery.id}
                        onClick={() => handleToggleShopping(grocery.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors duration-150 cursor-pointer ${
                          isChecked ? "bg-slate-50 border-slate-100 text-slate-400 line-through decoration-slate-300" : "bg-white border-slate-100 text-slate-800 hover:bg-slate-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 shrink-0" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[11.5px]">{grocery.name}</span>
                            <span className="text-[9.5px] text-slate-405 block leading-none font-mono font-bold mt-0.5 uppercase tracking-wide">Qty: {grocery.quantity}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 font-extrabold pr-1">{grocery.cost}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#e6f4ea] p-2.5 rounded-2xl flex justify-between text-[11px] font-extrabold text-[#137333] font-mono">
                  <span>ESTIMATED WEEKLY INGREDIENTS COST:</span>
                  <span>~Rs.853</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL 2: AI & INTERACTIVE CLINICAL TOOLS */}
      {viewMode === 'interactive' && (
        <div className="space-y-3">
          {/* AI Gastric Compatibility clearance checks */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 border-b border-gray-50 pb-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-850 tracking-wider uppercase">AI GASTRIC CLEARANCE CHECK</h3>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal font-normal">
              Type any food or planned meal. We evaluate stomach compatibility considering Semaglutide's delayed clearance rate.
            </p>

            <form onSubmit={handleAnalyzeFood} className="flex gap-1.5">
              <input
                type="text"
                placeholder="E.g. Chicken Keema, Fried squid, Greek Salad..."
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-text"
              />
              <button
                type="submit"
                disabled={analyzing || !foodQuery.trim()}
                className="px-3 bg-slate-900 text-emerald-400 border border-slate-900 font-bold hover:bg-slate-800 rounded-xl text-xs flex items-center justify-center cursor-pointer disabled:bg-slate-105 disabled:text-slate-400 disabled:border-transparent disabled:cursor-not-allowed"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Search className="w-4 h-4" />}
              </button>
            </form>

            {analysisError && (
              <p className="p-2 text-[10.5px] bg-rose-50 border border-rose-100 text-rose-800 font-semibold rounded-xl text-center">{analysisError}</p>
            )}

            {analysisResult && (
              <div className="animate-scale-up space-y-3 p-3 rounded-2.5xl border bg-slate-50/50 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-405 font-mono uppercase font-bold">Verdict Check</span>
                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border uppercase ${
                    analysisResult.isSafe === 'safe' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : analysisResult.isSafe === 'caution'
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {analysisResult.isSafe === 'safe' ? "✅ GENTLE & SAFE" : analysisResult.isSafe === 'caution' ? "⚠️ CAUTION TRIGGERS" : "🛑 AVOID TRIGGERS"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white border border-slate-100 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 tracking-tight leading-none mb-0.5">Energy level</p>
                    <p className="text-[12.5px] font-extrabold text-slate-800 leading-none">{analysisResult.estimatedCalories} kcal</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-400 tracking-tight leading-none mb-0.5">Protein volume</p>
                    <p className="text-[12.5px] font-extrabold text-teal-600 leading-none">{analysisResult.proteinGrams} g</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Verdict Note</p>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-normal">
                    {analysisResult.verdict}
                  </p>
                </div>

                {analysisResult.alternativeSuggestion && (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-900 leading-relaxed font-normal">
                    🥗 <strong>Suggested gastric swap:</strong> {analysisResult.alternativeSuggestion}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddAnalyzedMealToLog}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-[10.5px] transition cursor-pointer"
                >
                  Log analyzed item into Intake Logs
                </button>
              </div>
            )}
          </div>

          {/* Clinician-Style AI diet target limits calculator */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-800 tracking-wider">PERSONALIZED THERAPY DIET</h3>
              </div>
              <button
                type="button"
                onClick={generateAIPerformancePlan}
                className="text-[10.5px] font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700 transition cursor-pointer"
                disabled={generating}
              >
                {generating ? <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> : <RefreshCw className="w-3 h-3" />}
                <span>Regen</span>
              </button>
            </div>

            {generating && (
              <div className="py-6 flex flex-col justify-center items-center text-center space-y-2 animate-pulse">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs font-semibold text-slate-700">Generating gastromandala targets...</p>
                <p className="text-[9.5px] text-slate-400">Balancing proteins and stomach load factors.</p>
              </div>
            )}

            {genError && (
              <p className="p-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl text-center font-medium">{genError}</p>
            )}

            {!dietPlan && !generating && (
              <div className="py-5 text-center space-y-3">
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[280px] mx-auto font-normal">
                  You haven't generated your customized clinician-approved diet framework yet. We compute exact protein & bloating threshold limits based on physical parameters.
                </p>
                <button
                  type="button"
                  onClick={generateAIPerformancePlan}
                  className="py-2 px-6 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wide inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-400/20" /> Generate Diet Plan
                </button>
              </div>
            )}

            {dietPlan && !generating && (
              <div className="space-y-4 animate-scale-up">
                {/* Dynamic AI Calculated Target Limits */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50/50 border border-emerald-100/40 p-2 rounded-2xl">
                    <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-tight block">Energy Load</span>
                    <span className="text-[12.5px] font-black text-emerald-800 leading-none">{dietPlan.dailyCalorieTarget} <b className="text-[8.5px] font-medium font-sans text-slate-500">kcal/d</b></span>
                  </div>
                  <div className="bg-teal-50/50 border border-teal-100/40 p-2 rounded-2xl">
                    <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-tight block">Target Protein</span>
                    <span className="text-[12.5px] font-black text-teal-800 leading-none">{dietPlan.dailyProteinTarget} <b className="text-[8.5px] font-medium font-sans text-slate-500">g/d</b></span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100/40 p-2 rounded-2xl">
                    <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-tight block">Hydration</span>
                    <span className="text-[12.5px] font-black text-indigo-800 leading-none">{(dietPlan.dailyWaterTargetMl / 1000).toFixed(1)} <b className="text-[8.5px] font-medium font-sans text-slate-500">L/d</b></span>
                  </div>
                </div>

                {/* Custom Interactive meal suggestions card split */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] text-slate-400 uppercase font-mono font-bold tracking-wider">SUGGESTED CLINICAL PLAN MENU</h4>
                  
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { meal: 'Breakfast Plan', item: dietPlan.mealSuggestions.breakfast, icon: Coffee, bg: "bg-amber-500/10 text-amber-600 border-amber-500/15" },
                      { meal: 'Lunch Plan', item: dietPlan.mealSuggestions.lunch, icon: Utensils, bg: "bg-teal-500/10 text-teal-600 border-teal-500/15" },
                      { meal: 'Dinner Plan', item: dietPlan.mealSuggestions.dinner, icon: Heart, bg: "bg-indigo-500/10 text-indigo-600 border-indigo-500/15" },
                      { meal: 'Snacks Plan', item: dietPlan.mealSuggestions.snacks, icon: Apple, bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15" }
                    ].map((row, idx) => (
                      <div key={idx} className="border border-slate-50 p-2 bg-[#fcfdfd] rounded-2xl flex gap-2 text-xs">
                        <div className={`p-1.5 rounded-lg border flex items-center justify-center self-start h-7 w-7 ${row.bg}`}>
                          <row.icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="flex justify-between items-center leading-none">
                            <strong className="text-slate-800 font-bold text-[11px] block">{row.meal}</strong>
                            <span className="bg-emerald-100 text-emerald-800 text-[8.5px] font-black px-1.5 py-0.2 rounded font-mono">+{row.item.protein}g P</span>
                          </div>
                          <p className="text-slate-700 font-bold text-[10.5px] pt-0.5">{row.item.title}</p>
                          <p className="text-slate-500 text-[10px] leading-relaxed font-normal">{row.item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient tolerance tips */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <h4 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">MEDICINE TOLERANCE CORNER</h4>
                  <div className="space-y-1.5">
                    {dietPlan.keySemaglutideTips.map((tip, idx) => (
                      <div key={idx} className="flex gap-2 text-[10.5px] text-slate-600 leading-relaxed font-normal pr-1">
                        <span className="text-emerald-500 font-black">✔</span>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FIXED FOOTER LOG DISPLAY: Diary items registered */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm relative z-10 text-xs">
        <h3 className="text-xs font-bold text-slate-600 tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-slate-50 pb-1.5 shadow-none justify-between">
          <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-slate-400" /> FOOD INTAKE DIARY TODAY</span>
          <span className="text-[10px] bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded font-mono font-bold">
            Total {combinedProtein}g Protein / 140g Target
          </span>
        </h3>

        {mealLogs.length === 0 ? (
          <p className="text-center font-bold text-slate-400 text-[11px] py-4">Your intake diary is empty. Click "+ Log to Diary" on Any Plan Menu item above!</p>
        ) : (
          <div className="space-y-2">
            {[...mealLogs]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((item) => {
                const hourMin = new Date(item.timestamp).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
                return (
                  <div key={item.id} className="border border-slate-50 bg-slate-50/20 p-2 rounded-2xl flex justify-between items-center text-xs animate-fade-in hover:bg-slate-50/70">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-700 text-[8.5px] font-bold px-1.5 py-0.3 rounded uppercase font-mono tracking-tight leading-none">
                          {item.mealType}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono font-medium">Log: {hourMin}</span>
                      </div>
                      <p className="text-slate-800 font-bold text-[11px] leading-tight pr-4">{item.name}</p>
                      <p className="text-slate-500 text-[9.5px] font-medium leading-none mt-1">
                        📊 Calories: <strong className="text-slate-700">{item.calories} kcal</strong> | Protein: <strong className="text-teal-600 font-bold">{item.protein}g</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteMealLog(item.id)}
                      className="text-slate-350 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer text-center shrink-0 self-center"
                    >
                      <X className="w-4 h-4" />
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

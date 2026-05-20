import React, { useState } from "react";
import { 
  UserProfile, 
  MealItem, 
  InjectionLog, 
  AiDietPlan, 
  WeightRecord 
} from "../types";
import { 
  Flame, 
  Droplet, 
  Plus, 
  Activity, 
  TrendingDown, 
  Calendar, 
  Heart, 
  Check, 
  Coffee, 
  Trophy,
  PlusCircle,
  TrendingUp,
  Scale
} from "lucide-react";

interface DashboardProps {
  profile: UserProfile;
  mealLogs: MealItem[];
  injectionLogs: InjectionLog[];
  dietPlan: AiDietPlan | null;
  weightRecords: WeightRecord[];
  waterIntakeMl: number;
  onUpdateWater: (val: number) => void;
  onAddWeight: (weight: number) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  profile,
  mealLogs,
  injectionLogs,
  dietPlan,
  weightRecords,
  waterIntakeMl,
  onUpdateWater,
  onAddWeight,
  setActiveTab
}: DashboardProps) {
  const [newWeight, setNewWeight] = useState("");
  const [showWeightForm, setShowWeightForm] = useState(false);

  // Targets
  const calorieTarget = dietPlan?.dailyCalorieTarget || 1500;
  const proteinTarget = dietPlan?.dailyProteinTarget || 80;
  const waterTarget = dietPlan?.dailyWaterTargetMl || 2500;

  // Actuals computed from meals log
  const todayCalories = mealLogs.reduce((acc, m) => acc + m.calories, 0);
  const todayProtein = mealLogs.reduce((acc, m) => acc + m.protein, 0);

  // Reminders / inject details
  const getDaysUntilNextInjection = () => {
    if (injectionLogs.length === 0) return null;
    const sorted = [...injectionLogs].sort((a, b) => new Date(b.injectedAt).getTime() - new Date(a.injectedAt).getTime());
    const lastInjected = new Date(sorted[0].injectedAt);
    const nextInjected = new Date(lastInjected.getTime() + 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = nextInjected.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilNextInjection();

  // Biometrics Progress calculations
  const totalWeightLoss = weightRecords.length >= 2 
    ? (weightRecords[0].weight - weightRecords[weightRecords.length - 1].weight).toFixed(1)
    : "0.0";

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;
    onAddWeight(Number(newWeight));
    setNewWeight("");
    setShowWeightForm(false);
  };

  // Advanced weight logging graph helper (Dynamic SVG curves renderer)
  const renderWeightGraph = () => {
    if (weightRecords.length === 0) return null;

    // Ensure sorted chronologically by date
    const sortedWeights = [...weightRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const width = 340;
    const height = 110;
    const padding = 20;

    const weights = sortedWeights.map(w => w.weight);
    const maxW = Math.max(...weights, profile.targetWeight) + 2;
    const minW = Math.min(...weights, profile.targetWeight) - 2;
    const rangeW = maxW - minW || 1;

    const getX = (index: number) => {
      if (sortedWeights.length <= 1) return width / 2;
      return padding + (index * (width - 2 * padding) / (sortedWeights.length - 1));
    };

    const getY = (wVal: number) => {
      return height - padding - ((wVal - minW) * (height - 2 * padding) / rangeW);
    };

    // Build SVG Path points string
    let pathD = "";
    sortedWeights.forEach((record, idx) => {
      const x = getX(idx);
      const y = getY(record.weight);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    // Build Target horizontal line helper
    const targetY = getY(profile.targetWeight);

    return (
      <div className="bg-m3-surface-container-low border border-m3-outline-variant/15 p-3 rounded-[24px] space-y-2 relative overflow-hidden">
        <div className="flex justify-between items-center text-[9.5px] text-m3-outline font-black font-mono tracking-wider">
          <span>WEIGHT LOG MATRIX (kg)</span>
          <span className="text-m3-primary font-bold">Target: {profile.targetWeight} kg</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Target Weight dashed baseline - Warm Tertiary tone */}
          <line 
            x1={padding} 
            y1={targetY} 
            x2={width - padding} 
            y2={targetY} 
            stroke="#10b981" 
            strokeDasharray="3 3" 
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Graph weight curves line */}
          {sortedWeights.length > 1 && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="#006c47" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Points markers */}
          {sortedWeights.map((record, idx) => {
            const x = getX(idx);
            const y = getY(record.weight);
            const labelD = new Date(record.date).toLocaleDateString("en-US", { month: '2-digit', day: '2-digit' });
            return (
              <g key={record.id} className="group">
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4.5" 
                  className="fill-[#006c47] stroke-white stroke-2 cursor-pointer select-none" 
                />
                <text 
                  x={x} 
                  y={y - 8} 
                  fontSize="8.5" 
                  className="fill-m3-on-surface font-black font-mono font-display" 
                  textAnchor="middle"
                >
                  {record.weight}
                </text>
                <text 
                  x={x} 
                  y={height - 2} 
                  fontSize="7.5" 
                  className="fill-m3-outline font-black font-mono" 
                  textAnchor="middle"
                >
                  {labelD}
                </text>
              </g>
            );
          })}
        </svg>

        {sortedWeights.length <= 1 && (
          <p className="absolute inset-0 flex justify-center items-center text-[10.5px] text-m3-outline bg-m3-surface-container-low/85 font-black">
            Track weight once more to compute trend curve.
          </p>
        )}
      </div>
    );
  };

  // Target Achievement percentages
  const waterPct = Math.min(100, Math.round((waterIntakeMl / waterTarget) * 100));
  const caloriePct = Math.min(100, Math.round((todayCalories / calorieTarget) * 100));
  const proteinPct = Math.min(100, Math.round((todayProtein / proteinTarget) * 100));

  return (
    <div className="space-y-4 py-1 animate-fade-in font-sans">
      {/* Quick Injection State Indicator - Expressive Dark M3 Card */}
      <div className="bg-[#002112] text-m3-primary-container rounded-[28px] p-5 border border-[#97f7c1]/10 shadow-md relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
        <div className="absolute top-0 right-0 w-36 h-36 bg-m3-primary/10 rounded-full blur-3xl -z-5 pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-1.5 bg-[#96f7be]/20 border border-[#96f7be]/15 px-3 py-1 rounded-full text-[#96f7be] text-[10.5px] font-mono tracking-wider w-fit font-bold">
            THERAPY LEVEL: {profile.currentDoseLevel} mg/week
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-tight leading-tight font-display text-white">
              {daysLeft === null 
                ? "Initialize Injection Schedule!" 
                : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} until next syringe dose`}
            </h2>
            <p className="text-[11px] text-m3-primary-container/80 font-medium leading-relaxed max-w-[280px]">
              {daysLeft === null 
                ? "Configure your standard dose rotation routine to begin tracking." 
                : "Steady-state therapeutic Semaglutide concentration maintained."}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className="bg-m3-primary hover:bg-[#008154] active:bg-[#005234] text-white font-extrabold px-5 py-2.5 rounded-full text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:scale-[1.03] active:scale-[0.98] duration-200"
          >
            Check titration schedule
          </button>
        </div>
      </div>

      {/* Target Achievement Dashboard Progress Bars - Elegant M3 Soft card */}
      <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/10 pb-2.5">
          <h3 className="text-[11px] font-black text-m3-on-surface-variant uppercase tracking-wider flex items-center gap-1.5 font-display">
            <Activity className="w-4 h-4 text-m3-primary" /> Intake compliance goals
          </h3>
          <span className="text-[9.5px] text-m3-outline font-black font-mono tracking-wide">TODAY</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Calorie Progress */}
          <div className="space-y-2.5 border-r border-m3-outline-variant/10 pr-3">
            <div className="flex justify-between items-baseline">
              <span className="font-extrabold text-m3-on-surface-variant text-[11.5px] flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-600/10" /> Calories
              </span>
              <span className="text-[10px] text-m3-outline tracking-tighter font-mono font-bold">{todayCalories}/{calorieTarget} kcal</span>
            </div>
            
            {/* Visual Custom Progress bar */}
            <div className="w-full bg-m3-surface-container h-3 rounded-full overflow-hidden relative border border-m3-outline-variant/10">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
            <p className="text-[10px] text-m3-outline leading-tight font-medium">
              {caloriePct > 90 ? "⚠️ Calorie limit exceeded." : "Delayed gastric emptying optimal."}
            </p>
          </div>

          {/* Protein Progress */}
          <div className="space-y-2.5 pl-1">
            <div className="flex justify-between items-baseline">
              <span className="font-extrabold text-m3-on-surface-variant text-[11.5px] flex items-center gap-1">
                <Heart className="w-4 h-4 text-m3-primary" /> Proteins
              </span>
              <span className="text-[10px] text-m3-outline tracking-tighter font-mono font-bold">{todayProtein}/{proteinTarget}g</span>
            </div>

            {/* Visual Custom Progress bar */}
            <div className="w-full bg-m3-surface-container h-3 rounded-full overflow-hidden relative border border-m3-outline-variant/10">
              <div 
                className="bg-m3-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <p className="text-[10px] text-m3-outline leading-tight font-medium">
              Proteins density achieved: <b className="text-m3-primary font-black font-mono">{proteinPct}%</b>
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Animated Interactive Fluid Hydration Track Cylinder - M3 Card */}
      <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs grid grid-cols-12 gap-4 items-center">
        {/* Dynamic Water Volume Cylinder Rendering */}
        <div className="col-span-5 flex justify-center">
          <div className="relative w-[76px] h-32 rounded-3xl border-[4px] border-m3-outline-variant bg-m3-surface-container-low overflow-hidden flex flex-col justify-end shadow-inner">
            {/* Ambient Water liquid background layer */}
            <div 
              className="w-full bg-gradient-to-t from-m3-tertiary to-m3-tertiary-container transition-all duration-750 ease-out flex items-center justify-center relative"
              style={{ height: `${waterPct}%` }}
            >
              {waterPct > 0 && (
                <span className="absolute text-[10.5px] text-white font-black font-mono tracking-tight drop-shadow-xs">
                  {waterPct}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-7 space-y-2">
          <div className="space-y-0.5">
            <span className="text-[9px] text-m3-tertiary font-black uppercase tracking-wider block font-mono">HYDRATION ADHERENCE</span>
            <h4 className="text-[14px] font-black text-m3-on-surface font-display">Water Satiety Gauge</h4>
            <p className="text-[10px] text-m3-on-surface-variant leading-relaxed">
              Drinking 2.5L+ prevents severe constipation and minor bariatric nausea.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-extrabold text-m3-outline font-mono block">
              {waterIntakeMl} ml <span className="text-[9.5px] font-bold text-slate-400">/ {waterTarget} ml</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateWater(250)}
              className="py-2 px-3 bg-m3-secondary-container hover:scale-[1.04] text-m3-on-secondary-container text-[10.5px] font-black rounded-full cursor-pointer transition-all flex items-center gap-1 border border-m3-secondary/10"
            >
              <Droplet className="w-3 h-3 text-m3-tertiary" /> +250 ml
            </button>
            <button
              type="button"
              onClick={() => onUpdateWater(500)}
              className="py-2 px-3.5 bg-m3-primary-container hover:scale-[1.04] text-m3-on-primary-container text-[10.5px] font-black rounded-full cursor-pointer transition-all flex items-center gap-1 border border-m3-primary/10"
            >
              <Droplet className="w-3 h-3 text-m3-primary" /> +500 ml
            </button>
            {waterIntakeMl > 0 && (
              <button
                type="button"
                onClick={() => onUpdateWater(-250)}
                className="py-1.5 px-2 text-m3-outline hover:text-m3-on-surface text-[10px] font-black tracking-normal transition-colors"
                title="Reduce logging"
              >
                Undo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Somatic Weights Progressive graph */}
      <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs space-y-3.5">
        <div className="flex justify-between items-center border-b border-m3-outline-variant/10 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-m3-primary" />
            <h3 className="text-xs font-black text-m3-on-surface uppercase tracking-wider font-display">Weight trend progression</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="text-[10px] font-black text-m3-on-secondary-container bg-m3-secondary-container border border-m3-secondary/10 px-3.5 py-1.5 rounded-full hover:opacity-95 transition-all cursor-pointer"
          >
            {showWeightForm ? "Close Tab" : "Log Weight"}
          </button>
        </div>

        {showWeightForm && (
          <form onSubmit={handleWeightSubmit} className="flex gap-1.5 p-1 relative border border-m3-outline-variant/20 rounded-2xl bg-m3-surface-container-low animate-fade-in">
            <input
              type="number"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Record Weight (kg)"
              className="flex-1 px-3.5 py-2 bg-m3-surface-container-lowest border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary cursor-text"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-m3-primary border border-m3-primary/15 hover:opacity-90 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all"
            >
              Add Point
            </button>
          </form>
        )}

        {/* Custom Weight Line Chart */}
        {renderWeightGraph()}

        {/* Biometrics Deviation Overview boxes */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-m3-surface-container-low p-3.5 rounded-[20px] border border-m3-outline-variant/15 flex flex-col justify-between">
            <span className="text-[9.5px] text-m3-on-surface-variant tracking-tight font-bold font-mono">WEIGHT DECREMENT SHIFT</span>
            <div className="text-base font-black text-rose-600 flex items-center gap-1 pt-1 font-display leading-none">
              <TrendingDown className="w-4.5 h-4.5 text-rose-500" /> 
              <span>-{totalWeightLoss} kg</span>
            </div>
          </div>
          
          <div className="bg-m3-surface-container-low p-3.5 rounded-[20px] border border-m3-outline-variant/15 flex flex-col justify-between">
            <span className="text-[9.5px] text-m3-on-surface-variant tracking-tight font-bold font-mono">REMAINING TARGET DEVIATION</span>
            <div className="text-base font-black text-m3-primary flex items-center gap-1 pt-1 font-display leading-none">
              <Trophy className="w-4.5 h-4.5 text-amber-500" />
              <span>
                {weightRecords.length > 0 
                  ? Math.max(0, Number((weightRecords[weightRecords.length - 1].weight - profile.targetWeight).toFixed(1))) 
                  : Number((profile.weight - profile.targetWeight).toFixed(1))} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

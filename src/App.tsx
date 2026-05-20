import { useState, useEffect } from "react";
import AndroidFrame from "./components/AndroidFrame";
import Dashboard from "./components/Dashboard";
import ScheduleTracker from "./components/ScheduleTracker";
import NutritionGuide from "./components/NutritionGuide";
import ProfileSetup from "./components/ProfileSetup";
import DailyBriefing from "./components/DailyBriefing";
import { UserProfile, InjectionLog, MealItem, AiDietPlan, WeightRecord } from "./types";

// BELIEVABLE DEMO PRESETS
const INITIAL_PROFILE: UserProfile = {
  weight: 92.5,
  height: 178,
  gender: "male",
  age: 32,
  targetWeight: 78.0,
  doseDayOfWeek: 1, // Monday
  doseTime: "20:00",
  currentDoseLevel: 0.50,
  startDate: "2026-05-01"
};

const INITIAL_INJECTIONS: InjectionLog[] = [
  {
    id: "inj_1",
    injectedAt: "2026-05-01T20:00:00Z",
    doseMg: 0.25,
    injectionSite: "Left Abdomen (Lower)",
    sideEffects: [],
    notes: "Therapeutic initiation titration level. Felt slightly bloated but overall nominal tolerance."
  },
  {
    id: "inj_2",
    injectedAt: "2026-05-08T20:01:00Z",
    doseMg: 0.25,
    injectionSite: "Right Abdomen (Lower)",
    sideEffects: [{ type: "nausea", severity: 2 }],
    notes: "Felt small wave of queasiness yesterday evening. Digestion took clearly longer."
  },
  {
    id: "inj_3",
    injectedAt: "2026-05-15T20:05:00Z",
    doseMg: 0.50,
    injectionSite: "Left Thigh (Outer)",
    sideEffects: [{ type: "nausea", severity: 3 }, { type: "fatigue", severity: 2 }],
    notes: "Dose titrated up as prescribed. Slight muscle fatigue but standard appetite loss is highly responsive."
  }
];

const INITIAL_WEIGHTS: WeightRecord[] = [
  { id: "w_1", date: "2026-05-01", weight: 92.5 },
  { id: "w_2", date: "2026-05-08", weight: 91.2 },
  { id: "w_3", date: "2026-05-15", weight: 89.9 },
];

const INITIAL_MEALS: MealItem[] = [
  {
    id: "meal_init_1",
    name: "Plain Greek Yogurt & Sliced Blueberries",
    calories: 180,
    protein: 20,
    mealType: "breakfast",
    timestamp: "2026-05-20T08:30:00Z"
  },
  {
    id: "meal_init_2",
    name: "Steamed Cod Fish Fillet & Asparagus Spears",
    calories: 320,
    protein: 32,
    mealType: "lunch",
    timestamp: "2026-05-20T13:15:00Z"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("briefing");

  // Load state or load fallback presets
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("noveltreat_profile");
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [injectionLogs, setInjectionLogs] = useState<InjectionLog[]>(() => {
    const saved = localStorage.getItem("noveltreat_injections");
    return saved ? JSON.parse(saved) : INITIAL_INJECTIONS;
  });

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem("noveltreat_weights");
    return saved ? JSON.parse(saved) : INITIAL_WEIGHTS;
  });

  const [mealLogs, setMealLogs] = useState<MealItem[]>(() => {
    const saved = localStorage.getItem("noveltreat_meals");
    return saved ? JSON.parse(saved) : INITIAL_MEALS;
  });

  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(() => {
    const saved = localStorage.getItem("noveltreat_water_today");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset daily water if date is stale relative to user context
      if (parsed.date === new Date().toISOString().substring(0, 10)) {
        return parsed.amount;
      }
    }
    return 1250; // default initial demo hydration level
  });

  const [dietPlan, setDietPlan] = useState<AiDietPlan | null>(() => {
    const saved = localStorage.getItem("noveltreat_diet_plan");
    return saved ? JSON.parse(saved) : null;
  });

  const [regenRequiredAlert, setRegenRequiredAlert] = useState(false);

  // Auto synchronizers to Client-side LocalStorage
  useEffect(() => {
    localStorage.setItem("noveltreat_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("noveltreat_injections", JSON.stringify(injectionLogs));
  }, [injectionLogs]);

  useEffect(() => {
    localStorage.setItem("noveltreat_weights", JSON.stringify(weightRecords));
  }, [weightRecords]);

  useEffect(() => {
    localStorage.setItem("noveltreat_meals", JSON.stringify(mealLogs));
  }, [mealLogs]);

  useEffect(() => {
    const dataObj = {
      date: new Date().toISOString().substring(0, 10),
      amount: waterIntakeMl
    };
    localStorage.setItem("noveltreat_water_today", JSON.stringify(dataObj));
  }, [waterIntakeMl]);

  useEffect(() => {
    if (dietPlan) {
      localStorage.setItem("noveltreat_diet_plan", JSON.stringify(dietPlan));
    }
  }, [dietPlan]);

  // Handle saving biome modifications
  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    // Auto insert weight logger point if weight values shifted
    if (updated.weight !== profile.weight) {
      handleAddWeightRecord(updated.weight);
    }
  };

  const handleAddInjectionLog = (newLog: InjectionLog) => {
    setInjectionLogs([newLog, ...injectionLogs]);
    // Synchronize latest titration level inside profile setting
    if (newLog.doseMg !== profile.currentDoseLevel) {
      setProfile({
        ...profile,
        currentDoseLevel: newLog.doseMg
      });
    }
  };

  const handleDeleteInjectionLog = (id: string) => {
    setInjectionLogs(injectionLogs.filter(log => log.id !== id));
  };

  const handleAddWeightRecord = (weightVal: number) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const existingIndex = weightRecords.findIndex(w => w.date === todayStr);

    if (existingIndex >= 0) {
      const updated = [...weightRecords];
      updated[existingIndex].weight = weightVal;
      setWeightRecords(updated);
    } else {
      const record: WeightRecord = {
        id: "w_" + Date.now(),
        date: todayStr,
        weight: weightVal
      };
      setWeightRecords([...weightRecords, record]);
    }

    setProfile(prev => ({ ...prev, weight: weightVal }));
  };

  const handleAddMealLog = (meal: MealItem) => {
    setMealLogs([meal, ...mealLogs]);
  };

  const handleDeleteMealLog = (id: string) => {
    setMealLogs(mealLogs.filter(m => m.id !== id));
  };

  const handleUpdateWater = (mlDelta: number) => {
    setWaterIntakeMl(prev => Math.max(0, prev + mlDelta));
  };

  const handleAlertPlanRegen = () => {
    setRegenRequiredAlert(true);
  };

  const handleRegisterDietPlan = (plan: AiDietPlan) => {
    setDietPlan(plan);
    setRegenRequiredAlert(false);
  };

  // Get active screen title
  const getScreenTitle = () => {
    switch (activeTab) {
      case "briefing": return "Daily Clinical Brief";
      case "dashboard": return "Noveltreat Dashboard";
      case "schedule": return "Dose & Side Effects";
      case "nutrition": return "Clinical Diet Guide";
      case "profile": return "Patient Profile";
      default: return "Noveltreat Tracker";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans tracking-tight antialiased selection:bg-emerald-500/30 selection:text-white">
      <div className="w-full">
        <AndroidFrame 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          title={getScreenTitle()}
        >
          {activeTab === "briefing" && (
            <DailyBriefing 
              profile={profile}
              mealLogs={mealLogs}
              injectionLogs={injectionLogs}
              weightRecords={weightRecords}
              waterIntakeMl={waterIntakeMl}
              onUpdateWater={handleUpdateWater}
              onAddWeight={handleAddWeightRecord}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "dashboard" && (
            <Dashboard 
              profile={profile}
              mealLogs={mealLogs}
              injectionLogs={injectionLogs}
              dietPlan={dietPlan}
              weightRecords={weightRecords}
              waterIntakeMl={waterIntakeMl}
              onUpdateWater={handleUpdateWater}
              onAddWeight={handleAddWeightRecord}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "schedule" && (
            <ScheduleTracker 
              profile={profile}
              injectionLogs={injectionLogs}
              onAddLog={handleAddInjectionLog}
              onDeleteLog={handleDeleteInjectionLog}
            />
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-4">
              {regenRequiredAlert && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between animate-pulse text-xs">
                  <span className="font-semibold">⚠️ Biometrics modified! Re-compute AI Diet targets.</span>
                  <button 
                    type="button"
                    onClick={() => setActiveTab("nutrition")}
                    className="text-[10px] uppercase font-black tracking-wider bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg"
                  >
                    View
                  </button>
                </div>
              )}
              
              <NutritionGuide 
                profile={profile}
                dietPlan={dietPlan}
                onUpdateDietPlan={handleRegisterDietPlan}
                mealLogs={mealLogs}
                onAddMealLog={handleAddMealLog}
                onDeleteMealLog={handleDeleteMealLog}
              />
            </div>
          )}

          {activeTab === "profile" && (
            <ProfileSetup 
              profile={profile}
              onSave={handleSaveProfile}
              onPlanRegenRequired={handleAlertPlanRegen}
            />
          )}
        </AndroidFrame>
      </div>
    </div>
  );
}

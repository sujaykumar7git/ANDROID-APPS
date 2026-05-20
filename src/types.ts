export type GenderType = 'male' | 'female' | 'other';

export interface UserProfile {
  weight: number; // in kg
  height: number; // in cm
  gender: GenderType;
  age: number;
  targetWeight: number; // in kg
  doseDayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  doseTime: string; // "HH:MM" format
  currentDoseLevel: number; // in mg, e.g. 0.25, 0.5, 1.0, 1.7, 2.4
  startDate: string; // YYYY-MM-DD
}

export type SideEffectType = 
  | 'nausea' 
  | 'fatigue' 
  | 'headache' 
  | 'constipation' 
  | 'diarrhea' 
  | 'sour_stomach' 
  | 'indigestion' 
  | 'appetite_loss';

export interface SideEffectLog {
  type: string; // predefined type or custom side effect string
  severity: number; // 1 to 5
  duration?: string; // duration experienced, e.g., "30 mins", "All day"
  timeOfDay?: string; // e.g. "Morning", "Afternoon", "Evening", "Night"
  isCustom?: boolean; // flag to distinguish custom items
}

export interface InjectionLog {
  id: string;
  injectedAt: string; // ISO date-time
  doseMg: number;
  injectionSite: string; // e.g. "Left Abdomen", "Right Abdomen", "Left Thigh", "Right Thigh"
  sideEffects: SideEffectLog[];
  notes: string;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string; // ISO string
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntakeMl: number; // ml
  meals: MealItem[];
}

export interface AiDietPlan {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyWaterTargetMl: number;
  mealSuggestions: {
    breakfast: { title: string; protein: number; description: string };
    lunch: { title: string; protein: number; description: string };
    dinner: { title: string; protein: number; description: string };
    snacks: { title: string; protein: number; description: string };
  };
  keySemaglutideTips: string[];
}

export interface FoodAnalysisResponse {
  isSafe: 'safe' | 'caution' | 'avoid';
  proteinGrams: number;
  estimatedCalories: number;
  verdict: string;
  alternativeSuggestion?: string;
}

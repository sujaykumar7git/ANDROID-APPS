import React, { useState } from "react";
import { UserProfile, GenderType } from "../types";
import { 
  User, 
  Weight, 
  Ruler, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";

interface ProfileSetupProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
  onPlanRegenRequired: () => void;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DOSE_LEVELS = [0.25, 0.50, 1.00, 1.70, 2.40];

export default function ProfileSetup({ profile, onSave, onPlanRegenRequired }: ProfileSetupProps) {
  const [weight, setWeight] = useState(profile.weight);
  const [height, setHeight] = useState(profile.height);
  const [gender, setGender] = useState<GenderType>(profile.gender);
  const [age, setAge] = useState(profile.age);
  const [targetWeight, setTargetWeight] = useState(profile.targetWeight);
  const [doseDayOfWeek, setDoseDayOfWeek] = useState(profile.doseDayOfWeek);
  const [doseTime, setDoseTime] = useState(profile.doseTime);
  const [currentDoseLevel, setCurrentDoseLevel] = useState(profile.currentDoseLevel);
  const [startDate, setStartDate] = useState(profile.startDate);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height || !age || !targetWeight) {
      setStatusMsg("⚠️ Please enter all somatic parameters.");
      return;
    }

    onSave({
      weight: Number(weight),
      height: Number(height),
      gender,
      age: Number(age),
      targetWeight: Number(targetWeight),
      doseDayOfWeek,
      doseTime,
      currentDoseLevel,
      startDate
    });

    setStatusMsg("✨ Profile & Dose schedule updated successfully!");
    onPlanRegenRequired(); // Trigger regeneration alert for nutrition plans
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // Helper converters for quick unit reference (Lbs and Feet/Inches)
  const lbsValue = Math.round(weight * 2.20462);
  const targetLbsValue = Math.round(targetWeight * 2.20462);
  const feetVal = Math.floor(height / 30.48);
  const inchVal = Math.round((height % 30.48) / 2.54);

  return (
    <div className="space-y-4 py-2 font-sans animate-fade-in">
      {/* Top Banner - Expressive Forest Header */}
      <div className="bg-[#002112] text-white rounded-[28px] p-5 border border-[#97f7c1]/10 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-m3-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-m3-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-wider uppercase text-[#96f7be] font-mono">Biometrics Input</span>
          </div>
          <h2 className="text-base font-black tracking-tight font-display text-white">NOVELTREAT PERSONALIZER</h2>
          <p className="text-[11.5px] text-[#96f7be]/80 leading-relaxed font-medium mt-1">
            We use somatic parameters and your current weekly injection dose to configure optimal calorie, protein, and side-effect reduction diet matrices.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4.5">
        {/* Soma Parameters Section */}
        <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-m3-on-surface-variant tracking-wider uppercase flex items-center gap-1.5 mb-2 font-display">
            <User className="w-4 h-4 text-m3-primary" /> 1. SOMATIC BASELINE
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Height (cm) */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Ruler className="w-3.5 h-3.5 text-m3-primary" /> Height (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors cursor-text"
                  placeholder="Height in cm"
                />
                <span className="absolute right-3.5 top-3 text-[10px] text-m3-outline font-black font-mono">
                  {feetVal}'{inchVal}"
                </span>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                Age (years)
              </label>
              <input
                type="number"
                min="18"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors cursor-text"
                placeholder="Age"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Current Weight (kg) */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Weight className="w-3.5 h-3.5 text-m3-primary" /> Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors cursor-text"
                  placeholder="Weight in kg"
                />
                <span className="absolute right-3.5 top-3 text-[10px] text-m3-outline font-black font-mono">
                  {lbsValue} lbs
                </span>
              </div>
            </div>

            {/* Target Weight (kg) */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                Target Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors cursor-text"
                  placeholder="Target in kg"
                />
                <span className="absolute right-3.5 top-3 text-[10px] text-m3-outline font-black font-mono">
                  {targetLbsValue} lbs
                </span>
              </div>
            </div>
          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-2 font-mono uppercase tracking-wider">Gender Biological Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['male', 'female', 'other'] as GenderType[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer text-center ${
                    gender === g 
                      ? "bg-[#eefaf4] border-[#006c47] text-[#003922] font-black" 
                      : "bg-m3-surface-container-low border-m3-outline-variant/20 text-m3-on-surface-variant hover:bg-m3-surface-container-high"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Medication Schedule Section */}
        <div className="bg-m3-surface-container-lowest rounded-[28px] p-5 border border-m3-outline-variant/20 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-m3-on-surface-variant tracking-wider uppercase flex items-center gap-1.5 mb-2 font-display">
            <Clock className="w-4 h-4 text-m3-primary" /> 2. INJECTION LOGISTICS
          </h3>

          {/* Current Injection Level */}
          <div>
            <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-2 flex justify-between items-center font-mono uppercase tracking-wider">
              <span>Weekly Noveltreat Dosage</span>
              <span className="bg-[#eefaf4] text-m3-primary text-[10px] font-black px-2.5 py-0.5 rounded-full font-mono">
                {currentDoseLevel} mg / week
              </span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DOSE_LEVELS.map((dose) => (
                <button
                  key={dose}
                  type="button"
                  onClick={() => setCurrentDoseLevel(dose)}
                  className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer text-center ${
                    currentDoseLevel === dose
                      ? "bg-[#002112] border-[#002112] text-[#96f7be] shadow-xs"
                      : "bg-m3-surface-container-low border-m3-outline-variant/20 text-m3-on-surface-variant hover:bg-[#eefaf4]"
                  }`}
                >
                  {dose}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-m3-on-surface-variant mt-2 flex items-start gap-1.5 leading-snug">
              <Info className="w-4 h-4 text-m3-primary flex-shrink-0 mt-0.5" />
              <span>Gradual dose titration reduces intense gastric gastrointestinal side effects.</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-m3-primary" /> First Injection Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors"
              />
            </div>

            {/* Dose Time of Injection */}
            <div>
              <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-1 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-m3-primary" /> Standard Time
              </label>
              <input
                type="time"
                value={doseTime}
                onChange={(e) => setDoseTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-m3-surface border border-m3-outline-variant/30 rounded-xl text-xs font-bold focus:outline-none focus:border-m3-primary transition-colors"
              />
            </div>
          </div>

          {/* Dose Day selection */}
          <div>
            <label className="block text-[11px] font-bold text-m3-on-surface-variant mb-2 font-mono uppercase tracking-wider">Weekly Schedule Injection Day</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DAYS_OF_WEEK.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDoseDayOfWeek(index)}
                  className={`py-1.5 rounded-xl text-[10.5px] font-black border transition-all cursor-pointer text-center ${
                    doseDayOfWeek === index 
                      ? "bg-[#002112] border-[#002112] text-[#96f7be] font-black" 
                      : "bg-m3-surface-container-low border-m3-outline-variant/20 text-m3-on-surface-variant hover:bg-[#eefaf4]"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Trigger Block */}
        <div className="space-y-3 pt-2">
          {statusMsg && (
            <div className="p-3 bg-[#eefaf4] border border-[#96f7be]/30 text-[#003922] text-xs rounded-xl font-bold animate-fade-in text-center shadow-sm">
              {statusMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 px-4 bg-m3-primary hover:bg-[#008154] text-white font-extrabold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md text-xs tracking-widest uppercase hover:scale-[1.01]"
          >
            <Check className="w-5 h-5 text-white stroke-[3.5]" />
            <span>SAVE AND UPDATE SCHEDULE</span>
          </button>
        </div>
      </form>
    </div>
  );
}

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy client generation to prevent startup crash if GEMINI_API_KEY is not defined
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is missing or set to a placeholder.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API: Generate Diet Plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { weight, height, gender, age, targetWeight, currentDoseLevel, sideEffects } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        isMockMode: true,
        message: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.",
        dailyCalorieTarget: Math.round((currentDoseLevel > 1 ? 1600 : 1400)),
        dailyProteinTarget: Math.round(weight * 1.5),
        dailyWaterTargetMl: 2500,
        mealSuggestions: {
          breakfast: {
            title: "Greek Yogurt Berry Bowl",
            protein: 24,
            description: "1 cup and a half of 0% plain Greek yogurt with 1/2 cup fresh raspberries, 1 tablespoon chia seeds. Easy on a sensitive stomach."
          },
          lunch: {
            title: "Seared Lemon Chicken Breast & Steamed Zucchini",
            protein: 35,
            description: "120g grilled skinless chicken breast with a squeeze of fresh lemon, light sea salt, and soft-cooked steamed zucchini slices."
          },
          dinner: {
            title: "Coriander Grilled Salmon with Steamed Asparagus",
            protein: 32,
            description: "110g wild-caught salmon fillet seasoned lightly with herbs. Smaller, nutrient-dense portions digest more comfortably as digestion slows."
          },
          snacks: {
            title: "Hard-boiled Egg & Sliced Cucumber",
            protein: 8,
            description: "One hard-boiled egg offers clean, digestible protein that minimizes acid reflux risks on Semaglutide."
          }
        },
        keySemaglutideTips: [
          "Avoid deep-fried or high-fat foods to significantly minimize Semaglutide-induced nausea.",
          "Stop eating as soon as you feel early satiety. Overeating leads to severe gastric discomfort due to delayed gastric emptying.",
          "Prioritize high-protein items first during meals, as total food capacity is reduced.",
          "Sip water continuously throughout the day rather than chugging it with meals."
        ]
      });
    }

    const sideEffectsStr = sideEffects && sideEffects.length > 0 
      ? sideEffects.map((s: any) => `${s.type} (severity ${s.severity}/5)`).join(", ") 
      : "none";

    const prompt = `Generate a personalized, highly secure dietary guidance and tracking targets for a patient taking Semaglutide (Noveltreat).
    Patient Details:
    - Gender: ${gender}
    - Age: ${age} years
    - Current Weight: ${weight} kg
    - Height: ${height} cm
    - Target Weight: ${targetWeight} kg
    - Current Semaglutide dosage: ${currentDoseLevel} mg/weekly
    - Active side effects: ${sideEffectsStr}

    Ensure targets align perfectly with Semaglutide principles (delayed gastric emptying, maintaining lean muscle mass, preventing severe reflux and nausea). Maintain healthy protein percentages (1.5-2.0g per kg of bodyweight). Keep meals nutrient-dense, small, and non-greasy.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a expert clinical bariatric dietitian and endocrinology nutrition specialist guiding patients on Glp-1 agonist therapy (Semaglutide/Noveltreat). Give actionable, clinical, stomach-friendly food plans.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalorieTarget: { type: Type.INTEGER, description: "Suggested daily calorie goal" },
            dailyProteinTarget: { type: Type.INTEGER, description: "Suggested daily protein target in grams (aim for high lean proteins)" },
            dailyWaterTargetMl: { type: Type.INTEGER, description: "Hydration target in ml, ensuring mitigation of constipation/nausea side effects" },
            mealSuggestions: {
              type: Type.OBJECT,
              properties: {
                breakfast: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    protein: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: "Easy-to-digest, high-protein breakfast idea" }
                  },
                  required: ["title", "protein", "description"]
                },
                lunch: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    protein: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: "Light stomach, nutrient-rich lunch idea" }
                  },
                  required: ["title", "protein", "description"]
                },
                dinner: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    protein: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: "Small, digestible dinner idea to prevent nighttime reflux" }
                  },
                  required: ["title", "protein", "description"]
                },
                snacks: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    protein: { type: Type.INTEGER },
                    description: { type: Type.STRING, description: "High protein, low volume snack suggestion" }
                  },
                  required: ["title", "protein", "description"]
                }
              },
              required: ["breakfast", "lunch", "dinner", "snacks"]
            },
            keySemaglutideTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 4 critical clinical suggestions specifically targeting mitigation of current side effects and general gastric-emptying issues."
            }
          },
          required: ["dailyCalorieTarget", "dailyProteinTarget", "dailyWaterTargetMl", "mealSuggestions", "keySemaglutideTips"]
        }
      }
    });

    const parsedPlan = JSON.parse(response.text.trim());
    res.json(parsedPlan);
  } catch (err: any) {
    console.error("API Error in /api/generate-plan:", err);
    res.status(500).json({ error: err.message || "Failed to generate diet plan using AI." });
  }
});

// API: Analyze Specific Food
app.post("/api/analyze-food", async (req, res) => {
  try {
    const { foodInput, currentDoseLevel, sideEffects } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Friendly safe fallback matching constraints
      const inputLower = (foodInput || "").toLowerCase();
      let isSafe: 'safe' | 'caution' | 'avoid' = 'safe';
      let verdict = "This item is highly suitable: simple, dense in nutrients and low in gut stress.";
      let estCal = 150;
      let estProt = 15;
      let alt = "";

      if (inputLower.includes("pizza") || inputLower.includes("burger") || inputLower.includes("fry") || inputLower.includes("pork") || inputLower.includes("grease") || inputLower.includes("bacon")) {
        isSafe = 'avoid';
        verdict = "Fried, fatty, and greasy foods are very slow to digest. On Semaglutide, this can trigger severe upper abdominal cramping, nausea, and vomiting due to significantly delayed gastric volume emptying.";
        estCal = 450;
        estProt = 12;
        alt = "Opt for a lean Shredded Chicken Wrap with Whole Wheat tortilla, or Air-fried Turkey patties.";
      } else if (inputLower.includes("soda") || inputLower.includes("sweet") || inputLower.includes("cake") || inputLower.includes("sugar") || inputLower.includes("chocolate") || inputLower.includes("beer") || inputLower.includes("alcohol")) {
        isSafe = 'caution';
        verdict = "High refined sugar or carbonation can aggravate bloating, fullness feelings, and acid reflux. Small treats are fine, but listen immediately to satiety limits.";
        estCal = 280;
        estProt = 2;
        alt = "Try zero-sugar greek yogurt with sliced strawberries, or a protein-enhanced warm almond milk.";
      } else if (inputLower.includes("chicken") || inputLower.includes("egg") || inputLower.includes("tofu") || inputLower.includes("yogurt") || inputLower.includes("shake") || inputLower.includes("fish") || inputLower.includes("salmon") || inputLower.includes("tuna")) {
        isSafe = 'safe';
        verdict = "Excellent! High protein content is fundamental to maintaining lean mass on Noveltreat therapies. Lean protein digests gently and maintains satiety safely.";
        estCal = 180;
        estProt = 25;
      }

      return res.status(200).json({
        isMockMode: true,
        message: "Gemini API key is not configured. Returning local intelligence analysis.",
        isSafe,
        proteinGrams: estProt,
        estimatedCalories: estCal,
        verdict,
        alternativeSuggestion: alt
      });
    }

    const sideEffectsStr = sideEffects && sideEffects.length > 0 
      ? sideEffects.map((s: any) => `${s.type} (${s.severity}/5)`).join(", ") 
      : "none";

    const prompt = `Analyze this specific food item: "${foodInput}" for a patient on weekly Semaglutide (Noveltreat) therapy.
    Current Dosage: ${currentDoseLevel} mg/weekly
    Active side effects: ${sideEffectsStr}

    Estimate nutritional values (protein, calories) and provide a strict gastric safety score: 'safe' (highly recommend, easy on stomach, high protein), 'caution' (eat sparingly, watch for bloating/reflux), or 'avoid' (extremely likely to induce nausea, acute vomiting, or diarrhea due to delayed digestion of fats/sugars/crap).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert clinical nutrition specialist. Analyze the food carefully. Keep estimated values scientific. Verdict must focus heavily on GLP-1 slow gastric clearance issues.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.STRING, enum: ["safe", "caution", "avoid"], description: "Visual safety level of food on Semaglutide therapy" },
            proteinGrams: { type: Type.INTEGER, description: "Estimated protein in grams per reasonable serving size" },
            estimatedCalories: { type: Type.INTEGER, description: "Estimated energy in calories per reasonable serving" },
            verdict: { type: Type.STRING, description: "Practical medical-dietary feedback (max 3 sentences) explaining how it impacts the slow stomach clearance, indigestion, or current side effects" },
            alternativeSuggestion: { type: Type.STRING, description: "A high-protein, gentle, clean alternative food if cautions arise, or empty if standard 'safe' food" }
          },
          required: ["isSafe", "proteinGrams", "estimatedCalories", "verdict"]
        }
      }
    });

    res.json(JSON.parse(response.text.trim()));
  } catch (err: any) {
    console.error("API Error in /api/analyze-food:", err);
    res.status(500).json({ error: err.message || "Failed to analyze food." });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

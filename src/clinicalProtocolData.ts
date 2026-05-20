export interface MealRecipe {
  name: string;
  quantity: string;
  protein: number;
  calories: number;
}

export interface MealPeriod {
  label: string;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealRecipe[];
  note: string;
}

export interface DayPlan {
  day: string;
  name: string;
  subtitle: string;
  totalProtein: number;
  totalCalories: number;
  meals: MealPeriod[];
}

export const SEVEN_DAY_PLANS: DayPlan[] = [
  {
    day: "MON",
    name: "Monday",
    subtitle: "Masoor Dal | Soya Keema | Paneer Evening",
    totalProtein: 138,
    totalCalories: 1352,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Masala Bhurji)", quantity: "3 nos", protein: 18, calories: 210 },
          { name: "Egg Whites", quantity: "5 nos", protein: 18, calories: 85 },
          { name: "Onion + Tomato + Green Chilli", quantity: "60g", protein: 1, calories: 20 }
        ],
        note: "Cook as Masala bhurji. Use non-stick pan with a quarter tsp oil only. Add turmeric."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Ragi Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "Drink at room temperature. Season with salt, roasted jeera powder, and a pinch of hing."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Masoor Dal (dry wt)", quantity: "30g", protein: 7, calories: 100 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "Cucumber + Onion Salad", quantity: "100g", protein: 1, calories: 18 }
        ],
        note: "Cook soya and dal together as a delicious mixed curry. Season with jeera-tomato tadka in minimal oil."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Boiled Egg Whites", quantity: "4 nos", protein: 14, calories: 68 },
          { name: "low-fat Paneer (pan-seared)", quantity: "80g", protein: 14, calories: 162 }
        ],
        note: "Sear low-fat paneer cubes in a dry non-stick pan for 2 minutes on each side. Eat with boiled egg whites."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Palak / Mixed Vegetables", quantity: "150g", protein: 4, calories: 55 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "Light Soya-palak sabzi dinner. Finish eating by 8:00 PM."
      }
    ]
  },
  {
    day: "TUE",
    name: "Tuesday",
    subtitle: "Moong Dal | Soya Curry | Paneer Lunch",
    totalProtein: 140,
    totalCalories: 1368,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Omelette)", quantity: "3 nos", protein: 18, calories: 210 },
          { name: "Egg Whites", quantity: "5 nos", protein: 18, calories: 85 },
          { name: "Spinach + Capsicum", quantity: "60g", protein: 2, calories: 20 }
        ],
        note: "Spinach-egg white omelette. A high-iron start. Cook on a slow flame."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Kodo Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "Kodo millet version — lighter on the gut than ragi. Add a pinch of hing if feeling bloated."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Moong Dal (dry wt)", quantity: "50g", protein: 12, calories: 173 },
          { name: "low-fat Paneer (cubed)", quantity: "60g", protein: 11, calories: 122 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "Tomato + Onion Salad", quantity: "100g", protein: 1, calories: 22 }
        ],
        note: "Moong-paneer curry. Add low-fat paneer cubes in the last 5 minutes. Do not overcook."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Boiled Egg Whites", quantity: "5 nos", protein: 18, calories: 85 },
          { name: "Moong Sprouts with Lemon", quantity: "100g", protein: 3, calories: 30 }
        ],
        note: "Sprouts with lemon and pinch of chaat masala. Excellent clean pre-workout snack."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Rajma (cooked)", quantity: "100g", protein: 9, calories: 148 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "Combined Soya-rajma curry. Fasten with batch-cooked rajma from prep day."
      }
    ]
  },
  {
    day: "WED",
    name: "Wednesday",
    subtitle: "Chana Dal | Paneer Bhurji | Egg White Heavy",
    totalProtein: 136,
    totalCalories: 1328,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Scramble)", quantity: "2 nos", protein: 12, calories: 140 },
          { name: "Egg Whites", quantity: "6 nos", protein: 21, calories: 102 },
          { name: "Onion + Tomato + Coriander", quantity: "60g", protein: 1, calories: 20 }
        ],
        note: "Higher egg-white ratio today. Scramble with fresh coriander and green chili."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Ragi Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "Add a pinch of black salt and roasted jeera to today's ragi ambali for variety."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Chana Dal (dry wt)", quantity: "50g", protein: 10, calories: 180 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "Green Salad + Lemon", quantity: "120g", protein: 2, calories: 25 }
        ],
        note: "Chana dal is the slowest digesting dal. Provides excellent steady satiety for 4-5 hours."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "low-fat Paneer bhurji", quantity: "100g", protein: 18, calories: 203 },
          { name: "Onion + Green Chilli", quantity: "30g", protein: 1, calories: 12 }
        ],
        note: "Crumble paneer directly, cook with onion, tomato, and anti-inflammatory turmeric."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Mixed Vegetables (Lauki/Beans)", quantity: "150g", protein: 3, calories: 52 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "The lightest dinner of the week. Clean and basic soya-vegetable sabzi."
      }
    ]
  },
  {
    day: "THU",
    name: "Thursday",
    subtitle: "Mix Dal | Soya + Paneer | Chickpea Dinner",
    totalProtein: 142,
    totalCalories: 1385,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Bhurji)", quantity: "3 nos", protein: 18, calories: 210 },
          { name: "Egg Whites", quantity: "5 nos", protein: 18, calories: 85 },
          { name: "Onion + Tomato + Hing", quantity: "50g", protein: 1, calories: 18 }
        ],
        note: "Classic egg bhurji. Add turmeric and hing which act as gastric anti-inflammatories."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Kodo Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 },
          { name: "Roasted Groundnut Powder", quantity: "10g", protein: 4, calories: 58 }
        ],
        note: "Scatter roasted peanut powder for a robust protein boost of +4g and healthy fats."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Mix Dal (Moong + Masoor)", quantity: "50g", protein: 13, calories: 173 },
          { name: "Soya Chunks (dry wt)", quantity: "30g", protein: 16, calories: 103 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 }
        ],
        note: "Simmer soya chunks right in the boiling dal. This delivers a complete, high-absorption amino acid profile."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Boiled Egg Whites", quantity: "4 nos", protein: 14, calories: 68 },
          { name: "low-fat Paneer (pan-seared)", quantity: "60g", protein: 11, calories: 122 }
        ],
        note: "High protein pre-strength workout boost. Quick, filling, with 25g total clean protein."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Chickpeas (cooked)", quantity: "100g", protein: 9, calories: 164 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "Soya-chana curry. Keep the gravy thin and entirely cream-free."
      }
    ]
  },
  {
    day: "FRI",
    name: "Friday",
    subtitle: "Rajma | Egg White Peak | Paneer Dinner",
    totalProtein: 138,
    totalCalories: 1341,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Omelette)", quantity: "3 nos", protein: 18, calories: 210 },
          { name: "Egg Whites", quantity: "5 nos", protein: 18, calories: 85 },
          { name: "Capsicum + Tomato", quantity: "60g", protein: 1, calories: 20 }
        ],
        note: "Fresh capsicum omelette. Vitamin C from sweet bell peppers boosts clinical iron absorption from eggs."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Ragi Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "End-of-week digestive reset. Probiotic microflora aids stomach health on Semaglutide."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Rajma (overnight cooked)", quantity: "200g", protein: 18, calories: 296 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "Cucumber + Lemon salad", quantity: "100g", protein: 1, calories: 16 }
        ],
        note: "Rajma is loaded with slow-burning complex carbs and high fiber. Cook with zero butter."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Boiled Egg Whites", quantity: "4 nos", protein: 14, calories: 68 },
          { name: "Black Chana (boiled)", quantity: "80g", protein: 7, calories: 131 }
        ],
        note: "Kala chana with a squeeze of fresh lemon and chaat spices. Great walking/strength snack."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "40g", protein: 21, calories: 138 },
          { name: "low-fat Paneer (cubed)", quantity: "60g", protein: 11, calories: 122 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "Paneer-soya sabzi in a light tomato-based broth. Hearty finish to the workweek."
      }
    ]
  },
  {
    day: "SAT",
    name: "Saturday",
    subtitle: "Lentil Reset | Dal-Paneer | Light Dinner",
    totalProtein: 135,
    totalCalories: 1295,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs (Boiled)", quantity: "3 nos", protein: 18, calories: 210 },
          { name: "Egg Whites", quantity: "4 nos", protein: 14, calories: 68 },
          { name: "Tomato + Coriander + Green Chili", quantity: "50g", protein: 1, calories: 16 }
        ],
        note: "Simple weekend breakfast. Boil eggs in advance to reduce morning cooking strain."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Ragi Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "Weekend routine. Garnish with a bit of fresh coriander and a pinch of rock salt."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Masoor Dal (dry wt)", quantity: "50g", protein: 13, calories: 173 },
          { name: "low-fat Paneer (cubed)", quantity: "60g", protein: 11, calories: 122 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "High Fiber Green Salad", quantity: "100g", protein: 1, calories: 22 }
        ],
        note: "Lentil comfort curry. Simmer slow, season with cumin seeds, skip butter."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Boiled Egg Whites", quantity: "4 nos", protein: 14, calories: 68 },
          { name: "Moong Sprouts (steamed)", quantity: "100g", protein: 3, calories: 30 }
        ],
        note: "Clean, protein-rich snack to sustain your saturation before an evening walk."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "50g", protein: 26, calories: 173 },
          { name: "Rajma (cooked)", quantity: "80g", protein: 7, calories: 118 },
          { name: "Cooking Oil (total daily limit)", quantity: "1.5 tsp", protein: 0, calories: 67 }
        ],
        note: "Finish early. Standardize dinner before 8:00 PM to help Semaglutide slow digestion over bedtime."
      }
    ]
  },
  {
    day: "SUN",
    name: "Sunday",
    subtitle: "CHICKEN DAY — 200g Lean Chicken Breast",
    totalProtein: 143,
    totalCalories: 1198,
    meals: [
      {
        label: "Breakfast",
        time: "7:00 AM",
        type: "breakfast",
        items: [
          { name: "Whole Eggs", quantity: "4 nos", protein: 24, calories: 280 },
          { name: "Egg Whites", quantity: "3 nos", protein: 11, calories: 51 },
          { name: "Onion + Tomato + Spices", quantity: "60g", protein: 1, calories: 22 }
        ],
        note: "Slightly larger breakfast on chicken day to support early energy. Extra micronutrients."
      },
      {
        label: "Ambali",
        time: "10:00 AM",
        type: "snack",
        items: [
          { name: "Fermented Kodo Millet Ambali", quantity: "300 ml", protein: 5, calories: 145 }
        ],
        note: "Kodo Version. Provides dynamic enzymes for optimal digestion of incoming heavy meat proteins."
      },
      {
        label: "Lunch",
        time: "1:00 PM",
        type: "lunch",
        items: [
          { name: "Grilled Skinless Chicken Breast", quantity: "120g", protein: 37, calories: 198 },
          { name: "Moong Dal (dry wt)", quantity: "40g", protein: 10, calories: 138 },
          { name: "Whole Wheat Chapati", quantity: "1 no", protein: 3, calories: 90 },
          { name: "Cucumber Salad + Lemon", quantity: "100g", protein: 1, calories: 18 }
        ],
        note: "Grill chicken breast dry under spices (lemon juice, turmeric, cumin, chili). No frying oil."
      },
      {
        label: "Evening Snack",
        time: "4:30 PM",
        type: "snack",
        items: [
          { name: "Sunday Grilled Chicken Breast", quantity: "80g", protein: 25, calories: 132 },
          { name: "Moong Sprouts", quantity: "80g", protein: 2, calories: 24 }
        ],
        note: "Serve chicken warm. Excellent muscle preserve benchmark."
      },
      {
        label: "Dinner",
        time: "7:30 PM",
        type: "dinner",
        items: [
          { name: "Soya Chunks (dry wt)", quantity: "40g", protein: 21, calories: 138 },
          { name: "Mixed Vegetables (dry stir-fry)", quantity: "200g", protein: 4, calories: 70 },
          { name: "Cooking Oil (total daily limit)", quantity: "1 tsp", protein: 0, calories: 45 }
        ],
        note: "Sunday evening digest limit. Soya-veg dry mix. Easy on the stomach."
      }
    ]
  }
];

export const TITRATION_SCHEDULE = [
  { phase: "Initiation", weeks: "Wk 1-4", dose: "0.25 mg", cost: "~Rs.900", effect: "Mild appetite dip, GI settling, nausea common" },
  { phase: "Step 1", weeks: "Wk 5-8", dose: "0.50 mg", cost: "~Rs.1,100", effect: "Stronger satiety, food cravings reduce noticeably" },
  { phase: "Step 2", weeks: "Wk 9-12", dose: "1.00 mg", cost: "~Rs.1,400", effect: "Significant appetite suppression, food noise quietens" },
  { phase: "Step 3", weeks: "Wk 13-16", dose: "1.70 mg", cost: "~Rs.1,700", effect: "Near-maximum effect on hunger and weight" },
  { phase: "Maintenance", weeks: "Wk 17+", dose: "2.40 mg", cost: "~Rs.2,000", effect: "Full therapeutic dose — long-term maintenance" }
];

export const WEIGHT_PROJECTION = [
  { date: "19 May 2026 — Start", target: "137 kg", totalLoss: "—", note: "Protocol begins, Noveltreat 0.25mg" },
  { date: "01 Jul 2026 — 6 weeks", target: "122-125 kg", totalLoss: "12-15 kg", note: "July checkpoint" },
  { date: "19 Aug 2026 — 3 months", target: "110-114 kg", totalLoss: "23-27 kg", note: "Escalate to 1.0mg" },
  { date: "19 Nov 2026 — 6 months", target: "98-103 kg", totalLoss: "34-39 kg", note: "Sub-100 kg milestone" },
  { date: "May 2027 — 1 year", target: "83-88 kg", totalLoss: "49-54 kg", note: "Goal weight range" }
];

export const PROTEIN_SOURCES = [
  { rank: 1, food: "Soya Chunks (dry)", per: "100g", protein: "52g", kcal: "345 kcal", use: "Best clinical vegetarian protein. Exceptionally high density." },
  { rank: 2, food: "Egg White", per: "1 white", protein: "3.6g", kcal: "17 kcal", use: "Standard clinical efficiency factor. High bioavailability." },
  { rank: 3, food: "Chicken Breast (cooked)", per: "100g", protein: "31g", kcal: "165 kcal", use: "Ultra-lean high-density animal protein. Saturday/Sunday focal." },
  { rank: 4, food: "Paneer (low-fat)", per: "100g", protein: "18g", kcal: "203 kcal", use: "Sustained calcium and slow-release casein protein." },
  { rank: 5, food: "Masoor Dal (dry)", per: "100g", protein: "26g", kcal: "346 kcal", use: "Fast cooking speed. Higher protein than typical household pulses." },
  { rank: 6, food: "Moong Dal (dry)", per: "100g", protein: "24g", kcal: "347 kcal", use: "Great gastric clearance score. Extremely easy to digest." },
  { rank: 7, food: "Whole Egg", per: "1 egg", protein: "6g", kcal: "70 kcal", use: "Full essential lipids, choline, vitamin D, and B-complex." },
  { rank: 8, food: "Rajma (cooked)", per: "100g", protein: "9g", kcal: "148 kcal", use: "Starch barrier fibers which delay glucose spike." },
  { rank: 9, food: "Chickpeas (cooked)", per: "100g", protein: "9g", kcal: "164 kcal", use: "Highly versatile legume. Great mixed with evening stir-fries." },
  { rank: 10, food: "Black Chana (cooked)", per: "100g", protein: "9g", kcal: "164 kcal", use: "Rich in plant-based iron and digestive bulk fibers." },
  { rank: 11, food: "Ragi/Kodo Ambali", per: "300ml", protein: "5g", kcal: "145 kcal", use: "Essential fermented probiotic. Corrects constipation." },
  { rank: 12, food: "Moong Sprouts", per: "100g", protein: "3g", kcal: "30 kcal", use: "Extremely low energy load, excellent crunch, mineral-rich." }
];

export const WEEKLY_SHOPPING = [
  { id: "eggs", name: "Eggs (whole)", quantity: "30 nos / week", cost: "Rs. 210" },
  { id: "soya", name: "Soya chunks", quantity: "700g dry / week", cost: "Rs. 85" },
  { id: "paneer", name: "Paneer (low-fat)", quantity: "400g / week", cost: "Rs. 120" },
  { id: "millet", name: "Ragi flour / Kodo millet", quantity: "500g / week", cost: "Rs. 60" },
  { id: "dal", name: "Mix dal (masoor + moong)", quantity: "400g dry / week", cost: "Rs. 60" },
  { id: "rajma", name: "Rajma + Black chana", quantity: "500g dry / week", cost: "Rs. 70" },
  { id: "chickpeas", name: "Chickpeas (kala chana)", quantity: "300g dry / week", cost: "Rs. 40" },
  { id: "chicken", name: "Chicken breast", quantity: "200g — Sunday only", cost: "Rs. 85" },
  { id: "vegetables", name: "Mixed vegetables (seasonal)", quantity: "1.5 kg / week", cost: "Rs. 80" },
  { id: "atta", name: "Whole wheat flour (atta)", quantity: "300g / week", cost: "Rs. 18" },
  { id: "oil", name: "Cooking oil (mustard/groundnut)", quantity: "~100ml / week", cost: "Rs. 25" }
];

export const COOKING_INTELLIGENCE = [
  { title: "Soya Prep Secret", text: "Soak soya chunks 20-25 min in warm water. SQUEEZE hard and repeatedly — remove every drop. This eliminates the raw taste entirely. Never skip this step." },
  { title: "Paneer Without Crumbling", text: "For bhurji: crumble cold paneer directly into pan. For sabzi: dry-sear cubes in non-stick pan 2 min per side before adding to curry. Retains shape perfectly." },
  { title: "Egg White Efficiency", text: "Boil 10 eggs at once. Cool in ice water — yolks separate cleanly. Or buy liquid egg-weight cartons to save separation effort." },
  { title: "Dal Tadka Low-Oil Method", text: "Heat pan dry first. Add jeera and let it pop. Add 1/4 tsp oil NOW (not before). This technique uses 60% less oil than the traditional method with no flavour loss." },
  { title: "Zero-Calorie Flavour", text: "Lemon juice, chaat masala, jeera powder, green chilli, coriander, amchur, hing, haldi, black pepper — all near-zero calorie. Build flavour through spices, not oil." },
  { title: "Ambali Timing Rule", text: "Drink ambali 10:00-10:30 AM only — between breakfast and lunch. Semaglutide slows gastric emptying; ambali's probiotics work best on a partially empty stomach. Never immediately after a protein-heavy meal." }
];

import mealsData from './mealPlanData.json';

export interface Ingredient {
  name: string;
  amount: number;
  unit: 'г' | 'мл' | 'ком';
}

export interface PlanMeal {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
}

export type TaggedMeal = PlanMeal & { type: 'main' | 'snack' };
export type DayPlan = TaggedMeal[];
export type WeekPlan = DayPlan[];

export type MealPlanType = 'high_protein' | 'low_fat' | 'low_carbs' | 'vegetarian' | 'lactose_free';

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = s ^ (s >>> 16);
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const BREAKFAST = mealsData.breakfast as PlanMeal[];
const LUNCH     = mealsData.lunch     as PlanMeal[];
const DINNER    = mealsData.dinner    as PlanMeal[];
const SNACKS    = mealsData.snacks    as PlanMeal[];

// ---------------------------------------------------------------------------
// Plan type filters
// ---------------------------------------------------------------------------

const MEAT_KEYWORDS = [
  'пилешк', 'говедск', 'свинск', 'телешк', 'месо', 'мелено', 'шунка', 'кебап',
  'шницел', 'бутов', 'ролад', 'скара', 'туна', 'риба', 'лосос',
];
const DAIRY_KEYWORDS = [
  'млеко', 'јогурт', 'сирење', 'урда', 'моцарела', 'путер', 'грчки јогурт',
];

function mealText(meal: PlanMeal): string {
  return [meal.name, ...meal.ingredients.map(i => i.name)].join(' ').toLowerCase();
}

function hasMeatIngredient(meal: PlanMeal): boolean {
  const text = mealText(meal);
  return MEAT_KEYWORDS.some(keyword => text.includes(keyword));
}

function hasLactoseIngredient(meal: PlanMeal): boolean {
  const text = mealText(meal);
  return DAIRY_KEYWORDS.some(keyword => text.includes(keyword));
}

function sortByBestForPlan(meals: PlanMeal[], planType: MealPlanType): PlanMeal[] {
  const sorted = [...meals];
  switch (planType) {
    case 'high_protein':
      return sorted.sort((a, b) => (b.protein / Math.max(1, b.kcal)) - (a.protein / Math.max(1, a.kcal)));
    case 'low_fat':
      return sorted.sort((a, b) => a.fat - b.fat);
    case 'low_carbs':
      return sorted.sort((a, b) => a.carbs - b.carbs);
    default:
      return sorted;
  }
}

function scoreSimilarity(base: PlanMeal, candidate: PlanMeal): number {
  const kcalScore = Math.abs(candidate.kcal - base.kcal) / Math.max(1, base.kcal);
  const proteinScore = Math.abs(candidate.protein - base.protein) / Math.max(1, base.protein || 1);
  const carbsScore = Math.abs(candidate.carbs - base.carbs) / Math.max(1, base.carbs || 1);
  const fatScore = Math.abs(candidate.fat - base.fat) / Math.max(1, base.fat || 1);
  return (kcalScore * 1.4) + (proteinScore * 1.2) + carbsScore + fatScore;
}

function filterByPlanType(meals: PlanMeal[], planType: MealPlanType): PlanMeal[] {
  switch (planType) {
    case 'high_protein':
      return meals.filter(m => m.protein >= 20).length >= 2
        ? meals.filter(m => m.protein >= 20)
        : sortByBestForPlan(meals, planType).slice(0, Math.max(3, Math.ceil(meals.length / 2)));
    case 'low_fat':
      return meals.filter(m => m.fat <= 16).length >= 2
        ? meals.filter(m => m.fat <= 16)
        : sortByBestForPlan(meals, planType).slice(0, Math.max(3, Math.ceil(meals.length / 2)));
    case 'low_carbs':
      return meals.filter(m => m.carbs <= 35).length >= 2
        ? meals.filter(m => m.carbs <= 35)
        : sortByBestForPlan(meals, planType).slice(0, Math.max(3, Math.ceil(meals.length / 2)));
    case 'vegetarian':
      return meals.filter(m => !hasMeatIngredient(m)).length >= 2
        ? meals.filter(m => !hasMeatIngredient(m))
        : meals;
    case 'lactose_free':
      return meals.filter(m => !hasLactoseIngredient(m)).length >= 2
        ? meals.filter(m => !hasLactoseIngredient(m))
        : meals;
    default:
      return meals;
  }
}

// ---------------------------------------------------------------------------
// Plan generator – fixed Појадок / Ручек / Вечера + ужинки to fill calorie target
// ---------------------------------------------------------------------------

function generateDayPlan(targetCalories: number, targetProtein: number, seed: number, planType: MealPlanType): DayPlan {
  const breakfastPool = filterByPlanType(BREAKFAST, planType);
  const lunchPool     = filterByPlanType(LUNCH, planType);
  const dinnerPool    = filterByPlanType(DINNER, planType);
  const snackPool     = filterByPlanType(SNACKS, planType);

  const breakfast = seededShuffle(breakfastPool, seed)[0];
  const lunch     = seededShuffle(lunchPool,     seed + 1111)[0];
  const dinner    = seededShuffle(dinnerPool,    seed + 2222)[0];
  const mains     = [breakfast, lunch, dinner];

  // Fill remaining calories with light snacks (Ужинки)
  const mainTotal = mains.reduce((s, m) => s + m.kcal, 0);
  const mainProtein = mains.reduce((s, m) => s + m.protein, 0);
  const snacks: PlanMeal[] = [];
  let snackTotal = 0;
  let snackProtein = 0;
  const snackCandidates = planType === 'high_protein'
    ? sortByBestForPlan(seededShuffle(snackPool, seed + 3333), 'high_protein')
    : seededShuffle(snackPool, seed + 3333);
  for (const snack of snackCandidates) {
    const remaining = (targetCalories - mainTotal) - snackTotal;
    const proteinRemaining = Math.max(0, targetProtein - (mainProtein + snackProtein));
    if (remaining < 80 && proteinRemaining <= 4) break;
    if (snack.kcal > remaining + 150) continue;
    if (proteinRemaining > 0 && snack.protein < 8 && remaining < 220) continue;
    snacks.push(snack);
    snackTotal += snack.kcal;
    snackProtein += snack.protein;
  }

  // Interleave: Оброк 1, Ужинка 1, Оброк 2, Ужинка 2, Оброк 3, Ужинка 3+
  const result: DayPlan = [];
  for (let i = 0; i < mains.length; i++) {
    result.push({ ...mains[i], type: 'main' });
    if (i < snacks.length) result.push({ ...snacks[i], type: 'snack' });
  }
  for (let i = mains.length; i < snacks.length; i++) {
    result.push({ ...snacks[i], type: 'snack' });
  }

  return result;
}

export function getMealReplacement(
  currentMeal: PlanMeal,
  options: {
    planType: MealPlanType;
    seed: number;
    mealType: 'main' | 'snack';
    mainSlot?: 0 | 1 | 2;
    excludeNames?: string[];
  },
): PlanMeal {
  const { planType, seed, mealType, mainSlot, excludeNames = [] } = options;

  const poolByCategory = mealType === 'snack'
    ? SNACKS
    : (mainSlot === 0 ? BREAKFAST : mainSlot === 1 ? LUNCH : DINNER);

  const filteredPool = filterByPlanType(poolByCategory, planType);
  const uniqueCandidates = filteredPool.filter(m =>
    m.name !== currentMeal.name &&
    !excludeNames.includes(m.name),
  );

  const candidates = uniqueCandidates.length > 0
    ? uniqueCandidates
    : filteredPool.filter(m => m.name !== currentMeal.name);

  if (candidates.length === 0) return currentMeal;

  const ranked = [...candidates].sort((a, b) =>
    scoreSimilarity(currentMeal, a) - scoreSimilarity(currentMeal, b),
  );
  const top = ranked.slice(0, Math.min(5, ranked.length));
  return seededShuffle(top, seed)[0];
}

export function generateWeekPlan(
  targetCalories: number,
  seed: number,
  planType: MealPlanType,
  targetProtein = 0,
): WeekPlan {
  return Array.from({ length: 7 }, (_, dayIndex) =>
    generateDayPlan(targetCalories, targetProtein, seed + dayIndex * 997, planType)
  );
}

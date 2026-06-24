import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown, RefreshCw, Sparkles, Beef, Droplets, Wheat, Leaf, MilkOff, Plus } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Profile, ViewType, Meal } from '../types';
import { generateWeekPlan, getMealReplacement } from '../data/mealPlanData';
import type { MealPlanType, WeekPlan, PlanMeal } from '../data/mealPlanData';

interface Props {
  profile: Profile | null;
  userId: string | null;
  meals: Meal[];
  setView: (v: ViewType) => void;
  saveMealPlanPreference: (planType: MealPlanType, seed: number) => Promise<void>;
  addPlannedMealToDailyProgress: (meal: PlanMeal, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => Promise<void>;
}

interface StoredMealPlanPreference {
  userId: string;
  planType: MealPlanType;
  seed: number;
}

const MK_DAYS = ['Понеделник', 'Вторник', 'Среда', 'Четврток', 'Петок', 'Сабота', 'Недела'];
const STORAGE_KEY = 'makfit.mealPlanPreference';

function readStoredPreference(userId: string | null): StoredMealPlanPreference | null {
  if (!userId || typeof window === 'undefined') return null;
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredMealPlanPreference;
    if (!parsed?.userId || parsed.userId !== userId || !parsed?.planType || !parsed?.seed) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredPreference(userId: string | null, planType: MealPlanType, seed: number): void {
  if (!userId || typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, planType, seed }));
}

const PLAN_OPTIONS: { type: MealPlanType; title: string; desc: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  { type: 'high_protein', title: 'Високо протеински', desc: 'Оброци богати со протеини за градење мускули', icon: Beef, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25' },
  { type: 'low_fat', title: 'Ниско мастен', desc: 'Оброци со минимална содржина на масти', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
  { type: 'low_carbs', title: 'Ниски јаглехидрати', desc: 'Оброци со ниска содржина на јаглехидрати', icon: Wheat, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  { type: 'vegetarian', title: 'Вегетаријански', desc: 'Оброци без месо и риба', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  { type: 'lactose_free', title: 'Без лактоза', desc: 'Оброци без млечни производи', icon: MilkOff, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25' },
];

export default function AiMealPlanView({ profile, userId, meals, setView, saveMealPlanPreference, addPlannedMealToDailyProgress }: Props) {
  const [selectedPlanType, setSelectedPlanType] = useState<MealPlanType | null>(() => {
    const stored = readStoredPreference(userId);
    return profile?.mealPlanType ?? stored?.planType ?? null;
  });
  const [seed, setSeed] = useState(() => {
    const stored = readStoredPreference(userId);
    return profile?.mealPlanSeed ?? stored?.seed ?? Date.now();
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationRequestId, setGenerationRequestId] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [displayPlan, setDisplayPlan] = useState<WeekPlan | null>(null);

  const targetCalories = profile?.targetCalories ?? 2000;
  const targetProtein = profile?.targetProtein ?? 0;

  const plan = useMemo(
    () => selectedPlanType ? generateWeekPlan(targetCalories, seed, selectedPlanType, targetProtein) : null,
    [targetCalories, seed, selectedPlanType, targetProtein],
  );

  useEffect(() => {
    if (!plan) {
      setDisplayPlan(null);
      return;
    }
    setDisplayPlan(plan.map(day => day.map(meal => ({ ...meal }))));
  }, [plan]);

  useEffect(() => {
    if (!profile) return;
    if (profile.mealPlanType && profile.mealPlanSeed) {
      setSelectedPlanType(profile.mealPlanType);
      setSeed(profile.mealPlanSeed);
      writeStoredPreference(userId, profile.mealPlanType, profile.mealPlanSeed);
      return;
    }
    const stored = readStoredPreference(userId);
    if (stored) {
      setSelectedPlanType(stored.planType);
      setSeed(stored.seed);
    }
  }, [profile, userId]);

  useEffect(() => {
    if (!selectedPlanType || generationRequestId === 0) return;
    setIsGenerating(true);
    setExpandedDay(null);
    const t = setTimeout(() => setIsGenerating(false), 1300);
    return () => clearTimeout(t);
  }, [generationRequestId, selectedPlanType]);

  const handleSelectPlan = async (type: MealPlanType) => {
    const nextSeed = Date.now();
    setSelectedPlanType(type);
    setSeed(nextSeed);
    setGenerationRequestId(nextSeed);
    writeStoredPreference(userId, type, nextSeed);
    await saveMealPlanPreference(type, nextSeed);
  };

  const handleRegenerate = async () => {
    if (!selectedPlanType) return;
    const nextSeed = Date.now();
    setSeed(nextSeed);
    setGenerationRequestId(nextSeed);
    writeStoredPreference(userId, selectedPlanType, nextSeed);
    await saveMealPlanPreference(selectedPlanType, nextSeed);
  };

  const handleBack = () => {
    setView('dashboard');
  };

  const handleChangePlan = () => {
    setSelectedPlanType(null);
    setDisplayPlan(null);
    setExpandedDay(null);
  };

  const handleSwapMeal = (dayIndex: number, mealIndex: number, mainSlot?: 0 | 1 | 2) => {
    if (!selectedPlanType || !displayPlan) return;

    const day = displayPlan[dayIndex];
    const currentMeal = day[mealIndex];
    const replacement = getMealReplacement(currentMeal, {
      planType: selectedPlanType,
      seed: Date.now() + dayIndex * 131 + mealIndex * 17,
      mealType: currentMeal.type,
      mainSlot,
      excludeNames: day.map(m => m.name),
    });

    setDisplayPlan(prev => {
      if (!prev) return prev;
      return prev.map((d, di) => {
        if (di !== dayIndex) return d;
        return d.map((m, mi) => {
          if (mi !== mealIndex) return m;
          return { ...replacement, type: m.type };
        });
      });
    });
  };

  const getMainSlot = (day: WeekPlan[number], mealIndex: number): 0 | 1 | 2 => {
    return (day.slice(0, mealIndex + 1).filter(x => x.type === 'main').length - 1) as 0 | 1 | 2;
  };

  const mapToDailyMealType = (mealType: 'main' | 'snack', mainSlot?: 0 | 1 | 2): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    if (mealType === 'snack') return 'snack';
    if (mainSlot === 0) return 'breakfast';
    if (mainSlot === 1) return 'lunch';
    return 'dinner';
  };

  const isMealAlreadyAdded = (meal: PlanMeal, dailyMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): boolean => {
    return meals.some(loggedMeal =>
      loggedMeal.type === dailyMealType &&
      loggedMeal.items?.some(item => item.food?.name === meal.name),
    );
  };

  return (
    <motion.div
      key="mealplan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 pt-10 pb-36 safe-area-pt space-y-6"
      style={{ minHeight: '100dvh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 bg-zinc-900 rounded-xl active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">План за исхрана</h2>
        </div>
        {selectedPlanType && (
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2 bg-zinc-900 rounded-xl active:scale-90 transition-all disabled:opacity-40"
          >
            <RefreshCw size={18} className={cn(isGenerating && 'animate-spin')} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedPlanType ? (
          /* Plan type selection */
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Избери тип на план</h3>
              <p className="text-sm text-zinc-500">Одбери го планот кој најмногу ти одговара</p>
            </div>

            <div className="space-y-3">
              {PLAN_OPTIONS.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.type}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleSelectPlan(opt.type)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border transition-all active:scale-[0.98]',
                      opt.border,
                    )}
                  >
                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', opt.bg)}>
                      <Icon size={22} className={opt.color} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm">{opt.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <ChevronDown size={16} className="text-zinc-600 -rotate-90" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Sparkles size={28} className="text-purple-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-purple-500/10 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-bold text-base mb-1">Се генерира планот…</p>
              <p className="text-sm text-zinc-500">Прилагодуваме оброци според твојата цел</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-400"
                  style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </motion.div>
        ) : displayPlan ? (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Selected plan type badge */}
            <div className="flex items-center gap-2">
              {(() => {
                const opt = PLAN_OPTIONS.find(o => o.type === selectedPlanType)!;
                const Icon = opt.icon;
                return (
                  <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border', opt.bg, opt.border)}>
                    <Icon size={14} className={opt.color} />
                    <span className={cn('text-xs font-bold', opt.color)}>{opt.title}</span>
                  </div>
                );
              })()}
            </div>

            {displayPlan.map((day, dayIndex) => {
              const totalKcal = day.reduce((s, m) => s + m.kcal, 0);
              const totalP    = day.reduce((s, m) => s + m.protein, 0);
              const totalC    = day.reduce((s, m) => s + m.carbs, 0);
              const totalF    = day.reduce((s, m) => s + m.fat, 0);
              const isOpen    = expandedDay === dayIndex;
              const mealLabels = (() => {
                let m = 0, s = 0;
                return day.map(meal => meal.type === 'main' ? `Оброк ${++m}` : `Ужинка ${++s}`);
              })();

              return (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
                >
                  {/* Day header */}
                  <button
                    onClick={() => setExpandedDay(isOpen ? null : dayIndex)}
                    className="w-full flex items-center justify-between px-5 py-4 active:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-xs font-black text-purple-400">
                        {dayIndex + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-semibold text-sm">{MK_DAYS[dayIndex]}</p>
                        <p className="text-[10px] text-zinc-500">{day.length} оброци</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-400">{totalKcal.toLocaleString()} ккал</span>
                      <ChevronDown
                        size={16}
                        className={cn('text-zinc-500 transition-transform duration-200', isOpen && 'rotate-180')}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 space-y-4">
                          <div className="h-px bg-zinc-800" />

                          {day.map((meal, mealIndex) => {
                            const mainSlot = meal.type === 'main' ? getMainSlot(day, mealIndex) : undefined;
                            const dailyMealType = mapToDailyMealType(meal.type, mainSlot);
                            const alreadyAdded = isMealAlreadyAdded(meal, dailyMealType);
                            return (
                            <div key={mealIndex} className="space-y-1">
                              {/* Meal label + kcal */}
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  'text-[10px] font-black uppercase tracking-wider',
                                  meal.type === 'main' ? 'text-purple-400' : 'text-amber-400',
                                )}>
                                  {mealLabels[mealIndex]}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-emerald-400">{meal.kcal} ккал</span>
                                  <button
                                    onClick={async () => {
                                      if (alreadyAdded) return;
                                      await addPlannedMealToDailyProgress(meal, dailyMealType);
                                      setView('dashboard');
                                    }}
                                    disabled={alreadyAdded}
                                    className={cn(
                                      'p-1.5 rounded-lg active:scale-90 transition-transform',
                                      alreadyAdded
                                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300',
                                    )}
                                    title={alreadyAdded ? 'Веќе е додадено' : 'Додај во дневен прогрес'}
                                    aria-label={alreadyAdded ? 'Веќе е додадено' : 'Додај во дневен прогрес'}
                                  >
                                    <Plus size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleSwapMeal(dayIndex, mealIndex, mainSlot)}
                                    disabled={alreadyAdded}
                                    className={cn(
                                      'p-1.5 rounded-lg active:scale-90 transition-transform',
                                      alreadyAdded
                                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
                                    )}
                                    title={alreadyAdded ? 'Веќе е додадено' : 'Замени оброк'}
                                    aria-label={alreadyAdded ? 'Веќе е додадено' : 'Замени оброк'}
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                </div>
                              </div>
                              {/* Meal name */}
                              <p className="font-semibold text-sm">{meal.name}</p>
                              {/* Ingredients */}
                              <p className="text-[11px] text-zinc-500 leading-relaxed">
                                {meal.ingredients.map(ing => `${ing.name} ${ing.amount}${ing.unit}`).join(' · ')}
                              </p>
                              {/* Macros */}
                              <p className="text-[11px] text-zinc-600">
                                П {meal.protein}г · Ј {meal.carbs}г · М {meal.fat}г
                              </p>
                              {mealIndex < day.length - 1 && (
                                <div className="h-px bg-zinc-800 mt-3" />
                              )}
                            </div>
                          );})}

                          {/* Day totals */}
                          <div className="h-px bg-zinc-800" />
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Вкупно</span>
                            <div className="flex gap-3 text-[11px] font-bold">
                              <span className="text-emerald-400">{totalKcal} ккал</span>
                              <span className="text-blue-400">П {totalP}г</span>
                              <span className="text-amber-400">Ј {totalC}г</span>
                              <span className="text-pink-400">М {totalF}г</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            <button
              onClick={handleChangePlan}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 active:scale-[0.98] transition-transform"
            >
              Промени план за исхрана
            </button>

            <p className="text-center text-xs text-zinc-600 pt-2 flex items-center justify-center gap-1">
              Притисни <RefreshCw size={10} /> за нов план
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

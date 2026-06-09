export type BadgeIconKey = 'meal' | 'photo' | 'weight' | 'streak' | 'protein' | 'planner' | 'discipline' | 'consistency' | 'theme';

export interface BadgeMetrics {
  allMealsCount: number;
  photosCount: number;
  weightCount: number;
  unlockedThemesCount: number;
  streak: number;
  daysProteinHit: number;
  plannedMealsAddedWeek: number;
  totalPlannedMeals: number;
  completedMonthly: number;
  completedYearly: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  shortLabel: string;
  icon: BadgeIconKey;
  accent: 'emerald' | 'cyan' | 'amber' | 'orange' | 'rose' | 'violet' | 'sky';
  unlock: (metrics: BadgeMetrics) => boolean;
}

export interface BadgeWithState extends Omit<BadgeDefinition, 'unlock'> {
  unlocked: boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-meal',
    title: 'Прв оброк',
    shortLabel: 'M1',
    icon: 'meal',
    accent: 'emerald',
    unlock: m => m.allMealsCount > 0,
  },
  {
    id: 'first-photo',
    title: 'Прва слика',
    shortLabel: 'P1',
    icon: 'photo',
    accent: 'cyan',
    unlock: m => m.photosCount > 0,
  },
  {
    id: 'first-weight',
    title: 'Прво мерење',
    shortLabel: 'W1',
    icon: 'weight',
    accent: 'amber',
    unlock: m => m.weightCount > 0,
  },
  {
    id: 'streak-3',
    title: 'Streak 3 дена',
    shortLabel: 'S3',
    icon: 'streak',
    accent: 'orange',
    unlock: m => m.streak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Streak 7 дена',
    shortLabel: 'S7',
    icon: 'streak',
    accent: 'orange',
    unlock: m => m.streak >= 7,
  },
  {
    id: 'streak-14',
    title: 'Streak 14 дена',
    shortLabel: 'S14',
    icon: 'streak',
    accent: 'orange',
    unlock: m => m.streak >= 14,
  },
  {
    id: 'streak-30',
    title: 'Streak 30 дена',
    shortLabel: 'S30',
    icon: 'streak',
    accent: 'orange',
    unlock: m => m.streak >= 30,
  },
  {
    id: 'protein-5',
    title: '5x протеин цел',
    shortLabel: 'PR5',
    icon: 'protein',
    accent: 'rose',
    unlock: m => m.daysProteinHit >= 5,
  },
  {
    id: 'protein-10',
    title: '10x протеин цел',
    shortLabel: 'PR10',
    icon: 'protein',
    accent: 'rose',
    unlock: m => m.daysProteinHit >= 10,
  },
  {
    id: 'protein-30',
    title: '30x протеин цел',
    shortLabel: 'PR30',
    icon: 'protein',
    accent: 'rose',
    unlock: m => m.daysProteinHit >= 30,
  },
  {
    id: 'protein-50',
    title: '50x протеин цел',
    shortLabel: 'PR50',
    icon: 'protein',
    accent: 'rose',
    unlock: m => m.daysProteinHit >= 50,
  },
  {
    id: 'protein-100',
    title: '100x протеин цел',
    shortLabel: 'PR100',
    icon: 'protein',
    accent: 'rose',
    unlock: m => m.daysProteinHit >= 100,
  },
  {
    id: 'week-planner',
    title: 'Неделен планер',
    shortLabel: 'WP',
    icon: 'planner',
    accent: 'violet',
    unlock: m => m.plannedMealsAddedWeek >= 10,
  },
  {
    id: 'month-machine',
    title: 'Месечна дисциплина',
    shortLabel: 'MM',
    icon: 'discipline',
    accent: 'sky',
    unlock: m => m.completedMonthly >= 3,
  },
  {
    id: 'year-persistence',
    title: 'Годишна конзистентност',
    shortLabel: 'YC',
    icon: 'consistency',
    accent: 'sky',
    unlock: m => m.completedYearly >= 3,
  },
  {
    id: 'planner-25',
    title: '25 план оброци',
    shortLabel: 'PL25',
    icon: 'planner',
    accent: 'violet',
    unlock: m => m.totalPlannedMeals >= 25,
  },
  {
    id: 'planner-50',
    title: '50 план оброци',
    shortLabel: 'PL50',
    icon: 'planner',
    accent: 'violet',
    unlock: m => m.totalPlannedMeals >= 50,
  },
  {
    id: 'planner-100',
    title: '100 план оброци',
    shortLabel: 'PL100',
    icon: 'planner',
    accent: 'violet',
    unlock: m => m.totalPlannedMeals >= 100,
  },
  {
    id: 'planner-250',
    title: '250 план оброци',
    shortLabel: 'PL250',
    icon: 'planner',
    accent: 'violet',
    unlock: m => m.totalPlannedMeals >= 250,
  },
  {
    id: 'photo-5',
    title: '5 прогрес фотографии',
    shortLabel: 'PH5',
    icon: 'photo',
    accent: 'cyan',
    unlock: m => m.photosCount >= 5,
  },
  {
    id: 'photo-12',
    title: '12 прогрес фотографии',
    shortLabel: 'PH12',
    icon: 'photo',
    accent: 'cyan',
    unlock: m => m.photosCount >= 12,
  },
  {
    id: 'photo-30',
    title: '30 прогрес фотографии',
    shortLabel: 'PH30',
    icon: 'photo',
    accent: 'cyan',
    unlock: m => m.photosCount >= 30,
  },
  {
    id: 'weight-30',
    title: '30 мерења',
    shortLabel: 'WG30',
    icon: 'weight',
    accent: 'amber',
    unlock: m => m.weightCount >= 30,
  },
  {
    id: 'weight-100',
    title: '100 мерења',
    shortLabel: 'WG100',
    icon: 'weight',
    accent: 'amber',
    unlock: m => m.weightCount >= 100,
  },
  {
    id: 'weight-200',
    title: '200 мерења',
    shortLabel: 'WG200',
    icon: 'weight',
    accent: 'amber',
    unlock: m => m.weightCount >= 200,
  },
  {
    id: 'theme-unlock-1',
    title: 'Balanced Green',
    shortLabel: 'BG',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 1,
  },
  {
    id: 'theme-unlock-2',
    title: 'Midnight Focus',
    shortLabel: 'MF',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 2,
  },
  {
    id: 'theme-unlock-3',
    title: 'Sunrise Motivation',
    shortLabel: 'SM',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 3,
  },
  {
    id: 'theme-unlock-4',
    title: 'Fresh Nutrition',
    shortLabel: 'FN',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 4,
  },
  {
    id: 'theme-unlock-5',
    title: 'Neon XP',
    shortLabel: 'NX',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 5,
  },
  {
    id: 'theme-unlock-6',
    title: 'Beast Mode Red',
    shortLabel: 'BR',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 6,
  },
  {
    id: 'theme-unlock-7',
    title: 'Protein Power',
    shortLabel: 'PP',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 7,
  },
  {
    id: 'theme-unlock-8',
    title: 'Elite Gold',
    shortLabel: 'EG',
    icon: 'theme',
    accent: 'violet',
    unlock: m => m.unlockedThemesCount >= 8,
  },
];

export function buildBadges(metrics: BadgeMetrics): BadgeWithState[] {
  return BADGE_DEFINITIONS.map(def => ({
    id: def.id,
    title: def.title,
    shortLabel: def.shortLabel,
    icon: def.icon,
    accent: def.accent,
    unlocked: def.unlock(metrics),
  }));
}

export function getBadgesByIds(ids: string[]): BadgeWithState[] {
  const deduped = Array.from(new Set(ids));
  return deduped
    .map(id => {
      const def = BADGE_DEFINITIONS.find(b => b.id === id);
      if (!def) return null;
      return {
        id: def.id,
        title: def.title,
        shortLabel: def.shortLabel,
        icon: def.icon,
        accent: def.accent,
        unlocked: true,
      } as BadgeWithState;
    })
    .filter((badge): badge is BadgeWithState => badge !== null);
}

export type ThemeId =
  | 'balanced-green'
  | 'neon-xp'
  | 'beast-mode-red'
  | 'elite-gold'
  | 'midnight-focus'
  | 'sunrise-motivation'
  | 'fresh-nutrition'
  | 'protein-power';

export interface ThemeDefinition {
  id: ThemeId;
  title: string;
  subtitle: string;
  cost: number;
  premium: boolean;
}

export const DEFAULT_THEME_ID: ThemeId = 'midnight-focus';

export const THEMES: ThemeDefinition[] = [
  {
    id: 'balanced-green',
    title: 'Balanced Green',
    subtitle: 'Natural Wellness Theme',
    cost: 500,
    premium: true,
  },
  {
    id: 'midnight-focus',
    title: 'Midnight Focus',
    subtitle: 'Default Dark Theme',
    cost: 500,
    premium: true,
  },
  {
    id: 'sunrise-motivation',
    title: 'Sunrise Motivation',
    subtitle: 'Morning Habit Theme',
    cost: 500,
    premium: true,
  },
  {
    id: 'fresh-nutrition',
    title: 'Fresh Nutrition',
    subtitle: 'Beginner-Friendly Theme',
    cost: 500,
    premium: true,
  },
  {
    id: 'neon-xp',
    title: 'Neon XP',
    subtitle: 'Gamified Theme',
    cost: 1000,
    premium: true,
  },
  {
    id: 'beast-mode-red',
    title: 'Beast Mode Red',
    subtitle: 'High Energy Theme',
    cost: 1000,
    premium: true,
  },
  {
    id: 'protein-power',
    title: 'Protein Power',
    subtitle: 'Gym Identity Theme',
    cost: 1000,
    premium: true,
  },
  {
    id: 'elite-gold',
    title: 'Elite Gold',
    subtitle: 'Reward Theme',
    cost: 1000,
    premium: true,
  },
];

export function isThemeId(value: string | undefined | null): value is ThemeId {
  if (!value) return false;
  return THEMES.some(theme => theme.id === value);
}

export function getThemeById(themeId: ThemeId): ThemeDefinition {
  return THEMES.find(theme => theme.id === themeId) || THEMES[0];
}

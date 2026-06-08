export const LEVEL_XP_TOTALS = [
  0,
  1000,
  3000,
  7000,
  13000,
  22000,
  35000,
  52000,
  75000,
  105000,
  145000,
  195000,
  260000,
  340000,
  440000,
  560000,
  670000,
  770000,
  850000,
  1000000,
] as const;

export const MAX_LEVEL = LEVEL_XP_TOTALS.length;

export function getLevelFromPoints(points: number): number {
  const safePoints = Math.max(0, points);
  for (let i = LEVEL_XP_TOTALS.length - 1; i >= 0; i -= 1) {
    if (safePoints >= LEVEL_XP_TOTALS[i]) return i + 1;
  }
  return 1;
}

export function getLevelProgress(points: number): {
  level: number;
  pointsToNextLevel: number;
  progressPct: number;
} {
  const safePoints = Math.max(0, points);
  const level = getLevelFromPoints(safePoints);

  if (level >= MAX_LEVEL) {
    return {
      level,
      pointsToNextLevel: 0,
      progressPct: 100,
    };
  }

  const currentLevelStart = LEVEL_XP_TOTALS[level - 1];
  const nextLevelStart = LEVEL_XP_TOTALS[level];
  const levelSpan = Math.max(1, nextLevelStart - currentLevelStart);
  const pointsIntoLevel = Math.max(0, safePoints - currentLevelStart);

  return {
    level,
    pointsToNextLevel: Math.max(0, nextLevelStart - safePoints),
    progressPct: Math.min(100, (pointsIntoLevel / levelSpan) * 100),
  };
}

import challengeItemsRaw from './challengeItems.json';

export type ChallengeSection = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ChallengeSwapRecord {
  section: ChallengeSection;
  periodKey: string;
  fromChallengeId: string;
  toChallengeId: string;
  date?: string;
}

export interface ChallengeItem {
  id: string;
  title: string;
  progress: number;
  target: number;
  rangeMode?: boolean;
}

interface ChallengeItemDefinition {
  id: string;
  title: string;
  progressKey: string;
  target?: number;
  targetKey?: string;
  targetMultiplier?: number;
  rangeMode?: boolean;
}

interface ChallengeItemsSchema {
  displayCounts: Record<ChallengeSection, number>;
  daily: ChallengeItemDefinition[];
  weekly: ChallengeItemDefinition[];
  monthly: ChallengeItemDefinition[];
  yearly: ChallengeItemDefinition[];
}

const challengeItems = challengeItemsRaw as ChallengeItemsSchema;

export function getChallengeDisplayCount(section: ChallengeSection): number {
  return challengeItems.displayCounts[section] ?? 3;
}

function resolveTarget(def: ChallengeItemDefinition, metrics: Record<string, number>): number {
  if (typeof def.target === 'number') return def.target;
  if (def.targetKey) {
    const base = metrics[def.targetKey] ?? 0;
    const multiplier = def.targetMultiplier ?? 1;
    return Math.max(1, Math.round(base * multiplier));
  }
  return 1;
}

export function buildChallengePool(section: ChallengeSection, metrics: Record<string, number>): ChallengeItem[] {
  const definitions = challengeItems[section] ?? [];
  return definitions.map(def => ({
    id: def.id,
    title: def.title,
    progress: Math.round(metrics[def.progressKey] ?? 0),
    target: resolveTarget(def, metrics),
    rangeMode: def.rangeMode,
  }));
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pickChallengeSet(pool: ChallengeItem[], periodKey: string, count = 3): ChallengeItem[] {
  return pool
    .map((challenge, idx) => ({
      challenge,
      score: hashString(`${periodKey}:${challenge.id}:${idx}`),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.min(count, pool.length))
    .map(x => x.challenge);
}

export function applyChallengeSwaps(
  currentChallenges: ChallengeItem[],
  rankedPool: ChallengeItem[],
  swaps: ChallengeSwapRecord[],
  section: ChallengeSection,
  periodKey: string,
): ChallengeItem[] {
  const visibleChallenges = [...currentChallenges];
  const relevantSwaps = [...swaps]
    .filter(swap => swap.section === section && swap.periodKey === periodKey)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  relevantSwaps.forEach(swap => {
    const fromIndex = visibleChallenges.findIndex(challenge => challenge.id === swap.fromChallengeId);
    if (fromIndex === -1 || visibleChallenges.some(challenge => challenge.id === swap.toChallengeId)) {
      return;
    }

    const replacement = rankedPool.find(challenge => challenge.id === swap.toChallengeId);
    if (!replacement) return;

    visibleChallenges[fromIndex] = replacement;
  });

  return visibleChallenges;
}

export type CommunityStats = {
  /** Players who toppled all eight today. */
  players: number;
  /** Players who started today's chain. */
  started: number;
  /** Median number of pushes among the players who finished. */
  median: number;
  hist: Record<string, number>;
  /** Share of the starters who toppled all eight. */
  toppledPercent: number;
};

const DAY_MS = 86400000;

const counts = (histogram: Readonly<Record<string, string | number>>): Array<[number, number]> =>
  Object.entries(histogram)
    .map(([key, value]) => [Number(key), Number(value)] as [number, number])
    .filter(([score, count]) => Number.isFinite(score) && Number.isFinite(count) && count > 0)
    .sort((a, b) => a[0] - b[0]);

export const summarize = (
  histogram: Readonly<Record<string, string | number>>,
  players: number,
  started: number
): CommunityStats => {
  const rows = counts(histogram);
  const hist = Object.fromEntries(rows);
  const median = medianOf(rows);
  const toppledPercent = started > 0 ? Math.min(100, Math.round((players / started) * 100)) : 0;
  return { players, started, median, hist, toppledPercent };
};

const medianOf = (rows: ReadonlyArray<[number, number]>): number => {
  const total = rows.reduce((sum, [, count]) => sum + count, 0);
  if (total === 0) return 0;
  let cumulative = 0;
  for (const [score, count] of rows) {
    cumulative += count;
    if (cumulative * 2 >= total) return score;
  }
  return rows[rows.length - 1]?.[0] ?? 0;
};

/** Longest run of consecutive days in a list of ISO days (UTC). */
export const longestStreak = (days: readonly string[]): number => {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    const gap = previous === null ? Number.POSITIVE_INFINITY : (Date.parse(day) - Date.parse(previous)) / DAY_MS;
    run = gap === 1 ? run + 1 : 1;
    previous = day;
    best = Math.max(best, run);
  }
  return best;
};

/** Push buckets shown in the community chart: 2..5 then 6 and more. */
export const pushBuckets = (histogram: Readonly<Record<string, string | number>>): Array<[string, number]> => {
  const rows = counts(histogram);
  const buckets = new Map<string, number>();
  for (const [score, count] of rows) {
    const key = score >= 6 ? '6+' : String(score);
    buckets.set(key, (buckets.get(key) ?? 0) + count);
  }
  return [...buckets.entries()].sort((a, b) => {
    const left = a[0] === '6+' ? 99 : Number(a[0]);
    const right = b[0] === '6+' ? 99 : Number(b[0]);
    return left - right;
  });
};

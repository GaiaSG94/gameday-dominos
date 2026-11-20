export type Fall = 'right' | 'left' | 'across';

export type ChainShape = {
  fall: readonly Fall[];
  gaps: readonly boolean[];
};

export type Chain = {
  day: string;
  number: number;
  fall: Fall[];
  gaps: boolean[];
  positions: number[];
  par: number;
};

export type PublicChain = {
  day: string;
  number: number;
  fall: Fall[];
  gaps: boolean[];
  positions: number[];
};

export type Board = {
  down: boolean[];
  rank: number[];
  pushed: boolean[];
};

export type ReplayResult = {
  ok: boolean;
  pushes: number;
  order: number[];
  board: Board;
};

export const PIECES = 8;
export const LINKS = 7;
export const SPACING = 42;
const EPOCH_DAY = '2026-01-01';

export const dayKeyUTC = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export const chainNumber = (day: string): number =>
  Math.floor((Date.parse(`${day}T00:00:00.000Z`) - Date.parse(`${EPOCH_DAY}T00:00:00.000Z`)) / 86400000) + 1;

export const dailySeed = (day: string): number => {
  let hash = 2166136261;
  const input = 'dominos:' + day;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Positions on the floor: spacing doubles at a gap (the gap you see is the gap you get). */
export const layout = (gaps: readonly boolean[]): number[] => {
  const positions: number[] = [0];
  for (let i = 1; i < PIECES; i++) {
    const step = gaps[i - 1] ? SPACING * 2 : SPACING;
    positions.push((positions[i - 1] ?? 0) + step);
  }
  return positions;
};

export const emptyBoard = (): Board => ({
  down: Array.from({ length: PIECES }, () => false),
  rank: Array.from({ length: PIECES }, () => 0),
  pushed: Array.from({ length: PIECES }, () => false),
});

/**
 * Push `start` (must be standing): it falls in its own direction and the
 * cascade follows the direction of each piece that receives the hit.
 * A cascade stops on a gap, the edge of the line, an `across` piece
 * (it falls aside, hits no one) or an already lying piece.
 * Returns the newly fallen indices, in fall order.
 */
export const cascadeFrom = (shape: ChainShape, down: readonly boolean[], start: number): number[] => {
  const fallen: number[] = [];
  if (start < 0 || start >= PIECES) return fallen;
  if (down[start]) return fallen;
  fallen.push(start);
  let current = start;
  for (;;) {
    const dir = shape.fall[current];
    if (dir !== 'right' && dir !== 'left') break;
    const next = dir === 'right' ? current + 1 : current - 1;
    if (next < 0 || next >= PIECES) break;
    const gapIndex = dir === 'right' ? current : next;
    if (shape.gaps[gapIndex]) break;
    if (down[next] || fallen.includes(next)) break;
    fallen.push(next);
    current = next;
  }
  return fallen;
};

const downFromMask = (mask: number): boolean[] =>
  Array.from({ length: PIECES }, (_, i) => (mask & (1 << i)) === 0);

const cascadeMask = (shape: ChainShape, mask: number, start: number): number => {
  const fallen = cascadeFrom(shape, downFromMask(mask), start);
  let next = mask;
  for (const index of fallen) next &= ~(1 << index);
  return next;
};

/** Minimum number of pushes to topple all eight (DP over the 2^8 standing masks). */
export const minPushes = (shape: ChainShape): number => {
  const memo = Array.from({ length: 1 << PIECES }, () => -1);
  memo[0] = 0;
  const solve = (mask: number): number => {
    const cached = memo[mask];
    if (cached !== undefined && cached >= 0) return cached;
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i < PIECES; i++) {
      if ((mask & (1 << i)) === 0) continue;
      const cost = 1 + solve(cascadeMask(shape, mask, i));
      if (cost < best) best = cost;
    }
    memo[mask] = best;
    return best;
  };
  return solve((1 << PIECES) - 1);
};

/** Replays a push order: every push must target a standing piece, all eight must end down. */
export const replayOrder = (shape: ChainShape, order: unknown): ReplayResult => {
  const board = emptyBoard();
  const clean: number[] = [];
  if (!Array.isArray(order)) return { ok: false, pushes: 0, order: clean, board };
  for (const raw of order) {
    if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0 || raw >= PIECES) {
      return { ok: false, pushes: 0, order: clean, board };
    }
    if (board.down[raw]) return { ok: false, pushes: 0, order: clean, board };
    clean.push(raw);
    board.pushed[raw] = true;
    const fallen = cascadeFrom(shape, board.down, raw);
    for (const index of fallen) {
      board.down[index] = true;
      board.rank[index] = board.rank.filter((value) => value > 0).length + 1;
    }
  }
  return { ok: board.down.every(Boolean), pushes: clean.length, order: clean, board };
};

const FALLBACK_FALL: Fall[] = ['right', 'left', 'right', 'across', 'right', 'right', 'left', 'across'];
const FALLBACK_GAPS: boolean[] = [false, false, false, true, false, false, false];

/** Fixed board used when no draw satisfies the constraints. */
export const fallbackShape = (): ChainShape => ({
  fall: [...FALLBACK_FALL],
  gaps: [...FALLBACK_GAPS],
});

const fallbackChain = (day: string): Chain => ({
  day,
  number: chainNumber(day),
  fall: [...FALLBACK_FALL],
  gaps: [...FALLBACK_GAPS],
  positions: layout(FALLBACK_GAPS),
  par: minPushes({ fall: FALLBACK_FALL, gaps: FALLBACK_GAPS }),
});

const drawFall = (rand: () => number): Fall[] => {
  const fall: Fall[] = [];
  for (let i = 0; i < PIECES; i++) {
    const roll = rand();
    fall.push(roll < 0.4 ? 'right' : roll < 0.8 ? 'left' : 'across');
  }
  return fall;
};

const drawGaps = (rand: () => number): boolean[] => {
  const gaps: boolean[] = [];
  for (let i = 0; i < LINKS; i++) gaps.push(rand() < 0.18);
  return gaps;
};

/** Daily chain, identical for everyone: 2 <= par <= 4, at least one across, at least one gap. */
export const generateChain = (day: string): Chain => {
  const rand = mulberry32(dailySeed(day));
  for (let attempt = 0; attempt < 100; attempt++) {
    const fall = drawFall(rand);
    const gaps = drawGaps(rand);
    const shape = { fall, gaps };
    const par = minPushes(shape);
    if (par >= 2 && par <= 4 && fall.includes('across') && gaps.includes(true)) {
      return { day, number: chainNumber(day), fall, gaps, positions: layout(gaps), par };
    }
  }
  return fallbackChain(day);
};

/** Client view of the chain: directions and gaps are visible on the board, the par never leaves the server. */
export const publicView = (chain: Chain): PublicChain => ({
  day: chain.day,
  number: chain.number,
  fall: [...chain.fall],
  gaps: [...chain.gaps],
  positions: [...chain.positions],
});

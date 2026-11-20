export type Vec = readonly [number, number];
export type Pt = readonly [number, number];

/* Constants identical to the Encre boards (planches/v2/encre/*.html). */
export const C = 0.866;
export const S = 0.5;
export const T = 9;
export const W = 24;
export const H = 46;

export const LIGHT_DIR: Vec = [-0.707, 0.707];
export const SHADOW_DIR: Vec = [0.707, -0.707];
export const SHADOW_LEN = 1.1;
export const BLUR = 5;
export const GRAIN = 0.6;
export const GRAIN_TINT = 0.25;
export const GRAIN_ALPHA = 0.16;
export const TOP = '#2b2723';
export const TOP_SELECTED = '#3a332d';
export const SIDE_LIGHT = '#1d1a17';
export const SIDE_DARK = '#0b0a09';
export const POOL = '#ffffff';
export const POOL_ALPHA = 0.6;

export const pr = (x: number, y: number, z: number): Pt => [(x - y) * C, (x + y) * S - z];

/** Screen direction of a world direction on the floor (same projection as pr). */
export const screenDir = (d: Vec): Pt => [(d[0] - d[1]) * C, (d[0] + d[1]) * S];

export const pts = (list: readonly Pt[]): string =>
  list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const hx = (color: string): number => parseInt(color.slice(1), 16);

export const mix = (a: string, b: string, t: number): string => {
  const left = hx(a);
  const right = hx(b);
  const channel = (shift: number): number =>
    Math.round(((left >> shift) & 255) * (1 - t) + ((right >> shift) & 255) * t);
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
};

export type Box = {
  c: Pt;
  d: Pt;
  n: Pt;
  a: number;
  b: number;
  z1: number;
  f: [Pt, Pt, Pt, Pt];
};

export const box = (cx: number, cy: number, d: Vec, a: number, b: number, z1: number): Box => {
  const n: Pt = [-d[1], d[0]];
  const at = (sa: number, sb: number): Pt => [
    cx + sa * a * d[0] + sb * b * n[0],
    cy + sa * a * d[1] + sb * b * n[1],
  ];
  return { c: [cx, cy], d, n, a, b, z1, f: [at(1, 1), at(1, -1), at(-1, -1), at(-1, 1)] };
};

const cross = (o: Pt, u: Pt, v: Pt): number =>
  (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);

export const hull = (points: readonly Pt[]): Pt[] => {
  const sorted = [...points].sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const lower: Pt[] = [];
  const upper: Pt[] = [];
  for (const point of sorted) {
    while (lower.length > 1) {
      const last = lower[lower.length - 1];
      const before = lower[lower.length - 2];
      if (last === undefined || before === undefined) break;
      if (cross(before, last, point) <= 0) lower.pop();
      else break;
    }
    lower.push(point);
  }
  for (const point of [...sorted].reverse()) {
    while (upper.length > 1) {
      const last = upper[upper.length - 1];
      const before = upper[upper.length - 2];
      if (last === undefined || before === undefined) break;
      if (cross(before, last, point) <= 0) upper.pop();
      else break;
    }
    upper.push(point);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
};

/** Long blurred shadow cast to the right: the "cascade" motif. */
export const shadowPoints = (b: Box): string => {
  const length = b.z1 * SHADOW_LEN;
  const foot: Pt[] = [
    ...b.f,
    ...b.f.map((q): Pt => [q[0] + SHADOW_DIR[0] * length, q[1] + SHADOW_DIR[1] * length]),
  ];
  return pts(hull(foot).map((q) => pr(q[0], q[1], 0)));
};

export type Shape =
  | { kind: 'side'; points: string; fill: string }
  | { kind: 'top'; points: string; fill: string }
  | { kind: 'groove'; x1: number; y1: number; x2: number; y2: number };

const grooveFor = (b: Box, q0: Pt, q1: Pt): Shape => {
  const mid: Pt = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2];
  const k = 0.8;
  const e0: Pt = [mid[0] + (q0[0] - mid[0]) * k, mid[1] + (q0[1] - mid[1]) * k];
  const e1: Pt = [mid[0] + (q1[0] - mid[0]) * k, mid[1] + (q1[1] - mid[1]) * k];
  const a0 = pr(e0[0], e0[1], b.z1 / 2);
  const a1 = pr(e1[0], e1[1], b.z1 / 2);
  return { kind: 'groove', x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1] };
};

/** Lacquered faces of a box: lit sides, top face, engraved groove on the wide faces. */
export const faces = (b: Box, topFill: string, withGroove: boolean): Shape[] => {
  const shapes: Shape[] = [];
  const sides: Array<[number, number, Pt]> = [
    [0, 1, b.d],
    [2, 3, [-b.d[0], -b.d[1]]],
    [1, 2, [-b.n[0], -b.n[1]]],
    [3, 0, b.n],
  ];
  for (const [i, j, normal] of sides) {
    if (normal[0] + normal[1] <= 0.001) continue;
    const q0 = b.f[i];
    const q1 = b.f[j];
    if (q0 === undefined || q1 === undefined) continue;
    const t = Math.max(0, Math.min(1, 0.5 - 0.5 * (normal[0] * LIGHT_DIR[0] + normal[1] * LIGHT_DIR[1])));
    shapes.push({
      kind: 'side',
      points: pts([
        pr(q0[0], q0[1], 0),
        pr(q1[0], q1[1], 0),
        pr(q1[0], q1[1], b.z1),
        pr(q0[0], q0[1], b.z1),
      ]),
      fill: mix(SIDE_LIGHT, SIDE_DARK, t),
    });
    const aligned = Math.abs(normal[0] * b.d[0] + normal[1] * b.d[1]);
    if (withGroove && Math.abs(aligned - 1) < 0.01) shapes.push(grooveFor(b, q0, q1));
  }
  shapes.push({
    kind: 'top',
    points: pts(b.f.map((q) => pr(q[0], q[1], b.z1))),
    fill: topFill,
  });
  return shapes;
};

const GRID: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  5: [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 0]],
  6: [[-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1]],
  7: [[-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1], [0, 0]],
  8: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
};

export type FacePips = {
  discs: Pt[];
  radius: number;
  spinner: Pt;
  divider: [Pt, Pt];
};

/** Pips of a lying domino: the count is the rank of the fall, on one half of the face. */
export const facePips = (b: Box, rank: number): FacePips => {
  const g = W * 0.27;
  const r = W * 0.1;
  const center = b.a / 2;
  const cell = (u: number, v: number): Pt =>
    pr(b.c[0] + u * b.d[0] + v * b.n[0], b.c[1] + u * b.d[1] + v * b.n[1], b.z1);
  const discs = (GRID[rank] ?? []).map(([i, j]) => cell(center + i * g, j * g));
  const e0: Pt = [b.c[0] + b.n[0] * b.b * 0.8, b.c[1] + b.n[1] * b.b * 0.8];
  const e1: Pt = [b.c[0] - b.n[0] * b.b * 0.8, b.c[1] - b.n[1] * b.b * 0.8];
  return {
    discs,
    radius: r,
    spinner: cell(0, 0),
    divider: [pr(e0[0], e0[1], b.z1), pr(e1[0], e1[1], b.z1)],
  };
};

export type Aim = {
  ring: Pt;
  shaft: [Pt, Pt];
  head: [Pt, Pt, Pt];
};

/** Dashed ring on the floor plus a red arrow showing where the piece will fall. */
export const aimShapes = (x: number, y: number, d: Vec): Aim => {
  const back: Vec = [-d[0], -d[1]];
  const tail = pr(x + back[0] * 64, y + back[1] * 64, 0);
  const mid = pr(x + back[0] * 20, y + back[1] * 20, 0);
  const tip = pr(x + back[0] * 11, y + back[1] * 11, 0);
  const n: Vec = [-d[1], d[0]];
  const left = pr(x + back[0] * 22 + n[0] * 7, y + back[1] * 22 + n[1] * 7, 0);
  const right = pr(x + back[0] * 22 - n[0] * 7, y + back[1] * 22 - n[1] * 7, 0);
  return { ring: pr(x, y, 0), shaft: [tail, mid], head: [tip, left, right] };
};

/** Screen rotation of the fall: the piece turns around its front bottom edge. */
export const fallAngle = (d: Vec): number => {
  const [sx, sy] = screenDir(d);
  return (Math.atan2(sy, sx) * 180) / Math.PI + 90;
};

export const pivotPoint = (x: number, y: number, d: Vec): Pt =>
  pr(x + d[0] * (T / 2), y + d[1] * (T / 2), 0);

/**
 * Screen slide applied while the piece falls: the flat rotation does not land
 * exactly on the face drawn on the floor, this brings the tip back on it.
 */
export const fallShift = (x: number, y: number, d: Vec): Pt => {
  const pivot = pivotPoint(x, y, d);
  const tip = pr(x, y, H);
  const radians = (fallAngle(d) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = tip[0] - pivot[0];
  const dy = tip[1] - pivot[1];
  const landed: Pt = [
    pivot[0] + dx * cos - dy * sin,
    pivot[1] + dx * sin + dy * cos,
  ];
  const target = pr(x + d[0] * (H - T / 2), y + d[1] * (H - T / 2), 0);
  return [target[0] - landed[0], target[1] - landed[1]];
};

export type Frame = {
  fill: number;
  aspect: number;
  lift: number;
  shiftX: number;
};

export type FrameName = 'game' | 'post' | 'end' | 'series';

export const FRAMES: Readonly<Record<FrameName, Frame>> = {
  game: { fill: 0.76, aspect: 760 / 1080, lift: -0.01, shiftX: 0 },
  post: { fill: 0.6, aspect: 512 / 740, lift: 0.08, shiftX: 0.1 },
  end: { fill: 0.5, aspect: 760 / 1080, lift: 0.02, shiftX: 0.17 },
  series: { fill: 0.76, aspect: 760 / 1080, lift: -0.01, shiftX: 0 },
};

export const viewBounds = (boxes: readonly Box[], frame: Frame): [number, number, number, number] => {
  const all: Pt[] = [];
  for (const b of boxes) {
    for (const q of b.f) {
      all.push(pr(q[0], q[1], 0));
      all.push(pr(q[0], q[1], b.z1));
    }
  }
  const xs = all.map((q) => q[0]);
  const ys = all.map((q) => q[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const vw = (maxX - minX) / frame.fill;
  const vh = vw * frame.aspect;
  return [cx - vw / 2 + frame.shiftX * vw, cy - vh / 2 + frame.lift * vh, vw, vh];
};

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type ChainShape,
  cascadeFrom,
  chainNumber,
  dailySeed,
  fallbackShape,
  generateChain,
  layout,
  minPushes,
  mulberry32,
  publicView,
  replayOrder,
  SPACING,
} from './dominoes.ts';

const DAYS: string[] = [];
for (let i = 0; i < 400; i++) {
  DAYS.push(new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));
}

const shape = (fall: ChainShape['fall'], gaps: ChainShape['gaps']): ChainShape => ({ fall, gaps });

const boardOf = (): boolean[] => Array.from({ length: 8 }, () => false);

/** A legal push order: always push the lowest standing piece. */
const legalOrder = (sh: ChainShape): number[] => {
  const down = boardOf();
  const order: number[] = [];
  for (let guard = 0; guard < 8; guard++) {
    const next = down.findIndex((value) => !value);
    if (next < 0) break;
    order.push(next);
    for (const index of cascadeFrom(sh, down, next)) down[index] = true;
  }
  return order;
};

test('seed deterministe et differencie', () => {
  assert.equal(dailySeed('2026-12-09'), dailySeed('2026-12-09'));
  assert.notEqual(dailySeed('2026-12-09'), dailySeed('2026-12-10'));
  const rand = mulberry32(dailySeed('2026-12-09'));
  const values = [rand(), rand(), rand()];
  const same = mulberry32(dailySeed('2026-12-09'));
  const other = mulberry32(dailySeed('2026-12-10'));
  assert.ok(values.every((value) => value >= 0 && value < 1));
  assert.deepEqual([same(), same(), same()], values);
  assert.notDeepEqual([other(), other(), other()], values);
});

test('numero de chaine : jours depuis le 1er janvier 2026 + 1', () => {
  assert.equal(chainNumber('2026-01-01'), 1);
  assert.equal(chainNumber('2026-01-02'), 2);
  assert.equal(chainNumber('2026-12-09'), 343);
});

test('la chaine du jour est deterministe', () => {
  for (const day of DAYS.slice(0, 60)) {
    assert.deepEqual(generateChain(day), generateChain(day), day);
  }
});

test('contraintes de generation sur 400 jours consecutifs', () => {
  for (const day of DAYS) {
    const chain = generateChain(day);
    assert.equal(chain.fall.length, 8, day);
    assert.equal(chain.gaps.length, 7, day);
    assert.ok(chain.par >= 2 && chain.par <= 4, `${day}: par ${chain.par}`);
    assert.ok(chain.fall.includes('across'), day);
    assert.ok(chain.gaps.includes(true), day);
  }
});

test('layout : espacement normal, double au niveau d un trou', () => {
  const gaps = [false, false, true, false, false, false, false];
  const positions = layout(gaps);
  assert.equal(positions[0], 0);
  assert.equal(positions[1], SPACING);
  assert.equal(positions[2], SPACING * 2);
  assert.equal(positions[3], SPACING * 3 + SPACING);
});

test('cascade : rebond d une piece right vers une piece left', () => {
  const sh = shape(['right', 'left', 'across'], [false, false, false, false, false, false, false]);
  const down = boardOf();
  const fallen = cascadeFrom(sh, down, 0);
  assert.deepEqual(fallen, [0, 1]);
  down[0] = true;
  down[1] = true;
  assert.deepEqual(cascadeFrom(sh, down, 1), []);
});

test('cascade : arret sur un trou', () => {
  const sh = shape(['right', 'right', 'across'], [true, false, false, false, false, false, false]);
  const fallen = cascadeFrom(sh, boardOf(), 0);
  assert.deepEqual(fallen, [0]);
});

test('cascade : arret sur le bord de la ligne', () => {
  const sh = shape(['left', 'right', 'across'], [false, false, false, false, false, false, false]);
  assert.deepEqual(cascadeFrom(sh, boardOf(), 0), [0]);
  assert.deepEqual(cascadeFrom(sh, boardOf(), 7), [7]);
});

test('cascade : une piece across tombe a l ecart et n entraine personne', () => {
  const sh = shape(['right', 'across', 'right'], [false, false, false, false, false, false, false]);
  assert.deepEqual(cascadeFrom(sh, boardOf(), 0), [0, 1]);
});

test('cascade : arret sur une piece deja couchee', () => {
  const sh = shape(['right', 'right', 'across'], [false, false, false, false, false, false, false]);
  const down = boardOf();
  down[1] = true;
  assert.deepEqual(cascadeFrom(sh, down, 0), [0]);
});

test('cascade : toute la ligne tombe en une poussee', () => {
  const sh = shape(
    ['right', 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
    [false, false, false, false, false, false, false]
  );
  const fallen = cascadeFrom(sh, boardOf(), 0);
  assert.equal(fallen.length, 8);
  assert.deepEqual(fallen, [0, 1, 2, 3, 4, 5, 6, 7]);
});

test('par DP : identique a la force brute sur des planches entieres', () => {
  const brute = (sh: ChainShape): number => {
    const start = 255;
    const seen = new Set<number>([start]);
    let frontier = [start];
    let depth = 0;
    while (frontier.length > 0) {
      const next: number[] = [];
      for (const mask of frontier) {
        for (let i = 0; i < 8; i++) {
          if ((mask & (1 << i)) === 0) continue;
          const down = Array.from({ length: 8 }, (_, k) => (mask & (1 << k)) === 0);
          const fallen = cascadeFrom(sh, down, i);
          let nextMask = mask;
          for (const index of fallen) nextMask &= ~(1 << index);
          if (!seen.has(nextMask)) {
            seen.add(nextMask);
            next.push(nextMask);
          }
        }
      }
      depth += 1;
      if (next.includes(0)) return depth;
      frontier = next;
    }
    return -1;
  };
  for (const day of DAYS.slice(0, 120)) {
    const chain = generateChain(day);
    const sh = shape(chain.fall, chain.gaps);
    assert.equal(minPushes(sh), brute(sh), day);
  }
});

test('rejeu : ordre legal accepte, 8/8 a la fin', () => {
  const chain = generateChain('2026-12-09');
  const sh = shape(chain.fall, chain.gaps);
  const order = legalOrder(sh);
  const result = replayOrder(sh, order);
  assert.ok(result.ok);
  assert.equal(result.pushes, order.length);
  assert.ok(result.board.down.every(Boolean));
  assert.deepEqual(result.board.rank.slice().sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('rejeu : ordre illegal rejete', () => {
  const sh = shape(
    ['left', 'right', 'across', 'across', 'across', 'across', 'across', 'across'],
    [false, false, false, false, false, false, false]
  );
  assert.equal(replayOrder(sh, [0, 0]).ok, false);
  assert.equal(replayOrder(sh, [0, 9]).ok, false);
  assert.equal(replayOrder(sh, [0, -1]).ok, false);
  assert.equal(replayOrder(sh, [0, 1.5]).ok, false);
  assert.equal(replayOrder(sh, ['0']).ok, false);
  assert.equal(replayOrder(sh, []).ok, false);
  assert.equal(replayOrder(sh, [0]).ok, false);
});

test('planche de repli : valide et soluble', () => {
  const board = fallbackShape();
  const par = minPushes(board);
  assert.ok(par >= 2 && par <= 4, `par ${par}`);
  assert.ok(board.fall.includes('across'));
  assert.ok(board.gaps.includes(true));
  const order = legalOrder(board);
  const result = replayOrder(board, order);
  assert.ok(result.ok);
  assert.ok(result.board.down.every(Boolean));
});

test('vue publique : aucune fuite du par', () => {
  const chain = generateChain('2026-12-09');
  const view = publicView(chain);
  const json = JSON.stringify(view);
  assert.ok(!json.includes('par'));
  assert.ok(!json.includes('"par"'));
  assert.equal(view.fall.length, 8);
  assert.equal(view.gaps.length, 7);
  assert.equal(view.positions.length, 8);
});

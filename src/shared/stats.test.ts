import assert from 'node:assert/strict';
import { test } from 'node:test';

import { longestStreak, pushBuckets, summarize } from './stats.ts';

test('histogramme vide', () => {
  const stats = summarize({}, 0, 0);
  assert.equal(stats.players, 0);
  assert.equal(stats.started, 0);
  assert.equal(stats.median, 0);
  assert.equal(stats.toppledPercent, 0);
  assert.deepEqual(stats.hist, {});
});

test('median, joueurs et part topplee', () => {
  const stats = summarize({ '3': '4', '4': '2' }, 6, 8);
  assert.equal(stats.players, 6);
  assert.equal(stats.started, 8);
  assert.equal(stats.median, 3);
  assert.equal(stats.toppledPercent, 75);
  assert.deepEqual(stats.hist, { 3: 4, 4: 2 });
});

test('median quand le nombre de joueurs est impair', () => {
  const stats = summarize({ '2': '1', '3': '1', '5': '1' }, 3, 3);
  assert.equal(stats.median, 3);
});

test('pushBuckets regroupe 6 et plus', () => {
  assert.deepEqual(pushBuckets({ '2': '1', '5': '2', '7': '3', '8': '1' }), [
    ['2', 1],
    ['5', 2],
    ['6+', 4],
  ]);
});

test('longestStreak compte les jours consecutifs', () => {
  assert.equal(longestStreak([]), 0);
  assert.equal(longestStreak(['2026-01-01']), 1);
  assert.equal(longestStreak(['2026-01-01', '2026-01-02', '2026-01-03']), 3);
  assert.equal(longestStreak(['2026-01-01', '2026-01-03', '2026-01-04']), 2);
  assert.equal(longestStreak(['2026-01-01', '2026-01-01', '2026-01-02']), 2);
});

import { Hono } from 'hono';
import type { Context } from 'hono';
import { context, reddit } from '@devvit/web/server';

import type {
  ErrorResponse,
  InitResponse,
  StartResponse,
  SubmitRequest,
  SubmitResponse,
} from '../../shared/api';
import { dayKeyUTC, generateChain, publicView, replayOrder } from '../../shared/dominoes';
import { longestStreak, summarize } from '../../shared/stats';
import {
  activeStreak,
  counter,
  distribution,
  markStarted,
  orderBest,
  playedDays,
  pushesBest,
  recordResult,
} from '../core/store';

const api = new Hono();

const fail = (c: Context, message: string): Response =>
  c.json<ErrorResponse>({ status: 'error', message }, 400);

const currentUser = async (): Promise<string> => (await reddit.getCurrentUsername()) ?? 'anonymous';

const communityStats = async (day: string) => {
  const [hist, done, started] = await Promise.all([
    distribution(day),
    counter(`done:${day}`),
    counter(`started:${day}`),
  ]);
  return summarize(hist, done, started);
};

const handleInit = async (c: Context): Promise<Response> => {
  if (!context.postId) return fail(c, 'postId is required');
  try {
    const day = dayKeyUTC();
    const username = await currentUser();
    const chain = generateChain(day);
    const [best, order, streak, days, stats] = await Promise.all([
      pushesBest(username, day),
      orderBest(username, day),
      activeStreak(username, day),
      playedDays(username),
      communityStats(day),
    ]);
    return c.json<InitResponse>({
      type: 'init',
      day,
      number: chain.number,
      username,
      streak,
      bestStreak: longestStreak(days),
      solvedToday: best !== null,
      pushesBest: best,
      orderBest: order,
      days,
      startedAt: Date.now(),
      stats,
      chain: publicView(chain),
    });
  } catch (err) {
    return fail(c, `init failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

const handleStart = async (c: Context): Promise<Response> => {
  if (!context.postId) return fail(c, 'postId is required');
  try {
    const day = dayKeyUTC();
    const username = await currentUser();
    const first = await markStarted(username, day);
    return c.json<StartResponse>({ type: 'start', started: first });
  } catch (err) {
    return fail(c, `start failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

const handleSubmit = async (c: Context): Promise<Response> => {
  if (!context.postId) return fail(c, 'postId is required');
  let body: SubmitRequest;
  try {
    body = await c.req.json<SubmitRequest>();
  } catch {
    return fail(c, 'invalid payload');
  }
  const day = dayKeyUTC();
  const chain = generateChain(day);
  const replay = replayOrder(chain, body.order);
  if (!replay.ok) {
    return fail(c, 'Invalid order: push standing pieces until all eight are down.');
  }
  try {
    const username = await currentUser();
    const existing = await pushesBest(username, day);
    if (existing !== null) {
      const saved = (await orderBest(username, day)) ?? replay.order;
      const [days, stats] = await Promise.all([playedDays(username), communityStats(day)]);
      return c.json<SubmitResponse>({
        type: 'submit',
        solved: true,
        pushes: existing,
        order: saved,
        streak: await activeStreak(username, day),
        bestStreak: longestStreak(days),
        firstTry: false,
        stats,
      });
    }
    const streak = (await activeStreak(username, day)) + 1;
    await recordResult(username, day, replay.pushes, replay.order, streak);
    const [days, stats] = await Promise.all([playedDays(username), communityStats(day)]);
    return c.json<SubmitResponse>({
      type: 'submit',
      solved: true,
      pushes: replay.pushes,
      order: replay.order,
      streak,
      bestStreak: longestStreak(days),
      firstTry: true,
      stats,
    });
  } catch (err) {
    return fail(c, `submit failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }
};

api.get('/init', handleInit);
api.post('/start', handleStart);
api.post('/submit', handleSubmit);

export { api };

import { redis } from '@devvit/web/server';

const DAY_MS = 86400000;
const TTL_SECONDS = 40 * 24 * 60 * 60;

export const previousDay = (day: string): string =>
  new Date(Date.parse(day) - DAY_MS).toISOString().slice(0, 10);

const readInt = (raw: string | null | undefined): number => {
  if (raw === null || raw === undefined || raw === '') return 0;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : 0;
};

const ttlDate = (): Date => new Date(Date.now() + TTL_SECONDS * 1000);

export const activeStreak = async (username: string, day: string): Promise<number> => {
  const [raw, lastDay] = await Promise.all([
    redis.get(`streak:${username}`),
    redis.get(`lastday:${username}`),
  ]);
  const streak = readInt(raw);
  if (lastDay !== day && lastDay !== previousDay(day)) return 0;
  return streak;
};

export const pushesBest = async (username: string, day: string): Promise<number | null> => {
  const raw = await redis.get(`best:${username}:${day}`);
  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
};

export const orderBest = async (username: string, day: string): Promise<number[] | null> => {
  const raw = await redis.get(`order:${username}:${day}`);
  if (raw === null || raw === undefined || raw === '') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const order: number[] = [];
    for (const item of parsed) {
      if (typeof item !== 'number' || !Number.isInteger(item)) return null;
      order.push(item);
    }
    return order;
  } catch {
    return null;
  }
};

export const playedDays = async (username: string): Promise<string[]> => {
  const rows = await redis.zRange(`days:${username}`, 0, -1, { by: 'rank' });
  return rows.map((row) => row.member);
};

export const counter = async (key: string): Promise<number> => readInt(await redis.get(key));

export const distribution = async (day: string): Promise<Record<string, string>> =>
  redis.hGetAll(`dist:${day}`);

/** Counts the day once per player: the SET NX claim is the lock, the counter follows. */
export const markStarted = async (username: string, day: string): Promise<boolean> => {
  const claim = await redis.set(`start:${username}:${day}`, '1', {
    nx: true,
    expiration: ttlDate(),
  });
  const first = typeof claim === 'string' && claim.length > 0;
  if (first) {
    await Promise.all([
      redis.incrBy(`started:${day}`, 1),
      redis.expire(`started:${day}`, TTL_SECONDS),
      redis.expire(`start:${username}:${day}`, TTL_SECONDS),
    ]);
  }
  return first;
};

export const recordResult = async (
  username: string,
  day: string,
  pushes: number,
  order: readonly number[],
  streak: number
): Promise<void> => {
  const expiration = ttlDate();
  await Promise.all([
    redis.set(`best:${username}:${day}`, String(pushes), { expiration }),
    redis.set(`order:${username}:${day}`, JSON.stringify(order), { expiration }),
    redis.set(`streak:${username}`, String(streak), { expiration }),
    redis.set(`lastday:${username}`, day, { expiration }),
    redis.zAdd(`days:${username}`, { member: day, score: Date.now() }),
    redis.incrBy(`done:${day}`, 1),
    redis.hIncrBy(`dist:${day}`, String(pushes), 1),
  ]);
  await Promise.all([
    redis.expire(`days:${username}`, TTL_SECONDS),
    redis.expire(`done:${day}`, TTL_SECONDS),
    redis.expire(`dist:${day}`, TTL_SECONDS),
  ]);
};

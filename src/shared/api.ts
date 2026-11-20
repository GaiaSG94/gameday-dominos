import type { CommunityStats } from './stats';
import type { PublicChain } from './dominoes';

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export type InitResponse = {
  type: 'init';
  day: string;
  number: number;
  username: string;
  streak: number;
  bestStreak: number;
  solvedToday: boolean;
  pushesBest: number | null;
  orderBest: number[] | null;
  days: string[];
  startedAt: number;
  stats: CommunityStats;
  chain: PublicChain;
};

export type StartRequest = {
  day?: string;
};

export type StartResponse = {
  type: 'start';
  started: boolean;
};

export type SubmitRequest = {
  order?: unknown;
};

export type SubmitResponse = {
  type: 'submit';
  solved: true;
  pushes: number;
  order: number[];
  streak: number;
  bestStreak: number;
  firstTry: boolean;
  stats: CommunityStats;
};

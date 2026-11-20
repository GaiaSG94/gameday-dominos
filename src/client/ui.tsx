import type { JSX, ReactNode } from 'react';

import type { CommunityStats } from '../shared/stats';
import { pushBuckets } from '../shared/stats';
import { orderText } from './labels';

export const Mark = (): JSX.Element => (
  <div className="mark">
    <span>D</span>
    <b />
    <span>MIN</span>
    <b />
    <span>S</span>
  </div>
);

export const Lab = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element => <div className={className ? `lab ${className}` : 'lab'}>{children}</div>;

export const Tally = ({ down }: { down: number }): JSX.Element => (
  <div className="tally">
    {Array.from({ length: 8 }, (_, index) => (
      <i key={index} className={index < down ? 'down' : 'up'} />
    ))}
  </div>
);

export const Count = ({ down, pushes }: { down: number; pushes: number }): JSX.Element => (
  <div className="count">
    <strong>{down}</strong> of 8 down · {pushes} push{pushes > 1 ? 'es' : ''}
  </div>
);

export const Hint = ({ children }: { children: ReactNode }): JSX.Element => (
  <p className="hint">{children}</p>
);

export const Cta = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}): JSX.Element => (
  <button className="cta" onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

export const Btn2 = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}): JSX.Element => (
  <button className="btn2" onClick={onClick}>
    {children}
  </button>
);

export type TileKind = 'up' | 'down' | 'miss' | 'todo' | 'today' | 'future';

export const MiniTile = ({ kind }: { kind: TileKind }): JSX.Element => (
  <i className={`mt ${kind}`} />
);

export const MiniRow = ({ kinds }: { kinds: readonly TileKind[] }): JSX.Element => (
  <div className="row">
    {kinds.map((kind, index) => (
      <MiniTile key={index} kind={kind} />
    ))}
  </div>
);

const dayKinds = (
  days: readonly string[],
  today: string,
  count: number
): TileKind[] => {
  const played = new Set(days);
  const todayMs = Date.parse(`${today}T00:00:00.000Z`);
  const kinds: TileKind[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const day = new Date(todayMs - offset * 86400000).toISOString().slice(0, 10);
    if (day === today) kinds.push(played.has(day) ? 'today' : 'todo');
    else kinds.push(played.has(day) ? 'down' : 'miss');
  }
  return kinds;
};

export const Calendar = ({
  days,
  today,
}: {
  days: readonly string[];
  today: string;
}): JSX.Element => {
  const played = new Set(days);
  const todayMs = Date.parse(`${today}T00:00:00.000Z`);
  const weekday = (new Date(todayMs).getUTCDay() + 6) % 7;
  const monday = todayMs - weekday * 86400000;
  const start = monday - 21 * 86400000;
  const cells = Array.from({ length: 28 }, (_, index) => {
    const day = new Date(start + index * 86400000).toISOString().slice(0, 10);
    const kind: TileKind =
      day > today ? 'future' : day === today ? 'today' : played.has(day) ? 'down' : 'miss';
    return { day, kind };
  });
  return (
    <div className="cal">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, index) => (
        <span className="dl" key={`${letter}${index}`}>
          {letter}
        </span>
      ))}
      {cells.map((cell) => (
        <MiniTile key={cell.day} kind={cell.kind} />
      ))}
    </div>
  );
};

export const EndCard = ({
  number,
  pushes,
  order,
  streak,
  bestStreak,
  days,
  today,
}: {
  number: number;
  pushes: number;
  order: readonly number[];
  streak: number;
  bestStreak: number;
  days: readonly string[];
  today: string;
}): JSX.Element => (
  <div className="card">
    <div className="half a">
      <Lab>Chain #{number} · all eight down</Lab>
      <div className="hero big">
        8<span>/8</span>
      </div>
      <div className="sub">
        in <b>{pushes}</b> push{pushes > 1 ? 'es' : ''}
      </div>
      <div className="order">
        <span>Your order</span>
        {order.map((index) => (
          <i key={index}>{index + 1}</i>
        ))}
      </div>
    </div>
    <div className="rule">
      <span />
    </div>
    <div className="half b">
      <Lab>Streak</Lab>
      <div className="hero mid">
        {streak}
        <span> days</span>
      </div>
      <MiniRow kinds={dayKinds(days, today, 7)} />
      <Lab>Best · {bestStreak} days</Lab>
    </div>
  </div>
);

export const SeriesCard = ({
  streak,
  bestStreak,
  chains,
  days,
  today,
}: {
  streak: number;
  bestStreak: number;
  chains: number;
  days: readonly string[];
  today: string;
}): JSX.Element => (
  <div className="scard">
    <Lab>Your streak</Lab>
    <div className="hero">
      {streak}
      <span> days</span>
    </div>
    <div className="stats">
      <div>
        <Lab>Best</Lab>
        <b>{bestStreak}</b>
      </div>
      <div>
        <Lab>Chains played</Lab>
        <b>{chains}</b>
      </div>
    </div>
    <Lab>Last four weeks</Lab>
    <Calendar days={days} today={today} />
  </div>
);

export const Distribution = ({
  stats,
  mine,
}: {
  stats: CommunityStats;
  mine: number | null;
}): JSX.Element => {
  const buckets = pushBuckets(stats.hist);
  const total = buckets.reduce((sum, [, count]) => sum + count, 0);
  const mineBucket = mine === null ? null : mine >= 6 ? '6+' : String(mine);
  return (
    <div className="chart">
      {buckets.map(([key, count]) => {
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        const tiles = Math.max(1, Math.round(percent / 2));
        const you = key === mineBucket;
        return (
          <div className={`col${you ? ' you' : ''}`} key={key}>
            <span className="pct">{percent}%</span>
            <div className="stack">
              {Array.from({ length: tiles }, (_, index) => (
                <i className={you && index === 0 ? 'mt down today' : 'mt down'} key={index} />
              ))}
            </div>
            <span className="k">{key}</span>
            {you && <span className="youlab">You</span>}
          </div>
        );
      })}
    </div>
  );
};

export const Quote = ({ text }: { text: string }): JSX.Element => (
  <div className="quote">
    <Lab>Your comment, ready to post</Lab>
    {text}
  </div>
);

export const OrderLine = ({ order }: { order: readonly number[] }): JSX.Element => (
  <div className="orderline">{orderText(order)}</div>
);

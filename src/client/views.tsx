import type { JSX } from 'react';

import type { InitResponse, SubmitResponse } from '../shared/api';
import { DominoScene } from './scene';
import type { PieceState } from './pieces';
import { dayLabel, resultText } from './labels';
import {
  Btn2,
  Count,
  Cta,
  Distribution,
  EndCard,
  Hint,
  Lab,
  Mark,
  Quote,
  SeriesCard,
  Tally,
} from './ui';

export type View = 'game' | 'end' | 'series';

export const Hud = ({
  init,
  pieces,
  pushes,
  aim,
  busy,
  onPush,
  onSave,
  error,
}: {
  init: InitResponse;
  pieces: readonly PieceState[];
  pushes: readonly number[];
  aim: number | null;
  busy: boolean;
  onPush: () => void;
  onSave: () => void;
  error: string | null;
}): JSX.Element => {
  const down = pieces.filter((piece) => piece.down).length;
  const allDown = down === 8;
  const hint = busy
    ? '…'
    : (error ??
      (aim !== null
        ? `Piece ${aim + 1} is aimed. The arrow shows where it will fall.`
        : allDown
          ? 'All eight are down — your chain is ready.'
          : 'Tap a standing piece to aim it, then push.'));
  return (
    <>
      <div className="hud tl">
        <Mark />
        <Lab className="date">
          Chain #{init.number} · {dayLabel(init.day)}
        </Lab>
      </div>
      <div className="hud tr">
        <Tally down={down} />
        <Count down={down} pushes={pushes.length} />
      </div>
      <div className="hud bc">
        <Hint>{hint}</Hint>
        {busy ? null : allDown ? (
          <Cta onClick={onSave}>Save your chain</Cta>
        ) : aim !== null ? (
          <Cta onClick={onPush}>Push</Cta>
        ) : (
          <Btn2 onClick={() => undefined}>Tap a piece to aim</Btn2>
        )}
      </div>
    </>
  );
};

export const EndView = ({
  init,
  pushes,
  result,
  countdown,
  onShare,
  onSeries,
}: {
  init: InitResponse;
  pushes: readonly number[];
  result: SubmitResponse | null;
  countdown: string;
  onShare: () => void;
  onSeries: () => void;
}): JSX.Element => {
  const count = result?.pushes ?? init.pushesBest ?? pushes.length;
  const order = result?.order ?? init.orderBest ?? pushes;
  const streak = result?.streak ?? init.streak;
  const best = result?.bestStreak ?? init.bestStreak;
  return (
    <>
      <div className="hud f-tl">
        <Mark />
        <Lab>
          Chain #{init.number} · {dayLabel(init.day)}
        </Lab>
      </div>
      <EndCard
        number={init.number}
        pushes={count}
        order={order}
        streak={streak}
        bestStreak={best}
        days={init.days}
        today={init.day}
      />
      <div className="hud f-act">
        <Quote text={resultText(init.number, count, order)} />
        <Cta onClick={onShare}>Comment your chain</Cta>
        <div className="row">
          <Btn2 onClick={onSeries}>Community &amp; streaks</Btn2>
          <Lab>Next chain in {countdown}</Lab>
        </div>
      </div>
    </>
  );
};

export const SeriesView = ({
  init,
  pushes,
  onBack,
}: {
  init: InitResponse;
  pushes: readonly number[];
  onBack: () => void;
}): JSX.Element => {
  const stats = init.stats;
  const mine = pushes.length > 0 ? pushes.length : null;
  return (
    <>
      <div className="hud s-tl">
        <Mark />
        <Lab>
          Chain #{init.number} · {dayLabel(init.day)}
        </Lab>
      </div>
      <div className="hud s-tr">
        <Btn2 onClick={onBack}>‹ Back to result</Btn2>
      </div>
      <SeriesCard
        streak={init.streak}
        bestStreak={init.bestStreak}
        chains={init.days.length}
        days={init.days}
        today={init.day}
      />
      <div className="comm">
        <Lab>Today · chain #{init.number}</Lab>
        <div className="n">
          {stats.started.toLocaleString('en-US')} <small>players</small>
        </div>
        <div className="ok">
          <b>{stats.toppledPercent}%</b> toppled all eight
        </div>
        <Distribution stats={stats} mine={mine} />
        <Lab className="axis">Pushes used to topple all eight</Lab>
      </div>
    </>
  );
};

export const Board = ({
  init,
  view,
  board,
  pushes,
  aim,
  busy,
  result,
  error,
  countdown,
  onAim,
  onPush,
  onSave,
  onShare,
  onSeries,
  onBack,
}: {
  init: InitResponse;
  view: View;
  board: readonly PieceState[];
  pushes: readonly number[];
  aim: number | null;
  busy: boolean;
  result: SubmitResponse | null;
  error: string | null;
  countdown: string;
  onAim: (index: number) => void;
  onPush: () => void;
  onSave: () => void;
  onShare: () => void;
  onSeries: () => void;
  onBack: () => void;
}): JSX.Element => {
  const frame = view === 'game' ? 'game' : view === 'end' ? 'end' : 'series';
  return (
    <div className="game">
      <DominoScene
        chain={init.chain}
        pieces={board}
        aim={view === 'game' ? aim : null}
        onAim={onAim}
        frame={frame}
        interactive={view === 'game' && !busy && !init.solvedToday}
      />
      {view === 'game' && (
        <Hud
          init={init}
          pieces={board}
          pushes={pushes}
          aim={aim}
          busy={busy}
          onPush={onPush}
          onSave={onSave}
          error={error}
        />
      )}
      {view === 'end' && (
        <EndView
          init={init}
          pushes={pushes}
          result={result}
          countdown={countdown}
          onShare={onShare}
          onSeries={onSeries}
        />
      )}
      {view === 'series' && (
        <SeriesView init={init} pushes={pushes} onBack={onBack} />
      )}
    </div>
  );
};

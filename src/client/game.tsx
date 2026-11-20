import './index.css';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { showShareSheet, showToast } from '@devvit/web/client';

import type { InitResponse, SubmitResponse } from '../shared/api';
import { cascadeFrom, replayOrder } from '../shared/dominoes';
import { standingPieces } from './pieces';
import type { PieceState } from './pieces';
import { countdownLabel, resultText } from './labels';
import { Board } from './views';
import type { View } from './views';

const FALL_STEP = 90;
const FALL_TIME = 260;

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (): void => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return reduced;
};

const boardFrom = (init: InitResponse): PieceState[] => {
  const replay = replayOrder(init.chain, init.orderBest ?? []);
  return replay.board.down.map((down, index) => ({
    down,
    rank: replay.board.rank[index] ?? 0,
    pushed: replay.board.pushed[index] ?? false,
    falling: false,
  }));
};

const useInit = (): { init: InitResponse | null; error: string | null } => {
  const [init, setInit] = useState<InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await fetch('/api/init');
        const data: InitResponse & { status?: string; message?: string } = await response.json();
        if (data.status === 'error') throw new Error(data.message ?? 'load failed');
        setInit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'load failed');
      }
    };
    void load();
  }, []);
  return { init, error };
};

const useChainApi = (init: InitResponse) => {
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(init.solvedToday ? 'end' : 'game');

  const save = async (order: number[]): Promise<void> => {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      const data: SubmitResponse & { status?: string; message?: string } = await response.json();
      if (data.status === 'error') throw new Error(data.message ?? 'submit failed');
      setResult(data);
      setError(null);
      setView('end');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'submit failed';
      setError(message);
      showToast(message);
    }
  };

  const share = async (pushes: readonly number[]): Promise<void> => {
    const count = result?.pushes ?? init.pushesBest ?? pushes.length;
    const order = result?.order ?? init.orderBest ?? [...pushes];
    const text = resultText(init.number, count, order);
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied — paste it in the comments');
    } catch {
      await showShareSheet({ text, title: 'My chain' });
    }
  };

  const start = async (): Promise<void> => {
    try {
      await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day: init.day }),
      });
    } catch {
      // the start counter is best effort, the chain still plays
    }
  };

  return { result, error, view, setView, save, share, start };
};

const useBoard = (init: InitResponse, onComplete: (order: number[]) => void) => {
  const [pieces, setPieces] = useState<PieceState[]>(() => standingPieces());
  const [pushes, setPushes] = useState<number[]>([]);
  const [aim, setAim] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef<number[]>([]);
  const rankRef = useRef(0);
  const reduced = useReducedMotion();
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  }, [onComplete]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const land = (index: number, rank: number): void => {
    setPieces((prev) =>
      prev.map((piece, position) =>
        position === index ? { ...piece, down: true, falling: false, rank } : piece
      )
    );
  };

  const fall = (fallen: number[]): void => {
    const ranks = fallen.map(() => ++rankRef.current);
    if (reduced) {
      fallen.forEach((index, step) => land(index, ranks[step] ?? 0));
      return;
    }
    fallen.forEach((index, step) => {
      const start = window.setTimeout(() => {
        setPieces((prev) =>
          prev.map((piece, position) => (position === index ? { ...piece, falling: true } : piece))
        );
      }, step * FALL_STEP);
      const end = window.setTimeout(() => land(index, ranks[step] ?? 0), step * FALL_STEP + FALL_TIME);
      timers.current.push(start, end);
    });
  };

  const push = (index: number): void => {
    const state = pieces[index];
    if (!state || state.down || busy) return;
    const down = pieces.map((piece) => piece.down);
    const fallen = cascadeFrom(init.chain, down, index);
    const order = [...pushes, index];
    setAim(null);
    setBusy(true);
    setPushes(order);
    fall(fallen);
    const downCount = down.filter(Boolean).length;
    const finished = downCount + fallen.length === 8;
    const last = (fallen.length - 1) * FALL_STEP + FALL_TIME + 40;
    timers.current.push(
      window.setTimeout(() => {
        setBusy(false);
        if (finished) complete.current(order);
      }, last)
    );
  };

  return { pieces, pushes, aim, busy, setAim, push };
};

const GameBoard = ({ init }: { init: InitResponse }): JSX.Element => {
  const [now, setNow] = useState(() => Date.now());
  const solved = useMemo(() => boardFrom(init), [init]);
  const api = useChainApi(init);
  const { pieces, pushes, aim, busy, setAim, push } = useBoard(init, (order) => {
    void api.save(order);
  });
  const board = init.solvedToday ? solved : pieces;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const onPush = (): void => {
    if (aim === null) return;
    if (pushes.length === 0) void api.start();
    push(aim);
  };

  return (
    <Board
      init={init}
      view={api.view}
      board={board}
      pushes={pushes}
      aim={aim}
      busy={busy}
      result={api.result}
      error={api.error}
      countdown={countdownLabel(now)}
      onAim={setAim}
      onPush={onPush}
      onSave={() => void api.save(pushes)}
      onShare={() => void api.share(pushes)}
      onSeries={() => api.setView('series')}
      onBack={() => api.setView('end')}
    />
  );
};

const Game = (): JSX.Element => {
  const { init, error } = useInit();
  if (error && !init) {
    return (
      <div className="page">
        <div className="post">{error}</div>
      </div>
    );
  }
  if (!init) {
    return (
      <div className="page">
        <div className="post">
          <p className="lab">Opening today&apos;s chain…</p>
        </div>
      </div>
    );
  }
  return <GameBoard init={init} />;
};

export { Game };

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Game />
    </StrictMode>
  );
}

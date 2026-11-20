import './index.css';

import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { requestExpandedMode } from '@devvit/web/client';

import type { InitResponse } from '../shared/api';
import { dayKeyUTC, generateChain, publicView } from '../shared/dominoes';
import { DominoScene } from './scene';
import { standingPieces } from './pieces';
import type { PieceState } from './pieces';
import { dayLabel } from './labels';
import { Lab, Mark, MiniRow } from './ui';
import type { TileKind } from './ui';

const SPLASH_TIMEOUT = 1200;

const useSplashData = (): InitResponse | null => {
  const [data, setData] = useState<InitResponse | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SPLASH_TIMEOUT);
    const load = async (): Promise<void> => {
      try {
        const response = await fetch('/api/init', { signal: controller.signal });
        const payload: InitResponse & { status?: string } = await response.json();
        if (payload.status !== 'error' && payload.type === 'init') setData(payload);
      } catch {
        // the splash renders the local chain, the numbers simply stay at zero
      }
    };
    void load();
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);
  return data;
};

const streakKinds = (streak: number, solved: boolean): TileKind[] => {
  const kinds: TileKind[] = [];
  for (let index = 0; index < Math.min(streak, 8); index++) kinds.push('down');
  kinds.push(solved ? 'today' : 'todo');
  return kinds;
};

const Splash = (): JSX.Element => {
  const data = useSplashData();
  const chain = useMemo(() => publicView(generateChain(dayKeyUTC())), []);
  const pieces = useMemo<PieceState[]>(() => standingPieces(), []);
  const number = data?.number ?? chain.number;
  const day = data?.day ?? chain.day;
  const played = data?.stats.started ?? 0;
  const streak = data?.streak ?? 0;
  const solved = data?.solvedToday ?? false;
  return (
    <div className="game">
      <DominoScene
        chain={chain}
        pieces={pieces}
        aim={null}
        onAim={() => undefined}
        frame="post"
        interactive={false}
      />
      <div className="hud p-tl">
        <Mark />
        <Lab>
          Chain #{number} · {dayLabel(day)}
        </Lab>
      </div>
      <div className="hud p-tr">
        <div className="n">{played.toLocaleString('en-US')}</div>
        <Lab>played today</Lab>
      </div>
      <div className="hud p-bl">
        <Lab>Your streak · {streak} days</Lab>
        <MiniRow kinds={streakKinds(streak, solved)} />
      </div>
      <div className="hud p-bc">
        <p className="chip">Topple all eight, in the right order.</p>
        <button
          className="btn"
          onClick={(event) => requestExpandedMode(event.nativeEvent, 'game')}
        >
          Play today&apos;s chain
        </button>
      </div>
    </div>
  );
};

export { Splash };

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Splash />
    </StrictMode>
  );
}

import type { JSX } from 'react';

import type { Fall, PublicChain } from '../shared/dominoes';
import type { PieceState } from './pieces';
import { freshPiece } from './pieces';
import {
  aimShapes,
  box,
  facePips,
  faces,
  fallAngle,
  fallShift,
  FRAMES,
  H,
  pivotPoint,
  pr,
  shadowPoints,
  T,
  TOP,
  TOP_SELECTED,
  viewBounds,
  W,
  type Box,
  type FrameName,
  type Pt,
  type Shape,
  type Vec,
} from './iso';

export type { PieceState };

export type SceneProps = {
  chain: PublicChain;
  pieces: readonly PieceState[];
  aim: number | null;
  onAim: (index: number) => void;
  frame: FrameName;
  interactive: boolean;
};

const fallDir = (fall: Fall | undefined): Vec => {
  if (fall === 'left') return [-1, 0];
  if (fall === 'across') return [0, 1];
  return [1, 0];
};

const pieceBox = (x: number, dir: Vec, lying: boolean): Box =>
  lying
    ? box(x + dir[0] * (H / 2 - T / 2), dir[1] * (H / 2 - T / 2), dir, H / 2, W / 2, T)
    : box(x, 0, dir, T / 2, W / 2, H);

const shapeOf = (shape: Shape, key: string): JSX.Element => {
  if (shape.kind === 'groove') {
    return (
      <line
        key={key}
        className="groove"
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
      />
    );
  }
  if (shape.kind === 'top') {
    return <polygon key={key} className="top" fill={shape.fill} points={shape.points} />;
  }
  return <polygon key={key} fill={shape.fill} points={shape.points} />;
};

const Pips = ({ piece, rank, accent }: { piece: Box; rank: number; accent: boolean }): JSX.Element => {
  const face = facePips(piece, rank);
  const divider = face.divider;
  return (
    <g className="face">
      {face.discs.map((center: Pt, index: number) => (
        <circle
          key={index}
          className={accent ? 'pip acc rv' : 'pip rv'}
          cx={center[0]}
          cy={center[1]}
          r={face.radius}
          style={{ animationDelay: `${index * 30}ms` }}
        />
      ))}
      <line
        className="groove"
        x1={divider[0][0]}
        y1={divider[0][1]}
        x2={divider[1][0]}
        y2={divider[1][1]}
      />
      <circle className="spinner" cx={face.spinner[0]} cy={face.spinner[1]} r={face.radius} />
    </g>
  );
};

const Domino = ({
  index,
  piece,
  state,
  selected,
  interactive,
  onAim,
  dir,
}: {
  index: number;
  piece: Box;
  state: PieceState;
  selected: boolean;
  interactive: boolean;
  onAim: (index: number) => void;
  dir: Vec;
}): JSX.Element => {
  const lying = state.down && !state.falling;
  const center = pr(piece.c[0], piece.c[1], lying ? piece.z1 / 2 : H / 2);
  const angle = fallAngle(dir);
  const pivot = pivotPoint(piece.c[0], piece.c[1], dir);
  const shift = fallShift(piece.c[0], piece.c[1], dir);
  const setFallVars = (element: SVGGElement | null): void => {
    if (!element || !state.falling) return;
    element.style.setProperty('--fa', `${angle.toFixed(1)}deg`);
    element.style.setProperty('--px', `${pivot[0].toFixed(1)}px`);
    element.style.setProperty('--py', `${pivot[1].toFixed(1)}px`);
    element.style.setProperty('--sx', `${shift[0].toFixed(1)}px`);
    element.style.setProperty('--sy', `${shift[1].toFixed(1)}px`);
  };
  return (
    <g className={state.falling ? 'tile tileFall' : 'tile'} ref={setFallVars}>
      {faces(piece, selected ? TOP_SELECTED : TOP, !lying).map((shape, position) =>
        shapeOf(shape, `f${position}`)
      )}
      {lying && state.rank > 0 && <Pips piece={piece} rank={state.rank} accent={state.pushed} />}
      {interactive && !state.down && (
        <circle
          className="hit"
          cx={center[0]}
          cy={center[1]}
          r={30}
          onClick={() => onAim(index)}
        />
      )}
    </g>
  );
};

const AimRing = ({ chain, index }: { chain: PublicChain; index: number }): JSX.Element => {
  const aim = aimShapes(chain.positions[index] ?? 0, 0, fallDir(chain.fall[index]));
  return <circle className="ring" cx={aim.ring[0]} cy={aim.ring[1]} r={30} />;
};

const AimArrow = ({ chain, index }: { chain: PublicChain; index: number }): JSX.Element => {
  const aim = aimShapes(chain.positions[index] ?? 0, 0, fallDir(chain.fall[index]));
  const head = aim.head
    .map((point) => `${point[0].toFixed(1)},${point[1].toFixed(1)}`)
    .join(' ');
  return (
    <>
      <line
        className="aimline"
        x1={aim.shaft[0][0]}
        y1={aim.shaft[0][1]}
        x2={aim.shaft[1][0]}
        y2={aim.shaft[1][1]}
      />
      <polygon className="aimhead" points={head} />
    </>
  );
};

export const DominoScene = ({
  chain,
  pieces,
  aim,
  onAim,
  frame,
  interactive,
}: SceneProps): JSX.Element => {
  const items = chain.fall.map((_, index) => {
    const state = pieces[index] ?? freshPiece();
    const x = chain.positions[index] ?? 0;
    const dir = fallDir(chain.fall[index]);
    const lying = state.down && !state.falling;
    const piece = pieceBox(x, dir, lying);
    return { index, state, piece, dir, depth: piece.c[0] + piece.c[1] + (lying ? 0 : 1) };
  });
  items.sort((a, b) => a.depth - b.depth);
  const bounds = viewBounds(
    items.map((item) => item.piece),
    FRAMES[frame]
  );
  const viewBox = bounds.map((value) => value.toFixed(1)).join(' ');
  return (
    <svg className="scene" viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="blurShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={5} />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.6} numOctaves={3} seed={7} />
          <feColorMatrix values="0 0 0 0 0.25 0 0 0 0 0.25 0 0 0 0 0.25 0 0 0 0.16 0" />
        </filter>
        <radialGradient id="pool" cx="38%" cy="30%" r="75%">
          <stop offset={0} stopColor="#ffffff" stopOpacity={0.6} />
          <stop offset={1} stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect className="floor" x={bounds[0]} y={bounds[1]} width={bounds[2]} height={bounds[3]} />
      <rect x={bounds[0]} y={bounds[1]} width={bounds[2]} height={bounds[3]} filter="url(#grain)" />
      <rect x={bounds[0]} y={bounds[1]} width={bounds[2]} height={bounds[3]} fill="url(#pool)" />
      <g filter="url(#blurShadow)">
        {items.map((item) => (
          <polygon key={`s${item.index}`} className="sh" points={shadowPoints(item.piece)} />
        ))}
      </g>
      {aim !== null && <AimRing chain={chain} index={aim} />}
      {items.map((item) => (
        <Domino
          key={item.index}
          index={item.index}
          piece={item.piece}
          dir={item.dir}
          state={item.state}
          selected={aim === item.index}
          interactive={interactive}
          onAim={onAim}
        />
      ))}
      {aim !== null && <AimArrow chain={chain} index={aim} />}
    </svg>
  );
};

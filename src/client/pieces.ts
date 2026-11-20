export type PieceState = {
  down: boolean;
  rank: number;
  pushed: boolean;
  falling: boolean;
};

const FRESH: PieceState = { down: false, rank: 0, pushed: false, falling: false };

export const freshPiece = (): PieceState => ({ ...FRESH });

export const standingPieces = (): PieceState[] =>
  Array.from({ length: 8 }, () => ({ ...FRESH }));

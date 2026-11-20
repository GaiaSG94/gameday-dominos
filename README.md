# Daily Dominos

A daily domino game for Reddit, built as a Devvit Web app.

**Topple all eight, in the right order.** Eight black lacquer dominoes stand on a
bone-coloured plaster floor. Each one falls in its own direction, and that
direction is visible in the way it stands: the thin edge faces the neighbour it
can reach. Push a piece, it topples, and the chain continues from there — until
it hits a gap, the edge of the line, a piece that falls aside, or a piece that
is already down. Topple all eight in as few pushes as you can.

One chain a day, the same for every player, seeded from the UTC date.

## How to play

1. Open the post, hit **Play today's chain** — the game opens in the expanded view.
2. Click a standing piece: a red ring marks it on the floor and a red arrow shows
   where it will fall.
3. Hit **Push**. The cascade plays out, one piece every 90 ms.
4. Repeat until all eight are down, then the result card shows your push count
   and your order (`1 → 5 → 8`), your streak and a copy-ready comment.
5. The server replays your order before recording anything: a result is only
   stored when all eight pieces really are down.

Your first 8/8 of the day is recorded. After that the result card is read-only,
because replaying it would spoil the par.

## Architecture

```
src/shared/dominoes.ts     pure logic: seed, daily generation, cascade, par (DP), layout
src/shared/stats.ts        community distribution (median, histogram, share toppled)
src/shared/api.ts          request/response types for /api/*
src/client/iso.ts          isometric maths ported from the Encre boards (C=0.866, S=0.5, T=9, W=24, H=46)
src/client/scene.tsx       SVG scene renderer (lacquered faces, blurred shadows, grain, pips, aim)
src/client/ui.tsx          HUD: logo, counter, hint, buttons, result card, calendar, distribution
src/client/game.tsx        expanded view: init, aim, pushes, cascade animation, result, streaks
src/client/splash.tsx      inline post preview with the Play button
src/server/core/post.ts    daily post title: `Daily chain #N — topple all eight`
src/server/core/store.ts   Redis: streak, best result, days played, push distribution
src/server/routes/api.ts   GET /api/init, POST /api/start, POST /api/submit
```

- The client never receives the par: the server computes it (DP over the 2^8
  standing/lying masks) and only uses it to generate and validate the chain.
- `POST /api/submit` replays the submitted order with the shared cascade and
  rejects any order that pushes a lying piece or leaves a piece standing.
- Redis keys (40 day TTL): `streak:{user}`, `lastday:{user}`, `best:{user}:{day}`,
  `order:{user}:{day}`, `days:{user}` (sorted set), `started:{day}`, `done:{day}`,
  `dist:{day}` (hash of push count → players).
- Fonts are bundled locally (Inter Tight, SIL Open Font License), so the game
  makes no external network request.

## Development

```bash
npm install          # install dependencies
npm run dev          # devvit playtest (local Reddit-like environment)
npm run test:types   # tsc --build
npm run lint         # eslint src
npm test             # node --test (shared logic)
npm run build        # vite build -> dist/client + dist/server
```

Requires Node 24 (see `.nvmrc`).

## License

BSD-3-Clause — see `LICENSE`. The bundled font is licensed under the SIL Open
Font License, see `src/client/fonts/OFL.txt`.

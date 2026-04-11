# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Compile to dist/ (CJS + ESM with type declarations)
npm run dev          # Build in watch mode
npm run typecheck    # Type-check without emitting
npm run test         # Run all tests with mocha
npm run lint         # Check with biome
npm run lint:fix     # Auto-fix lint issues
npm run format       # Auto-format with biome
```

Tests are located in `test/**/*.test.ts` and run via mocha with tsx (no compilation step needed). To run a single test file: `npx mocha test/your-file.test.ts`.

## Architecture

This is a TypeScript library for immutable chess position representation. It ships as both CJS and ESM via [tsdown.config.ts](tsdown.config.ts), with the public API exported from [src/index.ts](src/index.ts).

### Piece encoding — [src/piece.ts](src/piece.ts)

Pieces are bit-packed integers stored in `enum Piece`. The LSB encodes color (`PieceColor`: White=1, Black=0) and bits 1–3 encode kind (`PieceKind`, a `const enum`). Helper functions `pieceKind()`, `pieceColor()`, `pieceSymbol()`, and `opponentOf()` decode these values. The encoding allows pieces to be stored directly as bytes in a `Uint8Array` (0 = empty square).

### Board — [src/board.ts](src/board.ts)

`Board` is an immutable class backed by a `Uint8Array`. The constructor is private; use `Board.empty(width?, height?)` to create instances (defaults to 8×8, max 26×26). `place(index, piece)` returns a new `Board` with the change applied (copy-on-write). Squares are addressed by a flat index: `index = (height - 1 - rank) * width + file`, mapping rank 0 (white's back rank) to the last row of the array. Key methods: `at()`, `place()`, `move()`, `findPiece()`, `findPieces()`, `piecesOfColor()`, `toFen()`, `squareColor()`, and the algebraic-notation helpers `fromSquare()` / `toSquare()`.

### Move generation — [src/moves.ts](src/moves.ts)

`Moves` generates pseudo-legal moves for a given board. Constructed with `new Moves(board, rules?)`. The `Rules` interface has two options: `pawnDoubleAdvance` (default `true`) and `turnColor` (default `PieceColor.White`). Call `moves.from(index)` to get all moves for the piece on that square; only pieces matching `turnColor` produce moves. Supports sliding pieces (rook, bishop, queen), stepping pieces (king, knight), and pawns with diagonal captures.

### Position legality — [src/rules.ts](src/rules.ts)

`isLegal(board, options?)` checks whether a board position is reachable in a legal game and returns `LegalityResult { legal: boolean; violations: Violation[] }`. Three independent options via `LegalityOptions`:
- `kings`: `'required'` (default) | `'optional'` — whether each color must have exactly one king
- `pawnsOnBackRank`: `'forbidden'` (default) | `'allowed'` — whether pawns on rank 0 or height−1 are illegal
- `turnColor`: `PieceColor | null` (default `null`) — when set, checks that the opponent's king is not in check

### ASCII rendering — [src/ascii.ts](src/ascii.ts)

`ascii(board)` returns a printable string of the board with rank/file labels. White pieces are uppercase, black pieces lowercase, empty squares are `.`.

### Legacy code — [legacy/](legacy/)

The `legacy/` directory contains prior design drafts (not exported, not tested). `square.ts` has a `Square` class with algebraic notation helpers. `moves.ts` has partial move-generation logic. These serve as a reference only.

## Code style

Biome enforces formatting: 2-space indent, single quotes, trailing commas, 100-char line width, semicolons always. The `noConstEnum` lint rule is suppressed for `PieceKind` — this is intentional to keep the bit-packing pattern readable. `Piece` and `PieceColor` use regular `enum` so they are usable as runtime values by consumers.

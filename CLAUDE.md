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

Pieces are bit-packed integers stored in a `const enum Piece`. The LSB encodes color (`PieceColor`: White=1, Black=0) and bits 1–3 encode kind (`PieceKind`). Helper functions `pieceKind()`, `pieceColor()`, and `pieceSymbol()` decode these values. The encoding allows pieces to be stored directly as bytes in a `Uint8Array` (0 = empty square).

### Board — [src/board.ts](src/board.ts)

`Board` is an immutable class backed by a `Uint8Array`. The constructor is private; use `Board.empty(width?, height?)` to create instances. `put(index, piece)` returns a new `Board` with the change applied (copy-on-write). Squares are addressed by a flat index: `index = (7 - rank) * width + file`, mapping rank 0 (white's back rank) to the last row of the array. `toFen()` generates the piece-placement portion of a FEN string.

### Legacy code — [legacy/](legacy/)

The `legacy/` directory contains prior design drafts (not exported, not tested). `square.ts` has a `Square` class with algebraic notation helpers. `moves.ts` has partial move-generation logic. These serve as a reference for implementing move generation in the future.

## Code style

Biome enforces formatting: 2-space indent, single quotes, trailing commas, 100-char line width, semicolons always. The `noConstEnum` lint rule is suppressed for the piece enums — this is intentional to keep the bit-packing pattern readable.

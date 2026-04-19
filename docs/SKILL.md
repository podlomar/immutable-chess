---
name: immutable-chess-knowledge
description: Use this when working with the `immutable-chess` package used for chess board representation, move generation, validation, FEN/PGN.
---

# immutable-chess

A TypeScript library for immutable chess position representation. No external dependencies. Supports both ESM and CommonJS.

## What this library does

- Represents a chess board as an immutable value (copy-on-write)
- Encodes pieces as bit-packed integers in a `Uint8Array`
- Generates pseudo-legal moves for all piece types
- Validates board legality (king counts, pawn placement, check detection)
- Exports board state as FEN (piece placement only)
- Renders boards as ASCII strings for debugging
- Supports arbitrary board dimensions (1×1 to 26×26) for different chess variants, custom games and educational purposes

## What this library does NOT do

- No full game state (no castling rights, en passant, half-move clock, full-move number in FEN)
- No move legality filtering (does not remove moves that leave the king in check)
- No PGN parsing or SAN move notation
- No game loop or match management

## Import map

```typescript
// Core types: Board, Move, SquareColor, Piece, PieceColor, PieceKind, PieceSymbol
// Core functions: pieceKind, pieceColor, pieceSymbol, opponentOf
import { Board, Piece, PieceColor, PieceKind, Move } from 'immutable-chess';

// Move generation: Moves, Rules
import { Moves } from 'immutable-chess/moves';

// Legality checking: isLegal, LegalityOptions, LegalityResult, Violation
import { isLegal } from 'immutable-chess/rules';

// ASCII rendering
import { ascii } from 'immutable-chess/ascii';
```

## Quick start

```typescript
import { Board, Piece, PieceColor } from 'immutable-chess';
import { Moves } from 'immutable-chess/moves';
import { isLegal } from 'immutable-chess/rules';
import { ascii } from 'immutable-chess/ascii';

// Build a position
let board = Board.empty();
board = board.place(board.fromSquare('e1'), Piece.WhiteKing);
board = board.place(board.fromSquare('e8'), Piece.BlackKing);
board = board.place(board.fromSquare('e2'), Piece.WhitePawn);

// Generate moves for white
const moves = new Moves(board, { turnColor: PieceColor.White });
const e2Moves = moves.from(board.fromSquare('e2'));
// => [{ from: 48, to: 40 }, { from: 48, to: 32 }]  (e3 and e4)

// Check legality
const result = isLegal(board, { turnColor: PieceColor.White });
// => { legal: true, violations: [] }

// Render
console.log(ascii(board));
```

## Document index

| File | Contents |
|------|----------|
| [board.md](board.md) | `Board` class — construction, coordinates, queries, immutable updates, FEN |
| [pieces.md](pieces.md) | `Piece`, `PieceColor`, `PieceKind` — encoding, helpers |
| [moves.md](moves.md) | `Moves` class — move generation, `Rules` interface |
| [legality.md](legality.md) | `isLegal` — `LegalityOptions`, `Violation` types |
| [examples.md](examples.md) | Patterns and recipes |

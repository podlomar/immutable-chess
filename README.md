# immutable-chess

A TypeScript library for immutable chess position representation. No external dependencies. Ships as both ESM and CommonJS.

```bash
npm install immutable-chess
```

## What it does

- **Immutable board** — every mutation returns a new `Board` instance (copy-on-write)
- **Efficient encoding** — pieces are bit-packed integers stored in a `Uint8Array`
- **Pseudo-legal move generation** — all piece types including pawns, sliders, and steppers
- **Position validation** — king counts, pawn placement, check detection
- **FEN export** — piece-placement segment of FEN
- **ASCII rendering** — printable board for debugging
- **Variant support** — configurable board dimensions from 1×1 to 26×26

## What it does not do yet

- No full game state (no castling rights, en passant, half-move clock, or full-move number)
- No move legality filtering — moves that leave the king in check are not removed automatically
- No PGN parsing or SAN move notation
- No game loop or match management

## Imports

```typescript
// Core types and helpers
import { Board, Piece, PieceColor, PieceKind, Move, SquareColor } from 'immutable-chess';
import { pieceKind, pieceColor, pieceSymbol, opponentOf } from 'immutable-chess';

// Move generation
import { Moves } from 'immutable-chess/moves';

// Position legality
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

// Build a position (all operations return a new Board)
const board = Board.empty()
  .placeSquare('e1', Piece.WhiteKing)
  .placeSquare('e8', Piece.BlackKing)
  .placeSquare('e2', Piece.WhitePawn)
  .placeSquare('d7', Piece.BlackPawn);

// Generate pseudo-legal moves for white
const moves = new Moves(board, { turnColor: PieceColor.White });
const e2Moves = moves.from(board.fromSquare('e2'));
// => [{ from: 48, to: 40 }, { from: 48, to: 32 }]  (e3 and e4)

// Validate the position
const result = isLegal(board, { turnColor: PieceColor.White });
// => { legal: true, violations: [] }

// Print the board
console.log(ascii(board));
// 8 ...k....
// 7 ...p....
// 6 ........
// 5 ........
// 4 ........
// 3 ........
// 2 ....P...
// 1 ....K...
//   abcdefgh
```

## Board

`Board` is an immutable class. The constructor is private — use `Board.empty()`.

```typescript
const board = Board.empty();          // 8×8, all squares empty
const board = Board.empty(10, 10);    // 10×10 for chess variants
```

### Coordinates

The board uses a flat linear index as its primary addressing scheme:

```
index = (height - 1 - rank) * width + file
```

Rank 0 is white's back rank (rank 1 in algebraic notation). All methods accept both linear indices and algebraic square notation.

```typescript
board.fromSquare('e4')     // → number (linear index)
board.toSquare(index)      // → 'e4'
board.rank(index)          // → number (0-based)
board.file(index)          // → number (0-based)
board.index(rank, file)    // → number
board.inBounds(index)      // → boolean
```

### Placing and moving pieces

```typescript
// All return a new Board
board.place(index, Piece.WhiteRook)      // place by index
board.place(index, null)                 // remove piece
board.placeSquare('a1', Piece.WhiteRook) // place by square name
board.placeSquare('a1', null)            // remove by square name
board.move({ from, to })                 // move piece; throws if source is empty
```

### Querying

```typescript
board.at(index)                                          // → Piece | null
board.atSquare('e4')                                     // → Piece | null
board.findPiece(p => p === Piece.WhiteKing)              // → number | null
board.findPieces(p => pieceKind(p) === PieceKind.Rook)   // → number[]
board.piecesOfColor(PieceColor.White)                    // → number[]
board.emptySquares()                                     // → number[]
board.squareColor(index)                                 // → 'light' | 'dark'
board.width                                              // → number
board.height                                             // → number
```

### FEN export

`toFen()` returns the piece-placement segment only. Append remaining fields manually if needed.

```typescript
board.toFen()
// → 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

const fullFen = `${board.toFen()} w KQkq - 0 1`;
```

## Pieces

`Piece` is a regular enum — safe to use as a map key or array index at runtime.

```typescript
Piece.WhitePawn   Piece.BlackPawn
Piece.WhiteKnight Piece.BlackKnight
Piece.WhiteBishop Piece.BlackBishop
Piece.WhiteRook   Piece.BlackRook
Piece.WhiteQueen  Piece.BlackQueen
Piece.WhiteKing   Piece.BlackKing
```

Pieces are bit-packed: the LSB encodes color, bits 1–3 encode kind. The value `0` means empty square.

```typescript
pieceKind(piece)     // → PieceKind  (Pawn | Knight | Bishop | Rook | Queen | King)
pieceColor(piece)    // → PieceColor (White | Black)
pieceSymbol(piece)   // → 'p' | 'n' | 'b' | 'r' | 'q' | 'k'  (always lowercase)
opponentOf(color)    // → PieceColor
```

`PieceColor.White = 1`, `PieceColor.Black = 0`. `PieceKind` is a `const enum` — values are inlined at compile time and cannot be iterated at runtime.

## Move generation

`Moves` generates pseudo-legal moves. It does **not** filter moves that leave the king in check — do that with `isLegal` (see below).

```typescript
const moves = new Moves(board, {
  turnColor: PieceColor.White,  // only pieces of this color produce moves
  pawnDoubleAdvance: true,      // allow pawns to advance 2 squares from start
});

const list = moves.from(board.fromSquare('e2'));
// → Move[]  e.g. [{ from: 48, to: 40 }, { from: 48, to: 32 }]
```

Both fields are optional and default to `{ turnColor: PieceColor.White, pawnDoubleAdvance: true }`.

`Move` is `{ readonly from: number; readonly to: number }` using flat linear indices.

Apply a move with `board.move(move)` — this returns a new `Board`.

### Get all moves for a side

```typescript
const allMoves = board.piecesOfColor(PieceColor.White)
  .flatMap(idx => moves.from(idx));
```

### Filter to fully legal moves

```typescript
import { opponentOf } from 'immutable-chess';
import { isLegal } from 'immutable-chess/rules';

const legalMoves = board.piecesOfColor(turn).flatMap(idx => gen.from(idx)).filter(move => {
  const next = board.move(move);
  return !isLegal(next, { turnColor: opponentOf(turn) }).violations.some(
    v => v.type === 'opponentInCheck',
  );
});
```

**Pawn promotion** is not applied automatically. The generator produces the move to the back rank; you must replace the pawn with the promoted piece yourself:

```typescript
let next = board.move(move);
const piece = next.at(move.to);
if (piece !== null && pieceKind(piece) === PieceKind.Pawn) {
  const rank = next.rank(move.to);
  if (rank === 0 || rank === next.height - 1) {
    next = next.place(move.to, promotionPiece);
  }
}
```

**En passant** is not generated.

## Position validation

```typescript
import { isLegal } from 'immutable-chess/rules';

const { legal, violations } = isLegal(board, {
  kings: 'required',            // 'required' (default) | 'optional'
  pawnsOnBackRank: 'forbidden', // 'forbidden' (default) | 'allowed'
  turnColor: null,              // PieceColor | null (default null)
});
```

When `legal` is `false`, `violations` contains one or more of:

| Violation type | Meaning |
|----------------|---------|
| `{ type: 'missingKing', color }` | A color has no king — only when `kings: 'required'` |
| `{ type: 'extraKing', color, count }` | A color has more than one king — always checked (both options allow at most one) |
| `{ type: 'pawnOnBackRank', index }` | A pawn sits on rank 0 or rank `height−1` |
| `{ type: 'kingsAdjacent' }` | Both kings are within one square of each other |
| `{ type: 'opponentInCheck' }` | Opponent's king is under attack (`turnColor` was set) |

All violations are collected — the check is never short-circuited.

Setting `turnColor` enables check detection: `isLegal(board, { turnColor: PieceColor.White })` verifies that black's king is not under attack (i.e. white did not leave the opponent in check on the previous move).

## ASCII rendering

```typescript
import { ascii } from 'immutable-chess/ascii';

console.log(ascii(board));         // white's perspective (default)
console.log(ascii(board, true));   // black's perspective (flip=true)
```

`flip = true` puts rank 1 at the top and reverses the file order (h on the left). White pieces are uppercase, black pieces lowercase, empty squares are `.`.

## Board.map

`map` is the general primitive for view rendering. It traverses every square in visual order and returns a 2D array `result[row][col]`:

```typescript
board.map<T>(fn: (piece: Piece | null, index: number) => T, flip?: boolean): T[][]
```

`Board` does not assign chess meaning to `flip` — the view layer decides what each orientation represents. `ascii` uses `board.map` internally.

## Variant boards

All APIs work unchanged on non-8×8 boards:

```typescript
const board = Board.empty(5, 5);
board.fromSquare('c3');   // center of a 5×5 board
new Moves(board, { turnColor: PieceColor.White });
isLegal(board);
```

Width and height must each be between 1 and 26 (limited by single-letter file labels). `Board.empty()` throws `RangeError` for out-of-range values.

## Documentation

Full API reference and more examples are in the [`docs/`](docs/) directory:

| File | Contents |
|------|----------|
| [docs/board.md](docs/board.md) | `Board` — construction, coordinates, queries, FEN |
| [docs/pieces.md](docs/pieces.md) | `Piece`, `PieceColor`, `PieceKind`, helper functions |
| [docs/moves.md](docs/moves.md) | `Moves`, `Rules`, per-piece behaviour, game loop pattern |
| [docs/legality.md](docs/legality.md) | `isLegal`, all `LegalityOptions` and `Violation` variants |
| [docs/examples.md](docs/examples.md) | Recipes: starting position, checkmate, stalemate, promotion |

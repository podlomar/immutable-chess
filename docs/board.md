# Board

The `Board` class is the central data structure. It is immutable: every method that changes state returns a new `Board` instance, leaving the original unchanged.

```typescript
import { Board, Piece, PieceColor, Move, SquareColor } from 'immutable-chess';
```

## Construction

```typescript
const board = Board.empty();           // Standard 8×8 board, all squares empty
const board = Board.empty(10, 10);     // 10×10 board
const board = Board.empty(5, 8);       // 5 files × 8 ranks
```

- Width and height must each be between 1 and 26.
- Throws `RangeError` for values outside that range.
- There is no `Board.fromFen()` — FEN parsing is not provided.

## Coordinate system

The board uses a flat linear index as its primary addressing scheme.

```
index = (height - 1 - rank) * width + file
```

- `rank` is 0-based, where **rank 0 = white's back rank** (rank 1 in algebraic notation).
- `file` is 0-based, where file 0 = file a.
- This maps rank 7 (rank 8 in notation) to the first row of the internal array.

### Conversion helpers

```typescript
board.rank(index)             // → number  (0-based rank)
board.file(index)             // → number  (0-based file)
board.index(rank, file)       // → number  (linear index)

board.toSquare(index)         // → string  e.g. 'e4'
board.fromSquare('e4')        // → number  (linear index)
```

`fromSquare` handles multi-character file labels (for boards wider than 26) and supports ranks up to 3 digits.

### Bounds checking

```typescript
board.inBounds(index)         // → boolean
```

Always check bounds before using a computed index that may lie outside the board (e.g. when iterating neighbours).

## Querying pieces

```typescript
board.at(index)               // → Piece | null
board.atSquare('e4')          // → Piece | null

board.findPieces(p => pieceKind(p) === PieceKind.Queen)  // → number[]  (all matching indices)
board.findPiece(p => p === Piece.WhiteKing)              // → number | null  (first match)
board.piecesOfColor(PieceColor.White)                    // → number[]
board.emptySquares()                                     // → number[]

board.squareColor(index)      // → 'light' | 'dark'  (SquareColor)
```

## Placing and removing pieces

All placement methods return a **new** `Board`.

```typescript
// By linear index
const next = board.place(index, Piece.WhiteRook);   // place piece
const next = board.place(index, null);              // remove piece

// By algebraic notation
const next = board.placeSquare('a1', Piece.WhiteRook);
const next = board.placeSquare('a1', null);
```

## Moving pieces

```typescript
const move: Move = { from: board.fromSquare('e2'), to: board.fromSquare('e4') };
const next = board.move(move);
```

- Throws if the source square is empty.
- Captures (destination occupied by any piece) are silently applied — the captured piece is overwritten.
- Does **not** validate legality or check for same-color captures.

## Chaining updates

Because every method returns a new `Board`, updates chain naturally:

```typescript
const board = Board.empty()
  .placeSquare('e1', Piece.WhiteKing)
  .placeSquare('e8', Piece.BlackKing)
  .placeSquare('d1', Piece.WhiteQueen)
  .placeSquare('a1', Piece.WhiteRook)
  .placeSquare('h1', Piece.WhiteRook);
```

## FEN export

`toFen()` returns the **piece-placement** segment of a FEN string only. It does not include active color, castling rights, en passant, or move counters.

```typescript
board.toFen()
// → 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
```

To produce a full FEN string you must append the remaining fields yourself:

```typescript
const fullFen = `${board.toFen()} w KQkq - 0 1`;
```

## Board dimensions

```typescript
board.width    // → number  (number of files)
board.height   // → number  (number of ranks)
```

These properties are read-only. A board's dimensions are fixed at construction time.

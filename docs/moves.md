# Move Generation

```typescript
import { Moves } from 'immutable-chess/moves';
import type { Rules } from 'immutable-chess/moves';
import { PieceColor } from 'immutable-chess';
```

## Overview

`Moves` generates **pseudo-legal** moves for a given board position. Pseudo-legal means moves are geometrically valid for each piece type but the generator does **not** filter out moves that leave the moving side's own king in check. Use `isLegal` from `immutable-chess/rules` to detect check conditions separately.

## Rules interface

```typescript
interface Rules {
  pawnDoubleAdvance: boolean;   // Allow pawns to advance 2 squares from start rank
  turnColor: PieceColor;        // Only pieces of this color produce moves
}
```

Defaults: `{ pawnDoubleAdvance: true, turnColor: PieceColor.White }`

## Construction

```typescript
const moves = new Moves(board);
// White's turn, pawn double advance enabled

const moves = new Moves(board, { turnColor: PieceColor.Black });
// Black's turn

const moves = new Moves(board, { pawnDoubleAdvance: false, turnColor: PieceColor.White });
```

## Generating moves

```typescript
const from = board.fromSquare('e2');
const list = moves.from(from);
// → Move[]  e.g. [{ from: 48, to: 40 }, { from: 48, to: 32 }]
```

Returns an empty array when:
- The square is empty.
- The piece's color does not match `turnColor`.

### Move type

```typescript
interface Move {
  readonly from: number;  // source index
  readonly to: number;    // destination index
}
```

Both fields are flat linear indices (see [board.md](board.md) for coordinate details).

## Piece movement rules

### Sliding pieces (rook, bishop, queen)

Move in their respective directions until hitting a board edge or another piece. They can capture the first opponent piece they encounter but cannot pass through it.

### Stepping pieces (king, knight)

Move to fixed destination squares in one step. Move is legal if the destination is in bounds and not occupied by a same-color piece.

### Pawns

| Action | Condition |
|--------|-----------|
| Single advance | Destination square is empty |
| Double advance | Both single and double destination are empty; pawn is on its starting rank; `pawnDoubleAdvance` is `true` |
| Diagonal capture | Destination is in bounds, occupied by an **opponent** piece |

- White pawns advance toward higher ranks (increasing rank number).
- Black pawns advance toward lower ranks (decreasing rank number).
- Starting rank for white pawns: rank 1. Starting rank for black pawns: rank `height - 2`.
- En passant is **not** generated.
- Promotion is not modelled — the generator produces the move to the back rank; the caller must handle promotion externally.

## All moves for one side

To get every move available to a color, iterate over all pieces of that color:

```typescript
const moves = new Moves(board, { turnColor: PieceColor.White });
const allMoves = board.piecesOfColor(PieceColor.White).flatMap(idx => moves.from(idx));
```

## Applying a move

`Moves` does not apply moves. Use `Board.move()`:

```typescript
const nextBoard = board.move(move);
```

## Typical game loop pattern

```typescript
import { Board, Piece, PieceColor, opponentOf } from 'immutable-chess';
import { Moves } from 'immutable-chess/moves';
import { isLegal } from 'immutable-chess/rules';

let board = /* initial position */;
let turn = PieceColor.White;

function applyMove(move: Move): void {
  board = board.move(move);
  turn = opponentOf(turn);
}

function getLegalMoves(): Move[] {
  const gen = new Moves(board, { turnColor: turn });
  return board
    .piecesOfColor(turn)
    .flatMap(idx => gen.from(idx))
    .filter(move => {
      // Filter pseudo-legal moves: reject moves that leave own king in check
      const next = board.move(move);
      const result = isLegal(next, { turnColor: opponentOf(turn) });
      return !result.violations.some(v => v.type === 'opponentInCheck');
    });
}
```

# Examples

Common patterns for working with `immutable-chess`.

## Build a starting position

The library has no built-in starting position. Construct it manually:

```typescript
import { Board, Piece } from 'immutable-chess';

function startingPosition(): Board {
  return Board.empty()
    // Black back rank
    .placeSquare('a8', Piece.BlackRook)
    .placeSquare('b8', Piece.BlackKnight)
    .placeSquare('c8', Piece.BlackBishop)
    .placeSquare('d8', Piece.BlackQueen)
    .placeSquare('e8', Piece.BlackKing)
    .placeSquare('f8', Piece.BlackBishop)
    .placeSquare('g8', Piece.BlackKnight)
    .placeSquare('h8', Piece.BlackRook)
    // Black pawns
    .placeSquare('a7', Piece.BlackPawn)
    .placeSquare('b7', Piece.BlackPawn)
    .placeSquare('c7', Piece.BlackPawn)
    .placeSquare('d7', Piece.BlackPawn)
    .placeSquare('e7', Piece.BlackPawn)
    .placeSquare('f7', Piece.BlackPawn)
    .placeSquare('g7', Piece.BlackPawn)
    .placeSquare('h7', Piece.BlackPawn)
    // White pawns
    .placeSquare('a2', Piece.WhitePawn)
    .placeSquare('b2', Piece.WhitePawn)
    .placeSquare('c2', Piece.WhitePawn)
    .placeSquare('d2', Piece.WhitePawn)
    .placeSquare('e2', Piece.WhitePawn)
    .placeSquare('f2', Piece.WhitePawn)
    .placeSquare('g2', Piece.WhitePawn)
    .placeSquare('h2', Piece.WhitePawn)
    // White back rank
    .placeSquare('a1', Piece.WhiteRook)
    .placeSquare('b1', Piece.WhiteKnight)
    .placeSquare('c1', Piece.WhiteBishop)
    .placeSquare('d1', Piece.WhiteQueen)
    .placeSquare('e1', Piece.WhiteKing)
    .placeSquare('f1', Piece.WhiteBishop)
    .placeSquare('g1', Piece.WhiteKnight)
    .placeSquare('h1', Piece.WhiteRook);
}
```

## Apply moves by algebraic square notation

```typescript
import { Board } from 'immutable-chess';
import type { Move } from 'immutable-chess';

function squareMove(board: Board, from: string, to: string): Board {
  return board.move({ from: board.fromSquare(from), to: board.fromSquare(to) });
}

let board = startingPosition();
board = squareMove(board, 'e2', 'e4');
board = squareMove(board, 'e7', 'e5');
board = squareMove(board, 'd1', 'h5');  // Queen to h5
```

## Get all legal moves for a side (filtering pseudo-legal)

```typescript
import { Board, PieceColor, opponentOf } from 'immutable-chess';
import { Moves } from 'immutable-chess/moves';
import { isLegal } from 'immutable-chess/rules';
import type { Move } from 'immutable-chess';

function legalMoves(board: Board, turn: PieceColor): Move[] {
  const gen = new Moves(board, { turnColor: turn });
  const pseudo = board.piecesOfColor(turn).flatMap(idx => gen.from(idx));
  return pseudo.filter(move => {
    const next = board.move(move);
    const result = isLegal(next, { turnColor: opponentOf(turn) });
    return !result.violations.some(v => v.type === 'opponentInCheck');
  });
}
```

## Detect checkmate

A side is in checkmate when it is in check AND has no legal moves.

```typescript
import { Board, PieceColor, opponentOf } from 'immutable-chess';
import { isLegal } from 'immutable-chess/rules';

function isInCheck(board: Board, color: PieceColor): boolean {
  // color is the side that just moved; opponent = color means opponent is in check
  const result = isLegal(board, { turnColor: opponentOf(color) });
  return result.violations.some(v => v.type === 'opponentInCheck');
}

function isCheckmate(board: Board, turn: PieceColor): boolean {
  if (!isInCheck(board, opponentOf(turn))) return false;
  return legalMoves(board, turn).length === 0;
}
```

## Detect stalemate

```typescript
function isStalemate(board: Board, turn: PieceColor): boolean {
  if (isInCheck(board, opponentOf(turn))) return false;
  return legalMoves(board, turn).length === 0;
}
```

## Find all squares a piece attacks

```typescript
import { Moves } from 'immutable-chess/moves';
import { pieceColor } from 'immutable-chess';

function attackedSquares(board: Board, index: number): number[] {
  const piece = board.at(index);
  if (piece === null) return [];
  const gen = new Moves(board, { turnColor: pieceColor(piece) });
  return gen.from(index).map(m => m.to);
}
```

## Check whether a square is under attack

```typescript
function isAttacked(board: Board, index: number, byColor: PieceColor): boolean {
  const gen = new Moves(board, { turnColor: byColor });
  return board.piecesOfColor(byColor).some(idx =>
    gen.from(idx).some(m => m.to === index)
  );
}
```

## Export FEN piece placement and print board

```typescript
import { ascii } from 'immutable-chess/ascii';

const fen = board.toFen();   // 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR'
console.log(ascii(board));
// 8 rnbqkbnr
// 7 pppppppp
// 6 ........
// 5 ........
// 4 ....P...
// 3 ........
// 2 PPPP.PPP
// 1 RNBQKBNR
//   abcdefgh
```

## Validate a board before use

```typescript
import { isLegal } from 'immutable-chess/rules';

function assertLegal(board: Board): void {
  const result = isLegal(board);
  if (!result.legal) {
    const msgs = result.violations.map(v => v.type).join(', ');
    throw new Error(`Illegal board: ${msgs}`);
  }
}
```

## Work with a non-standard board size

```typescript
const board = Board.empty(5, 5);  // 5×5 mini chess

// Coordinates: files a–e, ranks 1–5
board.fromSquare('c3');  // center square
board.toSquare(12);      // → 'c3' for a 5×5 board

// All helpers (moves, legality) work unchanged on any board size
const moves = new Moves(board, { turnColor: PieceColor.White });
```

## Promote a pawn

The library generates the move to the back rank but does not apply promotion automatically. Handle it after applying the move:

```typescript
function applyMoveWithPromotion(
  board: Board,
  move: Move,
  promoteTo: Piece,
): Board {
  let next = board.move(move);
  const piece = next.at(move.to);
  if (piece !== null && pieceKind(piece) === PieceKind.Pawn) {
    const rank = next.rank(move.to);
    const isBackRank = rank === 0 || rank === next.height - 1;
    if (isBackRank) {
      next = next.place(move.to, promoteTo);
    }
  }
  return next;
}
```

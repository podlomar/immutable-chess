# Pieces

```typescript
import { Piece, PieceColor, PieceKind, PieceSymbol, pieceKind, pieceColor, pieceSymbol, opponentOf } from 'immutable-chess';
```

## Encoding

Pieces are bit-packed integers:

```
bits [3:1]  — PieceKind  (piece type)
bit  [0]    — PieceColor (0 = Black, 1 = White)
```

The value `0` means "empty square" (not a valid `Piece`). The `Board` stores pieces as a `Uint8Array` using this encoding directly.

## Piece enum

`Piece` is a regular enum (usable as a runtime value).

| Name | Value |
|------|-------|
| `Piece.WhitePawn` | `0b0011` |
| `Piece.BlackPawn` | `0b0010` |
| `Piece.WhiteKnight` | `0b0101` |
| `Piece.BlackKnight` | `0b0100` |
| `Piece.WhiteBishop` | `0b0111` |
| `Piece.BlackBishop` | `0b0110` |
| `Piece.WhiteRook` | `0b1001` |
| `Piece.BlackRook` | `0b1000` |
| `Piece.WhiteQueen` | `0b1011` |
| `Piece.BlackQueen` | `0b1010` |
| `Piece.WhiteKing` | `0b1101` |
| `Piece.BlackKing` | `0b1100` |

## PieceColor enum

```typescript
PieceColor.White  // 1
PieceColor.Black  // 0
```

`PieceColor` is a regular enum — safe to use as a map key or array index.

## PieceKind const enum

```typescript
PieceKind.Pawn    // 0b001
PieceKind.Knight  // 0b010
PieceKind.Bishop  // 0b011
PieceKind.Rook    // 0b100
PieceKind.Queen   // 0b101
PieceKind.King    // 0b110
```

`PieceKind` is a `const enum` — values are inlined at compile time. It cannot be iterated at runtime.

## PieceSymbol type

```typescript
type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
```

Always lowercase. White and Black pieces share the same symbol; color must be determined separately.

## Helper functions

```typescript
pieceKind(piece: Piece): PieceKind
// Extract the piece type
// pieceKind(Piece.WhiteQueen) → PieceKind.Queen

pieceColor(piece: Piece): PieceColor
// Extract the piece color
// pieceColor(Piece.BlackKnight) → PieceColor.Black

pieceSymbol(piece: Piece): PieceSymbol
// Convert to lowercase FEN letter
// pieceSymbol(Piece.WhiteRook) → 'r'
// pieceSymbol(Piece.BlackRook) → 'r'

opponentOf(color: PieceColor): PieceColor
// Return the opposite color
// opponentOf(PieceColor.White) → PieceColor.Black
```

## Common patterns

### Check if a square has a piece of a specific kind

```typescript
const p = board.at(index);
if (p !== null && pieceKind(p) === PieceKind.King) { ... }
```

### Check if a piece belongs to the current player

```typescript
const p = board.at(index);
if (p !== null && pieceColor(p) === currentColor) { ... }
```

### Find the white king

```typescript
const kingIndex = board.findPiece(p => p === Piece.WhiteKing);
```

### Find all rooks regardless of color

```typescript
const rookIndices = board.findPieces(p => pieceKind(p) === PieceKind.Rook);
```

### Iterate all pieces of a color with their kinds

```typescript
for (const idx of board.piecesOfColor(PieceColor.Black)) {
  const p = board.at(idx)!;
  const kind = pieceKind(p);
  // ...
}
```

# Position Legality

```typescript
import { isLegal } from 'immutable-chess/rules';
import type { LegalityOptions, LegalityResult, Violation } from 'immutable-chess/rules';
import { PieceColor } from 'immutable-chess';
```

## Overview

`isLegal` checks whether a board position satisfies a set of configurable constraints. It returns every violation found — the result is never short-circuited.

## LegalityOptions

All fields are optional. Defaults shown below.

```typescript
interface LegalityOptions {
  kings: 'required' | 'optional';           // default: 'required'
  pawnsOnBackRank: 'forbidden' | 'allowed'; // default: 'forbidden'
  turnColor: PieceColor | null;             // default: null
}
```

### `kings`

| Value | Meaning |
|-------|---------|
| `'required'` | Each color must have **exactly one** king. Generates `missingKing` if absent, `extraKing` if more than one. |
| `'optional'` | Each color may have 0 or 1 king. Only generates `extraKing` if more than one. |

### `pawnsOnBackRank`

| Value | Meaning |
|-------|---------|
| `'forbidden'` | Pawns on rank 0 or rank `height - 1` are illegal. Generates one `pawnOnBackRank` violation per offending pawn. |
| `'allowed'` | No pawn placement check. |

### `turnColor`

When set to a `PieceColor`, the function checks that the **opponent** of that color is not currently in check (i.e. the side that just moved did not leave the opponent in check from an already-applied position). Generates `opponentInCheck` if the opponent's king is under attack.

Setting `turnColor: PieceColor.White` means "it is white's turn to move; verify black's king is not attacked."

`null` disables the check detection entirely.

## LegalityResult

```typescript
interface LegalityResult {
  legal: boolean;         // true only if violations is empty
  violations: Violation[];
}
```

## Violation union type

```typescript
type Violation =
  | { type: 'missingKing';      color: PieceColor }
  | { type: 'extraKing';        color: PieceColor; count: number }
  | { type: 'pawnOnBackRank';   index: number }
  | { type: 'opponentInCheck' }
```

### missingKing

Generated when `kings: 'required'` and a color has no king.

```typescript
{ type: 'missingKing', color: PieceColor.Black }
```

### extraKing

Generated when a color has more than one king. `count` is the actual number found.

```typescript
{ type: 'extraKing', color: PieceColor.White, count: 3 }
```

### pawnOnBackRank

Generated when `pawnsOnBackRank: 'forbidden'` and a pawn sits on rank 0 or rank `height - 1`. `index` is the flat board index of the offending pawn.

```typescript
{ type: 'pawnOnBackRank', index: 4 }
```

### opponentInCheck

Generated when `turnColor` is set and the opponent's king is attacked by any piece of the current player.

```typescript
{ type: 'opponentInCheck' }
```

## Usage examples

### Default validation (strict)

```typescript
const result = isLegal(board);
// kings: 'required', pawnsOnBackRank: 'forbidden', turnColor: null
```

### With check detection

```typescript
// After white just moved, verify position is legal for white's turn
const result = isLegal(board, { turnColor: PieceColor.White });
if (!result.legal) {
  const inCheck = result.violations.some(v => v.type === 'opponentInCheck');
  // white left black's king in check — the move was illegal
}
```

### Puzzle / variant board without kings

```typescript
const result = isLegal(board, { kings: 'optional', pawnsOnBackRank: 'allowed' });
```

### Inspect all violations

```typescript
const { legal, violations } = isLegal(board);
for (const v of violations) {
  switch (v.type) {
    case 'missingKing':
      console.log(`Missing king for ${v.color === PieceColor.White ? 'white' : 'black'}`);
      break;
    case 'extraKing':
      console.log(`${v.count} kings for color ${v.color}`);
      break;
    case 'pawnOnBackRank':
      console.log(`Pawn on back rank at index ${v.index} (${board.toSquare(v.index)})`);
      break;
    case 'opponentInCheck':
      console.log('Opponent king is in check');
      break;
  }
}
```

## Relationship to move generation

`isLegal` does not generate moves itself for most checks, but when `turnColor` is set it internally creates a `Moves` instance for the opponent to detect check. This makes full legal-move filtering possible by applying candidate moves and re-checking:

```typescript
function isMoveLegal(board: Board, move: Move, turn: PieceColor): boolean {
  const next = board.move(move);
  const result = isLegal(next, { turnColor: opponentOf(turn) });
  return !result.violations.some(v => v.type === 'opponentInCheck');
}
```

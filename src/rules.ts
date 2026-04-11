import type { Board } from './board.js';
import { Moves } from './moves.js';
import { PieceColor, PieceKind, opponentOf, pieceColor, pieceKind } from './piece.js';

export interface LegalityOptions {
  /**
   * Whether kings are required on the board.
   * - 'required': each color must have exactly 1 king (default)
   * - 'optional': each color may have 0 or 1 king; having 2+ is still illegal
   */
  kings: 'required' | 'optional';

  /**
   * Whether pawns are allowed on the first or last rank.
   * - 'forbidden': any pawn on rank 0 or rank height-1 is a violation (default)
   * - 'allowed': pawn placement is unconstrained
   */
  pawnsOnBackRank: 'forbidden' | 'allowed';

  /**
   * The color whose turn it is to move. When set, checks that the opponent's
   * king is not currently in check (i.e. the side that just moved did not
   * leave their own king in check). When null, this check is skipped.
   */
  turnColor: PieceColor | null;
}

export type Violation =
  | { type: 'missingKing'; color: PieceColor }
  | { type: 'extraKing'; color: PieceColor; count: number }
  | { type: 'pawnOnBackRank'; index: number }
  | { type: 'opponentInCheck' };

export interface LegalityResult {
  legal: boolean;
  violations: Violation[];
}

const DEFAULT_OPTIONS: LegalityOptions = {
  kings: 'required',
  pawnsOnBackRank: 'forbidden',
  turnColor: null,
};

export function isLegal(board: Board, options?: Partial<LegalityOptions>): LegalityResult {
  const opts: LegalityOptions = { ...DEFAULT_OPTIONS, ...options };
  const violations: Violation[] = [];

  // King count checks
  for (const color of [PieceColor.White, PieceColor.Black]) {
    const kingSquares = board.findPieces(
      (p) => pieceColor(p) === color && pieceKind(p) === PieceKind.King,
    );
    if (opts.kings === 'required' && kingSquares.length === 0) {
      violations.push({ type: 'missingKing', color });
    }
    if (kingSquares.length > 1) {
      violations.push({ type: 'extraKing', color, count: kingSquares.length });
    }
  }

  // Pawn placement check
  if (opts.pawnsOnBackRank === 'forbidden') {
    const pawnSquares = board.findPieces((p) => pieceKind(p) === PieceKind.Pawn);
    for (const index of pawnSquares) {
      const rank = board.rank(index);
      if (rank === 0 || rank === board.height - 1) {
        violations.push({ type: 'pawnOnBackRank', index });
      }
    }
  }

  // Check detection: the side that just moved must not have left the opponent's king in check
  if (opts.turnColor !== null) {
    const opponent = opponentOf(opts.turnColor);
    const opponentKing = board.findPiece(
      (p) => pieceColor(p) === opponent && pieceKind(p) === PieceKind.King,
    );
    if (opponentKing !== null) {
      const moves = new Moves(board, { turnColor: opts.turnColor });
      const attackerSquares = board.piecesOfColor(opts.turnColor);
      const inCheck = attackerSquares.some((from) =>
        moves.from(from).some((move) => move.to === opponentKing),
      );
      if (inCheck) {
        violations.push({ type: 'opponentInCheck' });
      }
    }
  }

  return { legal: violations.length === 0, violations };
}

import type { Board } from './board.js';
import { PieceColor, PieceKind, pieceColor, pieceKind } from './piece.js';

export interface Move {
  readonly from: number;
  readonly to: number;
}

type Delta = readonly [number, number]; // [rank delta, file delta]

const STRAIGHT: readonly Delta[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const DIAGONAL: readonly Delta[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
const ALL_DIRS: readonly Delta[] = [...STRAIGHT, ...DIAGONAL];
const KNIGHT_DELTAS: readonly Delta[] = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];

export class Moves {
  private readonly board: Board;

  public constructor(board: Board) {
    this.board = board;
  }

  public for(from: number): Move[] {
    const piece = this.board.at(from);
    if (piece === null) {
      return [];
    }
    switch (pieceKind(piece)) {
      case PieceKind.Rook:
        return this.slidingMoves(from, pieceColor(piece), STRAIGHT);
      case PieceKind.Bishop:
        return this.slidingMoves(from, pieceColor(piece), DIAGONAL);
      case PieceKind.Queen:
        return this.slidingMoves(from, pieceColor(piece), ALL_DIRS);
      case PieceKind.King:
        return this.steppingMoves(from, pieceColor(piece), ALL_DIRS);
      case PieceKind.Knight:
        return this.steppingMoves(from, pieceColor(piece), KNIGHT_DELTAS);
      case PieceKind.Pawn:
        return this.pawnMoves(from, pieceColor(piece));
    }
  }

  private slidingMoves(from: number, color: PieceColor, directions: readonly Delta[]): Move[] {
    const rank = this.board.rank(from);
    const file = this.board.file(from);
    const moves: Move[] = [];

    for (const [dr, df] of directions) {
      let r = rank + dr;
      let f = file + df;
      while (r >= 0 && r < this.board.height && f >= 0 && f < this.board.width) {
        const to = this.board.index(r, f);
        const occupant = this.board.at(to);
        if (occupant !== null) {
          if (pieceColor(occupant) !== color) {
            moves.push({ from, to });
          }
          break;
        }
        moves.push({ from, to });
        r += dr;
        f += df;
      }
    }
    return moves;
  }

  private steppingMoves(from: number, color: PieceColor, deltas: readonly Delta[]): Move[] {
    const rank = this.board.rank(from);
    const file = this.board.file(from);
    const moves: Move[] = [];

    for (const [dr, df] of deltas) {
      const r = rank + dr;
      const f = file + df;
      if (r < 0 || r >= this.board.height || f < 0 || f >= this.board.width) {
        continue;
      }
      const to = this.board.index(r, f);
      const occupant = this.board.at(to);
      if (occupant === null || pieceColor(occupant) !== color) {
        moves.push({ from, to });
      }
    }
    return moves;
  }

  private pawnMoves(from: number, color: PieceColor): Move[] {
    const dr = color === PieceColor.White ? 1 : -1;
    const startRank = color === PieceColor.White ? 1 : this.board.height - 2;
    const rank = this.board.rank(from);
    const file = this.board.file(from);
    const moves: Move[] = [];

    const r1 = rank + dr;
    if (r1 >= 0 && r1 < this.board.height) {
      const to1 = this.board.index(r1, file);
      if (this.board.at(to1) === null) {
        moves.push({ from, to: to1 });
        const r2 = rank + 2 * dr;
        if (rank === startRank && r2 >= 0 && r2 < this.board.height) {
          const to2 = this.board.index(r2, file);
          if (this.board.at(to2) === null) {
            moves.push({ from, to: to2 });
          }
        }
      }
      for (const df of [-1, 1]) {
        const f = file + df;
        if (f >= 0 && f < this.board.width) {
          const to = this.board.index(r1, f);
          const occupant = this.board.at(to);
          if (occupant !== null && pieceColor(occupant) !== color) {
            moves.push({ from, to });
          }
        }
      }
    }
    return moves;
  }
}

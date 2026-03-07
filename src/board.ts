import { type Piece, PieceColor, pieceColor } from './piece.js';
import { pieceSymbol } from './piece.js';

const MAX_BOARD_SIZE = 26;
const ALGEBRAIC_REGEX = /^[a-z][1-9][0-9]{0,1}$/;

export class Board {
  private readonly squares: Uint8Array;

  public readonly width: number;
  public readonly height: number;
  public readonly turnColor: PieceColor = PieceColor.White;

  private constructor(width: number, height: number, squares: Uint8Array) {
    this.squares = squares;
    this.width = width;
    this.height = height;
  }

  public static empty(width = 8, height: number = width): Board {
    if (width <= 0 || width > MAX_BOARD_SIZE || height <= 0 || height > MAX_BOARD_SIZE) {
      throw new RangeError(`Board dimensions must be between 1 and ${MAX_BOARD_SIZE}`);
    }

    return new Board(width, height, new Uint8Array(width * height));
  }

  public at(index: number): Piece | null {
    if (!this.inBounds(index)) {
      throw new RangeError('Square out of bounds');
    }

    const pieceValue = this.squares[index];
    return pieceValue === 0 ? null : (pieceValue as Piece);
  }

  public with(index: number, piece: Piece | null): Board {
    const newSquares = this.squares.slice();
    newSquares[index] = piece === null ? 0 : piece;
    return new Board(this.width, this.height, newSquares);
  }

  public withSquare(algebraic: string, piece: Piece | null): Board {
    const index = this.fromAlgebraic(algebraic);
    return this.with(index, piece);
  }

  public fromAlgebraic(algebraic: string): number {
    if (!ALGEBRAIC_REGEX.test(algebraic)) {
      throw new Error('Invalid algebraic notation');
    }

    const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = Number.parseInt(algebraic.slice(1)) - 1;
    return this.index(rank, file);
  }

  public index(rank: number, file: number): number {
    if (rank < 0 || rank >= this.height || file < 0 || file >= this.width) {
      throw new RangeError('Square out of bounds');
    }
    return (this.height - 1 - rank) * this.width + file;
  }

  public inBounds(index: number): boolean {
    return index >= 0 && index < this.squares.length;
  }

  public rank(index: number): number {
    if (!this.inBounds(index)) {
      throw new RangeError('Square out of bounds');
    }
    return this.height - 1 - Math.floor(index / this.width);
  }

  public file(index: number): number {
    if (!this.inBounds(index)) {
      throw new RangeError('Square out of bounds');
    }
    return index % this.width;
  }

  public toFen(): string {
    let fen = '';
    for (let rank = this.height - 1; rank >= 0; rank--) {
      let emptyCount = 0;
      for (let file = 0; file < this.width; file++) {
        const piece = this.at(this.index(rank, file));
        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount.toString();
            emptyCount = 0;
          }
          const symbol = pieceSymbol(piece);
          fen += pieceColor(piece) === PieceColor.White ? symbol.toUpperCase() : symbol;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount.toString();
      }
      if (rank > 0) {
        fen += '/';
      }
    }
    return fen;
  }
}

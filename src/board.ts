import { type Piece, PieceColor, pieceColor } from './piece.js';
import { pieceSymbol } from './piece.js';

const MAX_BOARD_SIZE = 26; // Limited by the algebraic notation (a-z for files)

export interface Move {
  readonly from: number;
  readonly to: number;
}

export type SquareColor = 'light' | 'dark';

const FILE_A = 'a'.charCodeAt(0);

export class Board {
  private readonly squares: Uint8Array;

  public readonly width: number;
  public readonly height: number;

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

  public atSquare(square: string): Piece | null {
    const index = this.fromSquare(square);
    return this.at(index);
  }

  public place(index: number, piece: Piece | null): Board {
    const newSquares = this.squares.slice();
    newSquares[index] = piece === null ? 0 : piece;
    return new Board(this.width, this.height, newSquares);
  }

  public placeSquare(square: string, piece: Piece | null): Board {
    const index = this.fromSquare(square);
    return this.place(index, piece);
  }

  public move(move: Move): Board {
    const piece = this.squares[move.from];
    if (piece === 0) {
      throw new Error('No piece at the source square');
    }

    const newSquares = this.squares.slice();
    newSquares[move.to] = piece;
    newSquares[move.from] = 0;
    return new Board(this.width, this.height, newSquares);
  }

  public toSquare(index: number): string {
    if (!this.inBounds(index)) {
      throw new RangeError('Square out of bounds');
    }

    const file = this.file(index);
    const rank = this.rank(index);
    return `${String.fromCharCode(FILE_A + file)}${rank + 1}`;
  }

  public squareColor(index: number): SquareColor {
    if (!this.inBounds(index)) {
      throw new RangeError('Square out of bounds');
    }

    const rank = this.rank(index);
    const file = this.file(index);
    return (rank + file) % 2 === 0 ? 'dark' : 'light';
  }

  public fromSquare(square: string): number {
    if (square.length < 2 || square.length > 3) {
      throw new Error('Invalid algebraic notation');
    }

    const file = square.charCodeAt(0) - FILE_A;
    const rank = Number.parseInt(square.slice(1)) - 1;
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

  public findPieces(fn: (piece: Piece) => boolean): number[] {
    const result: number[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const p = this.squares[i];
      if (p !== 0 && fn(p as Piece)) {
        result.push(i);
      }
    }

    return result;
  }

  public findPiece(fn: (piece: Piece) => boolean): number | null {
    for (let i = 0; i < this.squares.length; i++) {
      const p = this.squares[i];
      if (p !== 0 && fn(p as Piece)) {
        return i;
      }
    }

    return null;
  }

  public piecesOfColor(color: PieceColor): number[] {
    return this.findPieces((piece) => pieceColor(piece) === color);
  }

  public emptySquares(): number[] {
    const result: number[] = [];
    for (let i = 0; i < this.squares.length; i++) {
      if (this.squares[i] === 0) {
        result.push(i);
      }
    }
    return result;
  }

  public toFen(): string {
    let fen = '';
    for (let rank = this.height - 1; rank >= 0; rank--) {
      let emptyCount = 0;
      for (let file = 0; file < this.width; file++) {
        const piece = this.squares[this.index(rank, file)];
        if (piece === 0) {
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

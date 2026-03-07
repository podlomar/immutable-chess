export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

// biome-ignore lint/suspicious/noConstEnum: <explanation>
export const enum Piece {
  WhitePawn = 0b0011,
  BlackPawn = 0b0010,
  WhiteKnight = 0b0101,
  BlackKnight = 0b0100,
  WhiteBishop = 0b0111,
  BlackBishop = 0b0110,
  WhiteRook = 0b1001,
  BlackRook = 0b1000,
  WhiteQueen = 0b1011,
  BlackQueen = 0b1010,
  WhiteKing = 0b1101,
  BlackKing = 0b1100,
}

// biome-ignore lint/suspicious/noConstEnum: <explanation>
export const enum PieceKind {
  Pawn = 0b001,
  Knight = 0b010,
  Bishop = 0b011,
  Rook = 0b100,
  Queen = 0b101,
  King = 0b110,
}

// biome-ignore lint/suspicious/noConstEnum: <explanation>
export const enum PieceColor {
  Black = 0,
  White = 1,
}

export const pieceKind = (piece: Piece): PieceKind => (piece >> 1) as PieceKind;

export const pieceColor = (piece: Piece): PieceColor => (piece & 0b1) as PieceColor;

export const pieceSymbol = (piece: Piece): PieceSymbol => {
  const kind = pieceKind(piece);
  switch (kind) {
    case 0b001:
      return 'p';
    case 0b010:
      return 'n';
    case 0b011:
      return 'b';
    case 0b100:
      return 'r';
    case 0b101:
      return 'q';
    case 0b110:
      return 'k';
    default:
      throw new Error('Invalid piece value');
  }
};

export const opponentOf = (color: PieceColor): PieceColor =>
  color === PieceColor.White ? PieceColor.Black : PieceColor.White;

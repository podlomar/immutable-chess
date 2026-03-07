import type { Board } from './board.js';
import { Piece, PieceColor, pieceColor, pieceSymbol } from './piece.js';

export const ascii = (board: Board): string => {
  let result = '';
  for (let rank = board.height - 1; rank >= 0; rank--) {
    for (let file = 0; file < board.width; file++) {
      const piece = board.at(board.index(rank, file));
      result += piece
        ? pieceColor(piece) === PieceColor.White
          ? pieceSymbol(piece).toUpperCase()
          : pieceSymbol(piece)
        : '.';
    }
    result += '\n';
  }
  return result;
};

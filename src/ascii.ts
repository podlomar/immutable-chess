import type { Board } from './board.js';
import { PieceColor, pieceColor, pieceSymbol } from './piece.js';

export const ascii = (board: Board): string => {
  const rankLabelWidth = board.height >= 10 ? 2 : 1;
  const indent = ' '.repeat(rankLabelWidth + 1);

  let result = '';
  for (let rank = board.height - 1; rank >= 0; rank--) {
    result += `${(rank + 1).toString().padStart(rankLabelWidth)} `;
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
  result += indent;
  for (let file = 0; file < board.width; file++) {
    result += String.fromCharCode('a'.charCodeAt(0) + file);
  }
  result += '\n';
  return result;
};

import type { Board } from './board.js';
import { PieceColor, pieceColor, pieceSymbol } from './piece.js';

const FILE_A = 'a'.charCodeAt(0);

export const ascii = (board: Board, flip = false): string => {
  const rankLabelWidth = board.height >= 10 ? 2 : 1;
  const indent = ' '.repeat(rankLabelWidth + 1);

  const result = board.map(
    (piece) =>
      piece
        ? pieceColor(piece) === PieceColor.White
          ? pieceSymbol(piece).toUpperCase()
          : pieceSymbol(piece)
        : '.',
    flip,
  );

  const rankLines = result.map((row, i) => {
    const rankNumber = flip ? i + 1 : board.height - i;
    return `${rankNumber.toString().padStart(rankLabelWidth)} ${row.join('')}`;
  });

  const fileLetters = Array.from({ length: board.width }, (_, f) =>
    String.fromCharCode(FILE_A + f),
  ).join('');

  return `${rankLines.join('\n')}\n${indent}${fileLetters}\n`;
};

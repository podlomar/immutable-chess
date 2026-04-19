import type { Board } from './board.js';
import { PieceColor, pieceColor, pieceLetter, pieceSymbol } from './piece.js';

const FILE_A = 'a'.charCodeAt(0);

export const ascii = (board: Board, flip = false): string => {
  const rankLabelWidth = board.height >= 10 ? 2 : 1;
  const indent = ' '.repeat(rankLabelWidth + 1);

  const result = board.map((piece) => (piece ? pieceLetter(piece) : '.'), flip);

  const rankLines = result.map((row, i) => {
    const rankNumber = flip ? i + 1 : board.height - i;
    return `${rankNumber.toString().padStart(rankLabelWidth)} ${row.join('')}`;
  });

  const fileLetters = Array.from({ length: board.width }, (_, f) => {
    const file = flip ? board.width - 1 - f : f;
    return String.fromCharCode(FILE_A + file);
  }).join('');

  return `${rankLines.join('\n')}\n${indent}${fileLetters}\n`;
};

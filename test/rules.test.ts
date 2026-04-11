import { expect } from 'chai';
import { Board, Piece, PieceColor, isLegal } from '../src/index.js';

// Helpers for building boards concisely
const empty = Board.empty();

const withPieces = (...placements: [string, Piece][]): Board =>
  placements.reduce((b, [sq, piece]) => b.placeSquare(sq, piece), Board.empty());

// ── King count checks ─────────────────────────────────────────────────────────

describe('isLegal — kings: required (default)', () => {
  it('is legal with exactly one king of each color', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing]);
    expect(isLegal(board).legal).to.be.true;
  });

  it('is illegal when white king is missing', () => {
    const board = withPieces(['e8', Piece.BlackKing]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'missingKing', color: PieceColor.White });
  });

  it('is illegal when black king is missing', () => {
    const board = withPieces(['e1', Piece.WhiteKing]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'missingKing', color: PieceColor.Black });
  });

  it('is illegal when both kings are missing', () => {
    const result = isLegal(empty);
    const types = result.violations.map((v) => v.type);
    expect(types.filter((t) => t === 'missingKing')).to.have.length(2);
  });

  it('is illegal with two white kings', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['d1', Piece.WhiteKing], ['e8', Piece.BlackKing]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'extraKing', color: PieceColor.White, count: 2 });
  });

  it('is illegal with two black kings', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['d8', Piece.BlackKing]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'extraKing', color: PieceColor.Black, count: 2 });
  });
});

describe('isLegal — kings: optional', () => {
  it('is legal with no kings', () => {
    const result = isLegal(empty, { kings: 'optional' });
    expect(result.legal).to.be.true;
  });

  it('is legal with only a white king', () => {
    const board = withPieces(['e1', Piece.WhiteKing]);
    expect(isLegal(board, { kings: 'optional' }).legal).to.be.true;
  });

  it('is legal with only a black king', () => {
    const board = withPieces(['e8', Piece.BlackKing]);
    expect(isLegal(board, { kings: 'optional' }).legal).to.be.true;
  });

  it('is legal with exactly one king of each color', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing]);
    expect(isLegal(board, { kings: 'optional' }).legal).to.be.true;
  });

  it('is still illegal with two kings of the same color', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['d1', Piece.WhiteKing]);
    const result = isLegal(board, { kings: 'optional' });
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'extraKing', color: PieceColor.White, count: 2 });
  });
});

// ── Pawn placement checks ─────────────────────────────────────────────────────

describe('isLegal — pawnsOnBackRank: forbidden (default)', () => {
  it('is legal with pawns on valid ranks', () => {
    const board = withPieces(
      ['e1', Piece.WhiteKing],
      ['e8', Piece.BlackKing],
      ['e2', Piece.WhitePawn],
      ['e7', Piece.BlackPawn],
    );
    expect(isLegal(board).legal).to.be.true;
  });

  it('is illegal with a white pawn on rank 1 (index rank 0)', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['a1', Piece.WhitePawn]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    const pawnViolation = result.violations.find((v) => v.type === 'pawnOnBackRank');
    expect(pawnViolation).to.exist;
  });

  it('is illegal with a white pawn on rank 8 (promotion square)', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['a8', Piece.WhitePawn]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    const pawnViolation = result.violations.find((v) => v.type === 'pawnOnBackRank');
    expect(pawnViolation).to.exist;
  });

  it('is illegal with a black pawn on rank 1', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['h1', Piece.BlackPawn]);
    const result = isLegal(board);
    expect(result.legal).to.be.false;
    const pawnViolation = result.violations.find((v) => v.type === 'pawnOnBackRank');
    expect(pawnViolation).to.exist;
  });

  it('reports one violation per illegal pawn', () => {
    const board = withPieces(
      ['e1', Piece.WhiteKing],
      ['e8', Piece.BlackKing],
      ['a1', Piece.WhitePawn],
      ['h8', Piece.BlackPawn],
    );
    const result = isLegal(board);
    const pawnViolations = result.violations.filter((v) => v.type === 'pawnOnBackRank');
    expect(pawnViolations).to.have.length(2);
  });
});

describe('isLegal — pawnsOnBackRank: allowed', () => {
  it('is legal with a pawn on rank 1', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['a1', Piece.WhitePawn]);
    expect(isLegal(board, { pawnsOnBackRank: 'allowed' }).legal).to.be.true;
  });

  it('is legal with a pawn on rank 8', () => {
    const board = withPieces(['e1', Piece.WhiteKing], ['e8', Piece.BlackKing], ['a8', Piece.BlackPawn]);
    expect(isLegal(board, { pawnsOnBackRank: 'allowed' }).legal).to.be.true;
  });

  it('works together with kings: optional for a 3x3 puzzle board', () => {
    const b = Board.empty(3, 3);
    const board = b.placeSquare('a1', Piece.WhitePawn).placeSquare('c3', Piece.BlackPawn);
    expect(isLegal(board, { kings: 'optional', pawnsOnBackRank: 'allowed' }).legal).to.be.true;
  });
});

// ── Check detection ───────────────────────────────────────────────────────────

describe('isLegal — turnColor / opponentInCheck', () => {
  it('is legal when no king is in check', () => {
    const board = withPieces(
      ['e1', Piece.WhiteKing],
      ['e8', Piece.BlackKing],
      ['d4', Piece.WhiteRook],
    );
    expect(isLegal(board, { turnColor: PieceColor.White }).legal).to.be.true;
  });

  it('is illegal when the opponent (black) king is in check', () => {
    // White rook on e1, black king on e8 — same file, rook gives check
    const board = withPieces(['e1', Piece.WhiteRook], ['e1', Piece.WhiteKing]);
    // Put white rook on e1 and black king on e8
    const b = withPieces(['a1', Piece.WhiteKing], ['e1', Piece.WhiteRook], ['e8', Piece.BlackKing]);
    const result = isLegal(b, { turnColor: PieceColor.White });
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'opponentInCheck' });
  });

  it('is illegal when white just moved and left black king in check via bishop', () => {
    // White bishop on b2, black king on e5, diagonal attack
    const board = withPieces(
      ['a1', Piece.WhiteKing],
      ['b2', Piece.WhiteBishop],
      ['e5', Piece.BlackKing],
    );
    const result = isLegal(board, { turnColor: PieceColor.White });
    expect(result.legal).to.be.false;
    expect(result.violations).to.deep.include({ type: 'opponentInCheck' });
  });

  it('skips check detection when turnColor is null (default)', () => {
    // Would be an opponentInCheck violation if turnColor were set
    const board = withPieces(
      ['a1', Piece.WhiteKing],
      ['e1', Piece.WhiteRook],
      ['e8', Piece.BlackKing],
    );
    expect(isLegal(board).legal).to.be.true;
  });

  it('skips check detection when opponent has no king (kings: optional)', () => {
    // No black king means no square to check for check
    const board = withPieces(['a1', Piece.WhiteKing], ['e1', Piece.WhiteRook]);
    const result = isLegal(board, { kings: 'optional', turnColor: PieceColor.White });
    expect(result.violations.find((v) => v.type === 'opponentInCheck')).to.not.exist;
  });
});

// ── Multiple simultaneous violations ─────────────────────────────────────────

describe('isLegal — multiple violations at once', () => {
  it('reports both missing kings and a pawn on the back rank together', () => {
    const board = withPieces(['a1', Piece.WhitePawn]);
    const result = isLegal(board);
    const types = result.violations.map((v) => v.type);
    expect(types).to.include('missingKing');
    expect(types).to.include('pawnOnBackRank');
    expect(result.legal).to.be.false;
  });
});

import { expect } from 'chai';
import { Board, Piece } from '../src/index.js';
import { ascii } from '../src/ascii.js';

describe('ascii()', () => {
  it('renders an empty 8x8 board with correct structure', () => {
    const output = ascii(Board.empty());
    const lines = output.trimEnd().split('\n');
    expect(lines).to.have.length(9); // 8 rank lines + file labels
    expect(lines[8]).to.equal('  abcdefgh');
  });

  it('renders rank numbers 8 down to 1 by default', () => {
    const lines = ascii(Board.empty()).trimEnd().split('\n');
    expect(lines[0]).to.match(/^8 /);
    expect(lines[7]).to.match(/^1 /);
  });

  it('renders rank numbers 1 up to 8 when flipped', () => {
    const lines = ascii(Board.empty(), true).trimEnd().split('\n');
    expect(lines[0]).to.match(/^1 /);
    expect(lines[7]).to.match(/^8 /);
  });

  it('renders file labels a–h at the bottom', () => {
    const lines = ascii(Board.empty()).trimEnd().split('\n');
    expect(lines[lines.length - 1]).to.equal('  abcdefgh');
  });

  it('renders file labels h–a at the bottom when flipped', () => {
    const lines = ascii(Board.empty(), true).trimEnd().split('\n');
    expect(lines[lines.length - 1]).to.equal('  hgfedcba');
  });

  it('renders empty squares as dots', () => {
    const lines = ascii(Board.empty()).trimEnd().split('\n');
    for (let i = 0; i < 8; i++) {
      expect(lines[i].slice(2)).to.equal('........');
    }
  });

  it('renders white pieces as uppercase', () => {
    const board = Board.empty().placeSquare('e1', Piece.WhiteKing);
    expect(ascii(board)).to.include('K');
    expect(ascii(board)).to.not.include('k');
  });

  it('renders black pieces as lowercase', () => {
    const board = Board.empty().placeSquare('e8', Piece.BlackKing);
    expect(ascii(board)).to.include('k');
  });

  it('places a piece on the correct square', () => {
    const board = Board.empty().placeSquare('a8', Piece.BlackRook);
    const lines = ascii(board).trimEnd().split('\n');
    // rank 8 is line 0; a-file is first character after the label
    expect(lines[0]).to.equal('8 r.......');
  });

  it('places a piece on h1 correctly', () => {
    const board = Board.empty().placeSquare('h1', Piece.WhiteRook);
    const lines = ascii(board).trimEnd().split('\n');
    // rank 1 is line 7
    expect(lines[7]).to.equal('1 .......R');
  });

  it('matches the starting position FEN', () => {
    const board = Board.fromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    const lines = ascii(board).trimEnd().split('\n');
    expect(lines[0]).to.equal('8 rnbqkbnr');
    expect(lines[1]).to.equal('7 pppppppp');
    expect(lines[6]).to.equal('2 PPPPPPPP');
    expect(lines[7]).to.equal('1 RNBQKBNR');
  });

  it('flip shows the board from the opposite corner (h1 top-left)', () => {
    const board = Board.fromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    const lines = ascii(board, true).trimEnd().split('\n');
    // Rank 1 at top, reading h→a: h1=R n1=N f1=B e1=K d1=Q c1=B b1=N a1=R
    expect(lines[0]).to.equal('1 RNBKQBNR');
    expect(lines[1]).to.equal('2 PPPPPPPP');
    expect(lines[6]).to.equal('7 pppppppp');
    // Rank 8 at bottom, reading h→a: h8=r g8=n f8=b e8=k d8=q c8=b b8=n a8=r
    expect(lines[7]).to.equal('8 rnbkqbnr');
    expect(lines[8]).to.equal('  hgfedcba');
  });

  it('uses 2-digit rank labels for boards with 10+ ranks', () => {
    const board = Board.empty(8, 10);
    const lines = ascii(board).trimEnd().split('\n');
    expect(lines[0]).to.match(/^10 /);
    expect(lines[9]).to.match(/^ 1 /);
    expect(lines[10]).to.equal('   abcdefgh');
  });

  it('works correctly on a non-8x8 board', () => {
    const board = Board.empty(3, 3).placeSquare('a1', Piece.WhiteKing);
    const lines = ascii(board).trimEnd().split('\n');
    expect(lines[0]).to.equal('3 ...');
    expect(lines[1]).to.equal('2 ...');
    expect(lines[2]).to.equal('1 K..');
    expect(lines[3]).to.equal('  abc');
  });
});

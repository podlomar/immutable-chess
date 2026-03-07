import { expect } from 'chai';
import { Board, Piece } from '../src/index.js';

describe('Board.empty()', () => {
  it('creates an 8x8 board by default', () => {
    const board = Board.empty();
    expect(board.width).to.equal(8);
    expect(board.height).to.equal(8);
  });

  it('creates a square board when only width is given', () => {
    const board = Board.empty(5);
    expect(board.width).to.equal(5);
    expect(board.height).to.equal(5);
  });

  it('creates a rectangular board with explicit width and height', () => {
    const board = Board.empty(10, 6);
    expect(board.width).to.equal(10);
    expect(board.height).to.equal(6);
  });

  it('creates a board where all squares are empty', () => {
    const board = Board.empty();
    for (let i = 0; i < board.width * board.height; i++) {
      expect(board.at(i)).to.be.null;
    }
  });

  it('throws RangeError for width of 0', () => {
    expect(() => Board.empty(0, 8)).to.throw(RangeError);
  });

  it('throws RangeError for negative height', () => {
    expect(() => Board.empty(8, -1)).to.throw(RangeError);
  });

  it('throws RangeError for width exceeding maximum', () => {
    expect(() => Board.empty(27, 8)).to.throw(RangeError);
  });

  it('allows the maximum board size of 26', () => {
    const board = Board.empty(26, 26);
    expect(board.width).to.equal(26);
    expect(board.height).to.equal(26);
  });
});

describe('Board.inBounds()', () => {
  it('returns true for index 0', () => {
    expect(Board.empty().inBounds(0)).to.be.true;
  });

  it('returns true for the last valid index', () => {
    const board = Board.empty();
    expect(board.inBounds(board.width * board.height - 1)).to.be.true;
  });

  it('returns false for a negative index', () => {
    expect(Board.empty().inBounds(-1)).to.be.false;
  });

  it('returns false for index equal to board size', () => {
    const board = Board.empty();
    expect(board.inBounds(board.width * board.height)).to.be.false;
  });
});

describe('Board.index() / rank() / file()', () => {
  it('index(rank, file) and rank()/file() are inverses', () => {
    const board = Board.empty();
    for (let r = 0; r < board.height; r++) {
      for (let f = 0; f < board.width; f++) {
        const idx = board.index(r, f);
        expect(board.rank(idx)).to.equal(r);
        expect(board.file(idx)).to.equal(f);
      }
    }
  });

  it('index(0, 0) corresponds to a1', () => {
    const board = Board.empty();
    expect(board.index(0, 0)).to.equal(board.fromAlgebraic('a1'));
  });

  it('index(7, 7) corresponds to h8', () => {
    const board = Board.empty();
    expect(board.index(7, 7)).to.equal(board.fromAlgebraic('h8'));
  });

  it('throws RangeError for out-of-bounds rank', () => {
    expect(() => Board.empty().index(8, 0)).to.throw(RangeError);
  });

  it('throws RangeError for out-of-bounds file', () => {
    expect(() => Board.empty().index(0, 8)).to.throw(RangeError);
  });

  it('rank() throws RangeError for out-of-bounds index', () => {
    expect(() => Board.empty().rank(64)).to.throw(RangeError);
  });

  it('file() throws RangeError for out-of-bounds index', () => {
    expect(() => Board.empty().file(64)).to.throw(RangeError);
  });
});

describe('Board.fromAlgebraic()', () => {
  it('parses a1 as rank 0, file 0', () => {
    const board = Board.empty();
    expect(board.fromAlgebraic('a1')).to.equal(board.index(0, 0));
  });

  it('parses h8 as rank 7, file 7', () => {
    const board = Board.empty();
    expect(board.fromAlgebraic('h8')).to.equal(board.index(7, 7));
  });

  it('parses e4 as rank 3, file 4', () => {
    const board = Board.empty();
    expect(board.fromAlgebraic('e4')).to.equal(board.index(3, 4));
  });

  it('parses two-digit ranks (e.g. a10)', () => {
    const board = Board.empty(10, 10);
    expect(board.fromAlgebraic('a10')).to.equal(board.index(9, 0));
  });

  it('throws for empty string', () => {
    expect(() => Board.empty().fromAlgebraic('')).to.throw(Error);
  });

  it('throws for uppercase file letter', () => {
    expect(() => Board.empty().fromAlgebraic('E4')).to.throw(Error);
  });

  it('throws for rank starting with 0', () => {
    expect(() => Board.empty().fromAlgebraic('a0')).to.throw(Error);
  });
});

describe('Board.at()', () => {
  it('returns null for an empty square', () => {
    expect(Board.empty().at(0)).to.be.null;
  });

  it('throws RangeError for an out-of-bounds index', () => {
    expect(() => Board.empty().at(64)).to.throw(RangeError);
  });

  it('returns the piece after it has been placed', () => {
    const board = Board.empty();
    const idx = board.fromAlgebraic('e4');
    const updated = board.with(idx, Piece.WhiteKnight);
    expect(updated.at(idx)).to.equal(Piece.WhiteKnight);
  });
});

describe('Board.with()', () => {
  it('returns a new Board instance (immutable)', () => {
    const board = Board.empty();
    const updated = board.with(0, Piece.WhiteRook);
    expect(updated).to.not.equal(board);
  });

  it('does not mutate the original board', () => {
    const board = Board.empty();
    board.with(0, Piece.WhiteRook);
    expect(board.at(0)).to.be.null;
  });

  it('removes a piece when passed null', () => {
    const board = Board.empty();
    const idx = board.fromAlgebraic('d4');
    const withPiece = board.with(idx, Piece.BlackQueen);
    const withoutPiece = withPiece.with(idx, null);
    expect(withoutPiece.at(idx)).to.be.null;
  });

  it('can place all piece types', () => {
    const board = Board.empty();
    const pieces = [
      Piece.WhitePawn, Piece.BlackPawn,
      Piece.WhiteKnight, Piece.BlackKnight,
      Piece.WhiteBishop, Piece.BlackBishop,
      Piece.WhiteRook, Piece.BlackRook,
      Piece.WhiteQueen, Piece.BlackQueen,
      Piece.WhiteKing, Piece.BlackKing,
    ];
    pieces.forEach((piece, i) => {
      expect(board.with(i, piece).at(i)).to.equal(piece);
    });
  });
});

describe('Board.withSquare()', () => {
  it('places a piece using algebraic notation', () => {
    const board = Board.empty();
    const updated = board.withSquare('e2', Piece.WhitePawn);
    expect(updated.at(updated.fromAlgebraic('e2'))).to.equal(Piece.WhitePawn);
  });

  it('removes a piece using algebraic notation', () => {
    const board = Board.empty().withSquare('e2', Piece.WhitePawn);
    const cleared = board.withSquare('e2', null);
    expect(cleared.at(cleared.fromAlgebraic('e2'))).to.be.null;
  });

  it('throws for invalid algebraic notation', () => {
    expect(() => Board.empty().withSquare('E2', Piece.WhitePawn)).to.throw(Error);
  });

  it('preserves other squares unchanged', () => {
    const idx = Board.empty().fromAlgebraic('d4');
    const board = Board.empty()
      .withSquare('e2', Piece.WhitePawn)
      .withSquare('d4', Piece.BlackKnight);
    expect(board.at(board.fromAlgebraic('e2'))).to.equal(Piece.WhitePawn);
    expect(board.at(idx)).to.equal(Piece.BlackKnight);
  });
});

describe('Board.toFen()', () => {
  it('returns all-empty FEN for an empty board', () => {
    expect(Board.empty().toFen()).to.equal('8/8/8/8/8/8/8/8');
  });

  it('outputs a white pawn on e2 in the correct FEN rank', () => {
    const board = Board.empty().withSquare('e2', Piece.WhitePawn);
    // rank 2 = 7th row in FEN (FEN goes rank8..rank1)
    expect(board.toFen()).to.equal('8/8/8/8/8/8/4P3/8');
  });

  it('outputs a black rook on a8 at the start of FEN', () => {
    const board = Board.empty().withSquare('a8', Piece.BlackRook);
    expect(board.toFen()).to.equal('r7/8/8/8/8/8/8/8');
  });

  it('outputs a white queen on h1 at the end of FEN', () => {
    const board = Board.empty().withSquare('h1', Piece.WhiteQueen);
    expect(board.toFen()).to.equal('8/8/8/8/8/8/8/7Q');
  });

  it('uses uppercase for white pieces and lowercase for black', () => {
    const board = Board.empty()
      .withSquare('e4', Piece.WhiteKing)
      .withSquare('e5', Piece.BlackKing);
    const fen = board.toFen();
    expect(fen).to.include('K');
    expect(fen).to.include('k');
  });

  it('counts consecutive empty squares correctly', () => {
    const board = Board.empty().withSquare('d4', Piece.WhiteBishop);
    // d4 = rank 4, file 3 → FEN rank 4 row: "3B4"
    expect(board.toFen()).to.equal('8/8/8/8/3B4/8/8/8');
  });

  it('works correctly on a non-8x8 board', () => {
    const board = Board.empty(3).withSquare('a1', Piece.WhiteKing);
    expect(board.toFen()).to.equal('3/3/K2');
  });
});

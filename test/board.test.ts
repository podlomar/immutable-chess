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
    expect(board.index(0, 0)).to.equal(board.fromSquare('a1'));
  });

  it('index(7, 7) corresponds to h8', () => {
    const board = Board.empty();
    expect(board.index(7, 7)).to.equal(board.fromSquare('h8'));
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

describe('Board.fromSquare()', () => {
  it('parses a1 as rank 0, file 0', () => {
    const board = Board.empty();
    expect(board.fromSquare('a1')).to.equal(board.index(0, 0));
  });

  it('parses h8 as rank 7, file 7', () => {
    const board = Board.empty();
    expect(board.fromSquare('h8')).to.equal(board.index(7, 7));
  });

  it('parses e4 as rank 3, file 4', () => {
    const board = Board.empty();
    expect(board.fromSquare('e4')).to.equal(board.index(3, 4));
  });

  it('parses two-digit ranks (e.g. a10)', () => {
    const board = Board.empty(10, 10);
    expect(board.fromSquare('a10')).to.equal(board.index(9, 0));
  });

  it('throws for empty string', () => {
    expect(() => Board.empty().fromSquare('')).to.throw(Error);
  });

  it('throws for uppercase file letter', () => {
    expect(() => Board.empty().fromSquare('E4')).to.throw(Error);
  });

  it('throws for rank starting with 0', () => {
    expect(() => Board.empty().fromSquare('a0')).to.throw(Error);
  });
});

describe('Board.toSquare()', () => {
  it('converts index back to algebraic notation', () => {
    const board = Board.empty();
    expect(board.toSquare(board.fromSquare('a1'))).to.equal('a1');
    expect(board.toSquare(board.fromSquare('h8'))).to.equal('h8');
    expect(board.toSquare(board.fromSquare('e4'))).to.equal('e4');
  });

  it('throws RangeError for out-of-bounds index', () => {
    expect(() => Board.empty().toSquare(64)).to.throw(RangeError);
  });
});

describe('Board.squareColor()', () => {
  it('a1 is a dark square', () => {
    const board = Board.empty();
    expect(board.squareColor(board.fromSquare('a1'))).to.equal('dark');
  });

  it('b1 is a light square', () => {
    const board = Board.empty();
    expect(board.squareColor(board.fromSquare('b1'))).to.equal('light');
  });

  it('h8 is a dark square', () => {
    const board = Board.empty();
    expect(board.squareColor(board.fromSquare('h8'))).to.equal('dark');
  });

  it('throws RangeError for out-of-bounds index', () => {
    expect(() => Board.empty().squareColor(64)).to.throw(RangeError);
  });
});

describe('Board.atSquare()', () => {
  it('returns null for an empty square', () => {
    expect(Board.empty().atSquare('e4')).to.be.null;
  });

  it('returns the piece at the given square', () => {
    const board = Board.empty().placeSquare('e4', Piece.WhiteKnight);
    expect(board.atSquare('e4')).to.equal(Piece.WhiteKnight);
  });

  it('throws for invalid algebraic notation', () => {
    expect(() => Board.empty().atSquare('')).to.throw(Error);
  });
});

describe('Board.placeSquare()', () => {
  it('places a piece using algebraic notation', () => {
    const board = Board.empty().placeSquare('e2', Piece.WhitePawn);
    expect(board.atSquare('e2')).to.equal(Piece.WhitePawn);
  });

  it('removes a piece using algebraic notation', () => {
    const board = Board.empty().placeSquare('e2', Piece.WhitePawn).placeSquare('e2', null);
    expect(board.atSquare('e2')).to.be.null;
  });

  it('returns a new Board instance (immutable)', () => {
    const board = Board.empty();
    expect(board.placeSquare('a1', Piece.WhiteRook)).to.not.equal(board);
  });

  it('preserves other squares unchanged', () => {
    const board = Board.empty()
      .placeSquare('e2', Piece.WhitePawn)
      .placeSquare('d4', Piece.BlackKnight);
    expect(board.atSquare('e2')).to.equal(Piece.WhitePawn);
    expect(board.atSquare('d4')).to.equal(Piece.BlackKnight);
  });

  it('throws for invalid algebraic notation', () => {
    expect(() => Board.empty().placeSquare('E2', Piece.WhitePawn)).to.throw(Error);
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
    const idx = board.fromSquare('e4');
    const updated = board.place(idx, Piece.WhiteKnight);
    expect(updated.at(idx)).to.equal(Piece.WhiteKnight);
  });
});

describe('Board.place()', () => {
  it('returns a new Board instance (immutable)', () => {
    const board = Board.empty();
    const updated = board.place(0, Piece.WhiteRook);
    expect(updated).to.not.equal(board);
  });

  it('does not mutate the original board', () => {
    const board = Board.empty();
    board.place(0, Piece.WhiteRook);
    expect(board.at(0)).to.be.null;
  });

  it('removes a piece when passed null', () => {
    const board = Board.empty();
    const idx = board.fromSquare('d4');
    const withPiece = board.place(idx, Piece.BlackQueen);
    const withoutPiece = withPiece.place(idx, null);
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
      expect(board.place(i, piece).at(i)).to.equal(piece);
    });
  });
});

describe('Board.move()', () => {
  it('moves a piece from one square to another', () => {
    const board = Board.empty();
    const from = board.fromSquare('e2');
    const to = board.fromSquare('e4');
    const updated = board.place(from, Piece.WhitePawn).move({ from, to });
    expect(updated.at(from)).to.be.null;
    expect(updated.at(to)).to.equal(Piece.WhitePawn);
  });

  it('returns a new Board instance (immutable)', () => {
    const board = Board.empty();
    const from = board.fromSquare('a1');
    const to = board.fromSquare('a2');
    const withPiece = board.place(from, Piece.WhiteRook);
    const moved = withPiece.move({ from, to });
    expect(moved).to.not.equal(withPiece);
  });

  it('captures the piece on the destination square', () => {
    const board = Board.empty();
    const from = board.fromSquare('e1');
    const to = board.fromSquare('e8');
    const withPieces = board
      .place(from, Piece.WhiteRook)
      .place(to, Piece.BlackRook);
    const moved = withPieces.move({ from, to });
    expect(moved.at(to)).to.equal(Piece.WhiteRook);
    expect(moved.at(from)).to.be.null;
  });

  it('throws when source square is empty', () => {
    const board = Board.empty();
    const from = board.fromSquare('e2');
    const to = board.fromSquare('e4');
    expect(() => board.move({ from, to })).to.throw(Error);
  });
});

describe('Board.emptySquares()', () => {
  it('returns all squares for an empty board', () => {
    const board = Board.empty();
    expect(board.emptySquares()).to.have.length(64);
  });

  it('returns 63 squares after placing one piece', () => {
    const board = Board.empty().place(0, Piece.WhitePawn);
    expect(board.emptySquares()).to.have.length(63);
  });

  it('does not include occupied square indices', () => {
    const board = Board.empty();
    const idx = board.fromSquare('e4');
    const updated = board.place(idx, Piece.WhiteKnight);
    expect(updated.emptySquares()).to.not.include(idx);
  });
});

describe('Board.toFen()', () => {
  it('returns all-empty FEN for an empty board', () => {
    expect(Board.empty().toFen()).to.equal('8/8/8/8/8/8/8/8');
  });

  it('outputs a white pawn on e2 in the correct FEN rank', () => {
    const board = Board.empty().place(Board.empty().fromSquare('e2'), Piece.WhitePawn);
    expect(board.toFen()).to.equal('8/8/8/8/8/8/4P3/8');
  });

  it('outputs a black rook on a8 at the start of FEN', () => {
    const board = Board.empty().place(Board.empty().fromSquare('a8'), Piece.BlackRook);
    expect(board.toFen()).to.equal('r7/8/8/8/8/8/8/8');
  });

  it('outputs a white queen on h1 at the end of FEN', () => {
    const board = Board.empty().place(Board.empty().fromSquare('h1'), Piece.WhiteQueen);
    expect(board.toFen()).to.equal('8/8/8/8/8/8/8/7Q');
  });

  it('uses uppercase for white pieces and lowercase for black', () => {
    const b = Board.empty();
    const board = b
      .place(b.fromSquare('e4'), Piece.WhiteKing)
      .place(b.fromSquare('e5'), Piece.BlackKing);
    const fen = board.toFen();
    expect(fen).to.include('K');
    expect(fen).to.include('k');
  });

  it('counts consecutive empty squares correctly', () => {
    const b = Board.empty();
    const board = b.place(b.fromSquare('d4'), Piece.WhiteBishop);
    expect(board.toFen()).to.equal('8/8/8/8/3B4/8/8/8');
  });

  it('works correctly on a non-8x8 board', () => {
    const b = Board.empty(3);
    const board = b.place(b.fromSquare('a1'), Piece.WhiteKing);
    expect(board.toFen()).to.equal('3/3/K2');
  });
});

describe('Board.fromFen()', () => {
  it('parses an empty 8x8 board', () => {
    const board = Board.fromFen('8/8/8/8/8/8/8/8');
    expect(board.width).to.equal(8);
    expect(board.height).to.equal(8);
    for (let i = 0; i < 64; i++) {
      expect(board.at(i)).to.be.null;
    }
  });

  it('roundtrips with toFen for a single piece', () => {
    const fen = '8/8/8/8/3B4/8/8/8';
    expect(Board.fromFen(fen).toFen()).to.equal(fen);
  });

  it('roundtrips with toFen for all piece types', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    expect(Board.fromFen(fen).toFen()).to.equal(fen);
  });

  it('places pieces on the correct squares', () => {
    const board = Board.fromFen('8/8/8/8/8/8/8/7Q');
    expect(board.atSquare('h1')).to.equal(Piece.WhiteQueen);
    expect(board.atSquare('a1')).to.be.null;
  });

  it('places a black rook on a8 correctly', () => {
    const board = Board.fromFen('r7/8/8/8/8/8/8/8');
    expect(board.atSquare('a8')).to.equal(Piece.BlackRook);
    expect(board.atSquare('b8')).to.be.null;
  });

  it('accepts a full FEN string and uses only the piece placement', () => {
    const board = Board.fromFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 1');
    expect(board.atSquare('e4')).to.equal(Piece.WhitePawn);
    expect(board.atSquare('e2')).to.be.null;
  });

  it('parses a non-8x8 board', () => {
    const board = Board.fromFen('3/3/K2');
    expect(board.width).to.equal(3);
    expect(board.height).to.equal(3);
    expect(board.atSquare('a1')).to.equal(Piece.WhiteKing);
  });

  it('handles multi-digit empty square counts', () => {
    const board = Board.fromFen('26/26');
    expect(board.width).to.equal(26);
    expect(board.height).to.equal(2);
    for (let i = 0; i < 52; i++) {
      expect(board.at(i)).to.be.null;
    }
  });

  it('throws for an invalid piece character', () => {
    expect(() => Board.fromFen('8/8/8/8/8/8/8/7X')).to.throw(Error);
  });

  it('throws for inconsistent rank widths', () => {
    expect(() => Board.fromFen('8/8/8/8/8/8/8/6')).to.throw(Error);
  });
});

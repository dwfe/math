import {Point, TPoint} from '../geometry'
import {M2x2} from './contract'

export class Basis {

  /**
   * Matrix of Linear transformation <=> 2x2 change of basis matrix:
   *   a c
   *   b d
   */
  ltMatrix: M2x2;

  /**
   * Matrix of Linear equation coefficients:
   * (basis vectors as if they were coming out of the point (0, 0))
   *   a b
   *   c d
   */
  centeredMatrixCoef: M2x2;

  dx: TPoint;
  dy: TPoint;

  constructor(public o: TPoint,
              public ox: TPoint,
              public oy: TPoint) {
    // coordinates of the vectors are taken relative to the center of the basis
    this.dx = Point.sub(ox, o);
    this.dy = Point.sub(oy, o);

    // the matrix of the linear transformation is filled in by columns
    this.ltMatrix = [
      ...this.dx, // a, b,
      ...this.dy, // c, d
    ];

    // the matrix of the linear equation coefficients is filled in by rows
    this.centeredMatrixCoef = [
      this.dx[0], this.dy[0], // a, c,
      this.dx[1], this.dy[1]  // b, d
    ];
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON(): TPoint[] {
    return [this.o, this.ox, this.oy];
  }

  static fromString(data: string): Basis {
    return Basis.fromJSON(JSON.parse(data));
  }

  static fromJSON(data: TPoint[]): Basis {
    return Basis.of(data[0], data[1], data[2]);
  }

  static of(o: TPoint, ox: TPoint, oy: TPoint): Basis {
    return new Basis(o, ox, oy);
  }

  static standard(): Basis {
    return new Basis([0, 0], [1, 0], [0, 1]);
  }

}

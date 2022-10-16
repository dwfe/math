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

  origin: TPoint; // origin point of the basis
  oxEnd: TPoint; // end point of the basis vector ox
  oyEnd: TPoint; // end point of the basis vector oy

  ox: TPoint; // basis vector ox with origin at [0,0]
  oy: TPoint; // basis vector oy with origin at [0,0]
  isOrthogonal: boolean;

  constructor([origin, oxEnd, oyEnd]: TPoint[]) {
    this.origin = origin;
    this.oxEnd = oxEnd;
    this.oyEnd = oyEnd;
    this.ox = Point.sub(oxEnd, origin);
    this.oy = Point.sub(oyEnd, origin);
    this.isOrthogonal = Math.abs(Point.scalarProduct(this.ox, this.oy)) <= 0.000001;

    // the matrix of the linear transformation is filled in by columns
    this.ltMatrix = [
      ...this.ox, // a, b,
      ...this.oy, // c, d
    ];

    // the matrix of the linear equation coefficients is filled in by rows
    this.centeredMatrixCoef = [
      this.ox[0], this.oy[0], // a, c,
      this.ox[1], this.oy[1]  // b, d
    ];
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON(): TPoint[] {
    return [this.origin, this.oxEnd, this.oyEnd];
  }

  static fromString(str: string): Basis {
    return Basis.of(JSON.parse(str));
  }

  static of(dto: TPoint[]): Basis {
    return new Basis(dto);
  }

  static standard(): Basis {
    return new Basis([[0, 0], [1, 0], [0, 1]]);
  }

  /**
   * Gram–Schmidt process:
   *   https://youtu.be/SKfrbnuPeMc?list=PLwwk4BHih4fg6dz8m2K3R3uvDPC2bwUIR&t=374
   *   https://youtu.be/jRCuSl1pfOA?t=538
   *   https://youtu.be/LABz6sEE8LI?list=PLjjYXM9g4hhxHbx8ir096htbckks9ujxI&t=1379
   */
  static orthogonalize(dto: TPoint[]): TPoint[] {
    const basis = Basis.of(dto);
    if (basis.isOrthogonal) {
      return basis.toJSON();
    }
    const {add, k, scalarProduct, sub} = Point;
    const e1 = basis.ox;
    const e2 = sub(
      basis.oy,
      k(scalarProduct(basis.oy, e1) / scalarProduct(e1, e1))(e1)
    );
    return [
      basis.origin,
      add(e1, basis.origin),
      add(e2, basis.origin),
    ];
  }

}

import {IPoint, Point} from '../geometry'
import {Tuple4} from '../contract'

export class Basis {

  /**
   * Matrix of Linear transformation <=> 2x2 change of basis matrix:
   *   a c
   *   b d
   */
  ltMatrix: Tuple4;

  /**
   * Matrix of Linear equation coefficients:
   * (basis vectors as if they were coming out of the point (0, 0))
   *   a b
   *   c d
   */
  centeredMatrixCoef: Tuple4;

  origin: IPoint; // origin point of the basis
  oxEnd: IPoint; // end point of the basis vector ox
  oyEnd: IPoint; // end point of the basis vector oy
  aspectRatio: number;

  ox: IPoint; // basis vector ox with origin at [0,0]
  oy: IPoint; // basis vector oy with origin at [0,0]
  isOrthogonal: boolean;

  constructor([origin, oxEnd, oyEnd]: IPoint[]) {
    this.origin = origin;
    this.oxEnd = oxEnd;
    this.oyEnd = oyEnd;
    this.aspectRatio = Point.distance(oxEnd, origin) / Point.distance(oyEnd, origin);
    this.ox = Point.sub(oxEnd, origin);
    this.oy = Point.sub(oyEnd, origin);
    this.isOrthogonal = Math.abs(Point.dotProduct(this.ox, this.oy)) <= 0.000001;

    // the matrix of the linear transformation is filled in by columns
    this.ltMatrix = [ // a, b, c, d
      this.ox[0], this.ox[1],
      this.oy[0], this.oy[1]
    ];

    // the matrix of the linear equation coefficients is filled in by rows
    this.centeredMatrixCoef = [ // a, c, b, d
      this.ox[0], this.oy[0],
      this.ox[1], this.oy[1]
    ];
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  toJSON(): IPoint[] {
    return [
      [this.origin[0], this.origin[1]],
      [this.oxEnd[0], this.oxEnd[1]],
      [this.oyEnd[0], this.oyEnd[1]]
    ];
  }

  clone(): Basis {
    return new Basis(this.toJSON());
  }

  informIfNotOrthogonal(description = '', ...rest: any[]): void {
    Basis.informIfNotOrthogonal(this, description, ...rest);
  }

  static fromString(str: string): Basis {
    return new Basis(JSON.parse(str));
  }

  /**
   * @param dto - [origin, oxEnd, oyEnd]
   */
  static of(dto: IPoint[]): Basis {
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
  static orthogonalize(basis: Basis): Basis {
    if (basis.isOrthogonal) {
      return basis.clone();
    }
    const {add, multiplyByScalar, dotProduct, sub} = Point;
    const e1 = basis.ox;
    const e2 = sub(
      basis.oy,
      multiplyByScalar(
        e1,
        dotProduct(basis.oy, e1) / dotProduct(e1, e1)
      )
    );
    const orthogonalBasis = new Basis([
      basis.origin,
      add(e1, basis.origin), // oxEnd
      add(e2, basis.origin), // oyEnd
    ]);
    if (!orthogonalBasis.isOrthogonal) {
      throw new Error('failed to orthogonalize the basis by Gram–Schmidt');
    }
    return orthogonalBasis;
  }

  /**
   * In addition to orthogonalization,
   * the aspectRatio of the new basis becomes equal to 1.
   * Process essence:
   *   ox = [a, b]
   *   oy = [-b,a]
   */
  static orthogonalizeAR1(basis: Basis): Basis {
    if (basis.isOrthogonal) {
      return basis.clone();
    }
    const e1 = basis.ox;
    const orthogonalBasis = new Basis([
      basis.origin,
      Point.add(e1, basis.origin), // oxEnd
      Point.add([(-1) * e1[1], e1[0]], basis.origin), // oyEnd
    ]);
    if (!orthogonalBasis.isOrthogonal) {
      throw new Error('failed to orthogonalize the basis by aspectRatio1');
    }
    return orthogonalBasis;
  }

  /**
   * @param basis
   * @param description - additional information about this basis
   * @param rest - some other optional parameters
   */
  static informIfNotOrthogonal(basis: Basis, description = '', ...rest: any[]): void {
    if (!basis.isOrthogonal) {
      const prefix = description ? `${description} -> ` : '';
      console.error(`${prefix}basis is not orthogonal`, basis.toJSON(), ...rest);
    }
  }

}

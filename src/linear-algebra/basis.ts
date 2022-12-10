import {IPoint, Point} from '../geometry'
import {Tuple4} from '../contract'
import {Extent} from './extent'

export class Basis {

  extent: Extent;

  /**
   * Matrix of Linear transformation <=> 2x2 change of basis matrix:
   *   a c
   *   b d
   */
  ltMatrix: Tuple4; // [a, b, c, d]

  /**
   * Matrix of Linear equation coefficients:
   * (basis vectors as if they were coming out of the point (0, 0))
   *   a b
   *   c d
   */
  centeredMatrixCoef: Tuple4; // [a, c, b, d]

  ox: IPoint; // basis vector ox with origin at [0,0]
  oy: IPoint; // basis vector oy with origin at [0,0]
  isOrthogonal: boolean;

  constructor(origin: IPoint,
              oxEnd: IPoint,
              oyEnd: IPoint) {
    this.extent = new Extent(origin, oxEnd, oyEnd);

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

  static fromString(str: string): Basis {
    return Basis.fromJSON(JSON.parse(str));
  }

  toJSON(): IPoint[] {
    return this.extent.toJSON();
  }

  static fromJSON([origin, oxEnd, oyEnd]: IPoint[]): Basis {
    return new Basis(origin, oxEnd, oyEnd);
  }

  clone(): Basis {
    return Basis.fromJSON(this.toJSON());
  }

  informIfNotOrthogonal(description = '', ...rest: any[]): void {
    Basis.informIfNotOrthogonal(this, description, ...rest);
  }

  static of(origin: IPoint, oxEnd: IPoint, oyEnd: IPoint): Basis {
    return new Basis(origin, oxEnd, oyEnd);
  }

  static standard(): Basis {
    return new Basis([0, 0], [1, 0], [0, 1]);
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
    const extentOrigin = basis.extent.origin;
    const orthogonalBasis = new Basis(
      extentOrigin,
      add(e1, extentOrigin), // oxEnd
      add(e2, extentOrigin), // oyEnd
    );
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
    const extentOrigin = basis.extent.origin;
    const orthogonalBasis = new Basis(
      extentOrigin,
      Point.add(e1, extentOrigin), // oxEnd
      Point.add([(-1) * e1[1], e1[0]], extentOrigin), // oyEnd
    );
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

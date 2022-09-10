import {Point, TPoint} from '../geometry'
import {M2x2} from './contract'

export class Basis {

  /**
   * Linear transformation matrix:
   *   a c
   *   b d
   */
  matrix: M2x2;

  constructor(public o: TPoint,
              public ox: TPoint,
              public oy: TPoint) {
    /**
     * The matrix is filled in by columns,
     * and the coordinates of the vectors are taken relative to the center
     */
    this.matrix = [
      ...Point.subtract(ox, o), // a, b
      ...Point.subtract(oy, o), // c, d
    ];
  }

  static of(o: TPoint, ox: TPoint, oy: TPoint): Basis {
    return new Basis(o, ox, oy);
  }

  static standard(): Basis {
    return new Basis([0, 0], [1, 0], [0, 1]);
  }

}

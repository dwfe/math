import {Tuple2} from '../contract'
import {IPoint} from './contract'

class P {

  static of = (p: IPoint = [0, 0]): P => new P(p)

  constructor(public readonly p: IPoint) {
  }

  add = (p: IPoint): P => P.of(P.add(this.p, p))
  sub = (p: IPoint): P => P.of(P.sub(this.p, p))
  multiplyByScalar = (scalar: number): P => P.of(P.multiplyByScalar(this.p, scalar))
  k = (kx: number, ky = kx): P => P.of(P.k(kx, ky)(this.p))
  middle = (p: IPoint): P => P.of(P.middle(this.p, p))
  distance = (p: IPoint): number => P.distance(this.p, p)
  equals = (p: IPoint): boolean => P.isEqual(this.p, p);


  static add = (p1: IPoint, p2: IPoint): Tuple2 => ([
    p1[0] + p2[0],
    p1[1] + p2[1]
  ])

  static sub = (p1: IPoint, p2: IPoint): Tuple2 => ([
    p1[0] - p2[0],
    p1[1] - p2[1]
  ])

  static multiplyByScalar = (p: IPoint, scalar: number): Tuple2 => [
    p[0] * scalar,
    p[1] * scalar,
  ];

  static k = (kx: number, ky = kx) =>
    (p: IPoint): Tuple2 => ([
      p[0] * kx,
      p[1] * ky
    ])

  static middle = (p1: IPoint, p2: IPoint): Tuple2 =>
    P.multiplyByScalar(
      P.add(p1, p2),
      0.5
    )

  /**
   * Dot product or Scalar product:
   *   a   c
   *     *   = a*c+b*d
   *   b   d
   * https://en.wikipedia.org/wiki/Dot_product
   */
  static dotProduct(p1: IPoint, p2: IPoint): number {
    return p1[0] * p2[0] + p1[1] * p2[1];
  }

  static distance = (p1: IPoint, p2: IPoint): number => {
    const result = P.sub(p1, p2)
    return Math.sqrt(Math.pow(result[0], 2) + Math.pow(result[1], 2))
  }

  static isEqual = (p1: IPoint, p2: IPoint): boolean =>
    Math.abs(p1[0] - p2[0]) < ACCURACY &&
    Math.abs(p1[1] - p2[1]) < ACCURACY
  ;
}

const ACCURACY = 0.0001;


export {
  P as Point
}

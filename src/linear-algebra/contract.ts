/*
 * Homogeneous coordinates on RP^2
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
 *                         a c e   here is described:
 * [a, b, c, d, e, f]  =>  b d f ,   a b c d - linear transformation
 *                         0 0 1     e f     - translation to apply
 */
export type IMatrix = number[];

export interface IMatrix2D {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface ISegmentChanging {
  fromSegment: number;
  toSegment: number;
}

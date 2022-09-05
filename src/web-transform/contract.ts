import {TPoint} from '../geometry'

/*
 * Homogeneous coordinates on RP**2
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix
 *                    a c e   here is described:
 * [a,b,c,d,e,f]  =>  b d f ,   a b c d - linear transformation
 *                    0 0 1     e f     - translation to apply
 */
export type TWebMatrix = [number, number, number, number, number, number];
export type TLinearMatrix = [number, number, number, number];

export interface ILinearMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface IWebMatrix extends ILinearMatrix {
  e: number;
  f: number;
}


export interface ISegmentChanging {
  fromSegment: number;
  toSegment: number;
}

export interface IPointTransition {
  fromPoint: TPoint;
  toPoint: TPoint;
}

export interface IBasis {
  o: TPoint;
  ox: TPoint;
  oy: TPoint;
}

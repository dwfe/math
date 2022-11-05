import {Tuple2} from '../contract'

export type IPoint = number[]

export interface IPoint2D {
  x: number;
  y: number;
}

export interface IPoint3D extends IPoint2D {
  z: number;
}

export type IVector = Tuple2<IPoint> // 2D vector: [startPoint, endPoint]

export interface IRect {
  left: number;
  top: number;
  right: number;
  bottom: number;

  width: number;
  height: number;
  aspectRatio: number;

  center: IPoint;
}

export type IPolygon = IPoint[];
export type IMultiPolygon = IPolygon[];

import {Tuple2, Tuple4, Tuple5} from '../contract'

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

  leftTop: IPoint,
  rightTop: IPoint,
  rightBottom: IPoint,
  leftBottom: IPoint,

  points: Tuple4<IPoint>;
  polygon: Tuple5<IPoint>;

  width: number;
  height: number;
  aspectRatio: number;

  center: IPoint;
}

export interface IRectPoints {
  leftTop: IPoint;
  rightTop: IPoint;
  rightBottom: IPoint;
  leftBottom: IPoint;
}


export type IPolygon = IPoint[];
export type IMultiPolygon = IPolygon[];


export type ISidePosition = 'top' | 'left' | 'right' | 'bottom';

export type ICornerPointPosition = 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';

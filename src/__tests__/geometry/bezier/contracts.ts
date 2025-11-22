import {IPoint} from '../../../geometry';

interface ISameLine {
  isSameLine: true; // Линии совпадают во всех точках
  dontIntersect?: undefined;
  intersections?: undefined;
}

interface IDontIntersect {
  isSameLine?: undefined;
  dontIntersect: true; // Линии не пересекаются
  intersections?: undefined
}

interface ICurveIntersect<TIntersectionEntry extends ICurveIntersectPoint = ICurveIntersectPoint> {
  isSameLine?: undefined;
  dontIntersect?: undefined;
  intersections: TIntersectionEntry[] // Массив точек пересечения
}

export interface ICurveIntersectPoint {
  point: IPoint
}

export interface ICurveIntersectWithTangent extends ICurveIntersectPoint {
  tangent: IPoint
}

export type ICurveIntersections<TIntersectionEntry extends ICurveIntersectPoint = ICurveIntersectPoint> =
  ISameLine
  | IDontIntersect
  | ICurveIntersect<TIntersectionEntry>

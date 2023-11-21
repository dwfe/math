import {Tuple3, Tuple4} from '../contract'
import {IPoint, Point} from '../geometry'

/**
 * Rectangular area defined by three points.
 */
export class Extent {

  origin: IPoint; // origin point of the pseudoBasis
  oxEnd: IPoint; // endpoint of the pseudoBasis vector ox
  oyEnd: IPoint; // endpoint of the pseudoBasis vector oy
  fourthPoint: IPoint; // fourth point of the extent. Is the endpoint of the vector: vector oxEnd + vector oyEnd

  width: number;
  height: number;
  aspectRatio: number;

  center: IPoint;

  constructor(origin: IPoint,
              oxEnd: IPoint,
              oyEnd: IPoint) {
    this.origin = origin;
    this.oxEnd = oxEnd;
    this.oyEnd = oyEnd;
    this.fourthPoint = Point.sub(Point.add(oxEnd, oyEnd), origin);

    this.width = Point.distance(oxEnd, origin);
    this.height = Point.distance(oyEnd, origin);
    this.aspectRatio = this.height === 0 ? 0 : this.width / this.height;

    this.center = Point.middle(oxEnd, oyEnd);
  }

  toJSON(): Tuple3<IPoint> {
    return [
      [this.origin[0], this.origin[1]],
      [this.oxEnd[0], this.oxEnd[1]],
      [this.oyEnd[0], this.oyEnd[1]]
    ];
  }

  static fromJSON(dto: IPoint[]): Extent {
    return new Extent(dto[0], dto[1], dto[2]);
  }

  toPoints(): Tuple4<IPoint> {
    return [
      ...this.toJSON(),
      [this.fourthPoint[0], this.fourthPoint[1]]
    ];
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }

  static fromString(str: string): Extent {
    return Extent.fromJSON(JSON.parse(str));
  }

  clone(): Extent {
    return Extent.fromJSON(this.toJSON());
  }

  equals = (extent: Extent) => (
    Point.isEqual(this.origin, extent.origin) &&
    Point.isEqual(this.oxEnd, extent.oxEnd) &&
    Point.isEqual(this.oyEnd, extent.oyEnd)
  );

  static of(origin: IPoint, oxEnd: IPoint, oyEnd: IPoint): Extent {
    return new Extent(origin, oxEnd, oyEnd);
  }

}

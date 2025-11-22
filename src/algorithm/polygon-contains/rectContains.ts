import {IPoint, IRectPoints, StraightLine} from '../../geometry';
import {polygonContainsRectPoints} from './polygonContainsRectPoints';

export class RectContains {

  /**
   * Прямоугольник содержит точку.
   * Работает как для прямоугольника, стороны которого параллельны осям координат.
   * Так и для повернутого в пространстве прямоугольника.
   */
  static point(rect: IRectPoints, point: IPoint): boolean {
    return (
      StraightLine.pointPositionRelativeToLine(rect.leftTop, rect.rightTop, point) >= 0 &&
      StraightLine.pointPositionRelativeToLine(rect.rightTop, rect.rightBottom, point) >= 0 &&
      StraightLine.pointPositionRelativeToLine(rect.rightBottom, rect.leftBottom, point) >= 0 &&
      StraightLine.pointPositionRelativeToLine(rect.leftBottom, rect.leftTop, point) >= 0
    );
  }

  /**
   * Прямоугольник содержит окружность.
   * Работает как для прямоугольника, стороны которого параллельны осям координат.
   * Так и для повернутого в пространстве прямоугольника.
   */
  static circle(rect: IRectPoints, center: IPoint, radius: number): boolean {
    if (!RectContains.point(rect, center)) {
      return false;
    }
    return (
      StraightLine.normalLength(rect.leftTop, rect.rightTop, center) >= radius &&
      StraightLine.normalLength(rect.rightTop, rect.rightBottom, center) >= radius &&
      StraightLine.normalLength(rect.rightBottom, rect.leftBottom, center) >= radius &&
      StraightLine.normalLength(rect.leftBottom, rect.leftTop, center) >= radius
    );
  }

  /**
   * Прямоугольник содержит прямоугольник.
   * Работает как для прямоугольников, стороны которого параллельны осям координат,
   * так и для повернутых в пространстве.
   *
   * @param outer Прямоугольник, который СОДЕРЖИТ
   * @param isInner Прямоугольник, который СОДЕРЖАТ
   */
  static rect(outer: IRectPoints, isInner: IRectPoints): boolean {
    return polygonContainsRectPoints([
        outer.leftTop,
        outer.rightTop,
        outer.rightBottom,
        outer.leftBottom,
        outer.leftTop,
      ],
      isInner,
      false,
    );
  }

}


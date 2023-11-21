import {multiPolygonContainsPoint} from './multiPolygonContainsPoint';
import {IPolygon, IRectPoints, Point} from '../../geometry';

/**
 * Обертка над multiPolygonContainsPoint
 * для объекта типа IRectPoints
 */
export function polygonContainsRectPoints(polygon: IPolygon, rectPoints: IRectPoints, excludeContour = false): boolean {
  if (!Point.isEqual(polygon[0], polygon[polygon.length - 1])) {
    polygon.push(polygon[0]); // должен быть замкнут явно
  }
  const multiPolygon = [polygon]; // алгоритм работает с мультиполигоном
  return (
    multiPolygonContainsPoint(multiPolygon, rectPoints.leftTop, excludeContour).isInside &&
    multiPolygonContainsPoint(multiPolygon, rectPoints.rightTop, excludeContour).isInside &&
    multiPolygonContainsPoint(multiPolygon, rectPoints.rightBottom, excludeContour).isInside &&
    multiPolygonContainsPoint(multiPolygon, rectPoints.leftBottom, excludeContour).isInside
  );
}

import {polygonContainsRectPoints} from './polygonContainsRectPoints';
import {IRectPoints} from '../../geometry';

export function rectPointsContainsRectPoints(polygon: IRectPoints, rectPoints: IRectPoints, excludeContour = false): boolean {
  return polygonContainsRectPoints([
      polygon.leftTop,
      polygon.rightTop,
      polygon.rightBottom,
      polygon.leftBottom,
      polygon.leftTop,
    ],
    rectPoints,
    excludeContour
  );
}

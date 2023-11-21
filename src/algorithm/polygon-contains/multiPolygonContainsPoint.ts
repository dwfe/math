import inside from 'point-in-polygon-hao';
import {IMultiPolygon, IPoint} from '../../geometry';

/**
 * Принадлежит ли точка заданному мультиполигону?
 *  - работает на самопересекающихся/дегенеративных полигонах;
 *  - работает на полигонах с дырками.
 *
 * Это обертка над:
 *   https://github.com/rowanwins/point-in-polygon-hao
 *
 * @param multiPolygon   - заданный мультиполигон, где каждый полигон должен быть замкнут явно;
 * @param point           - проверяемая точка;
 * @param excludeContour - если true, то точка на контуре не считается частью мультиполигона.
 */
export function multiPolygonContainsPoint(multiPolygon: IMultiPolygon, point: IPoint, excludeContour = false): {
  isInside: boolean;
  isOnEdge?: boolean;
} {

  const result = inside(
    point,
    multiPolygon
  );

  if (result === 0)
    return {
      isInside: !excludeContour,
      isOnEdge: true,
    }

  return {isInside: result};
}



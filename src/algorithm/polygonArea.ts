import {IPolygon} from '../geometry'

/**
 * Gauss's area formula or Shoelace formula:
 *   https://en.wikipedia.org/wiki/Shoelace_formula
 *   https://www.youtube.com/watch?v=0KjG8Pg6LGk
 *   https://stackoverflow.com/questions/14505565/detect-if-a-set-of-points-in-an-array-that-are-the-vertices-of-a-complex-polygon#answer-14506549
 *   https://github.com/mrdoob/three.js/blob/master/src/extras/ShapeUtils.js#L7
 */
export function polygonArea(polygon: IPolygon): number {
  const length = polygon.length;
  let doubleArea = 0;
  for (let p = length - 1, q = 0; q < length; p = q++) {
    doubleArea += polygon[p][0] * polygon[q][1] - polygon[q][0] * polygon[p][1];
  }
  return doubleArea / 2;
}

/**
 * Assuming that the OY axis is directed upwards
 */
export function polygonPointsClockwise(polygon: IPolygon): boolean {
  const area = polygonArea(polygon);
  if (area === 0) {
    throw new Error(`polygon area is zero: ${polygon}`);
  }
  return area < 0;
}

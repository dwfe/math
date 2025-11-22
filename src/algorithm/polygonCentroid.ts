import {IPoint, Point} from '../geometry';

/**
 * Центр многоугольника.
 *    Особенности:
 *    1. Многоугольник не должен самопересекаться.
 *       Например, если нарисовать знак бесконечности, то это самопересекающийся многоугольник.
 *       Точка центра скорее всего окажется где-то далеко за контуром фигуры.
 *    2. Многоугольник по возможности не должен быть вогнутым.
 *       Например, если нарисовать месяц в начальной стадии, то это будет вогнутый многоугольник.
 *       Точка центра может оказаться за контуром фигуры.
 * https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript#9939071
 */
export function polygonCentroid(points: IPoint[]): IPoint {
  if (points.length === 0) {
    return [0, 0];
  }
  if (points.length === 1) {
    return points[0];
  }
  if (points.length === 2) {
    return Point.middle(points[0], points[1]);
  }
  const first = points[0];
  if (!Point.isEqual(first, points[points.length - 1])) {
    points = [...points];
    points.push(first);
  }
  let twicearea = 0, x = 0, y = 0, f;
  let p1: IPoint, p2: IPoint
  const length = points.length;
  for (let i = 0, j = length - 1; i < length; j = i++) {
    p1 = points[i];
    p2 = points[j];
    f = p1[0] * p2[1] - p2[0] * p1[1];
    twicearea += f;
    x += (p1[0] + p2[0]) * f;
    y += (p1[1] + p2[1]) * f;
  }
  f = twicearea * 3;
  return [x / f, y / f];
}

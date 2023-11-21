import {IPoint, IPolygon} from '../geometry';
import {Tuple4} from '../contract';

/**
 * Взято отсюда: https://github.com/mapbox/lineclip
 * Последнее изменение index.js: Jul 19, 2018
 */

/**
 * Cohen-Sutherland line clipping algorithm, adapted to efficiently
 * handle poly-lines rather than just segments.
 *   https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
 *
 * @param points
 * @param bbox - [xMin, yMin, xMax, yMax]
 * @param result
 */
export function clipLine(points: IPoint[], bbox: Tuple4, result: Array<IPoint[]> = []) {

  const len = points.length;
  let codeA = bitCode(points[0], bbox);
  let part: IPoint[] = [];
  let lastCode;

  for (let i = 1; i < len; i++) {
    let a = points[i - 1];
    let b = points[i];
    let codeB = lastCode = bitCode(b, bbox);

    while (true) {

      if (!(codeA | codeB)) { // accept
        part.push(a);

        if (codeB !== lastCode) { // segment went outside
          part.push(b);

          if (i < len - 1) { // start a new line
            result.push(part);
            part = [];
          }
        } else if (i === len - 1) {
          part.push(b);
        }
        break;

      } else if (codeA & codeB) { // trivial reject
        break;

      } else if (codeA) { // a is outside, intersect with clip edge
        a = intersect(a, b, codeA, bbox);
        codeA = bitCode(a, bbox);

      } else { // b is outside
        b = intersect(a, b, codeB, bbox);
        codeB = bitCode(b, bbox);
      }
    }

    codeA = lastCode;
  }

  if (part.length) {
    result.push(part);
  }

  return result;
}

/**
 * Sutherland–Hodgman polygon clipping algorithm.
 *   https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
 *
 * @param points
 * @param bbox - [xMin, yMin, xMax, yMax]
 */
export function clipPolygon(points: IPolygon, bbox: Tuple4): IPolygon {
  let result!: IPolygon;
  let prev: IPoint;
  let prevInside: boolean;

  // clip against each side of the clip rectangle
  for (let edge = 1; edge <= 8; edge *= 2) {
    result = [];
    prev = points[points.length - 1];
    prevInside = !(bitCode(prev, bbox) & edge);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const inside = !(bitCode(p, bbox) & edge);

      // if segment goes through the clip window, add an intersection
      if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));

      if (inside) result.push(p); // add a point if it's inside

      prev = p;
      prevInside = inside;
    }

    points = result;

    if (!points.length) break;
  }

  return result;
}


/**
 * Intersect a segment against one of the 4 lines that make up the bbox.
 */
function intersect(a: IPoint, b: IPoint, edge: number, bbox: Tuple4): IPoint {
  // top
  if (edge & 8) {
    return [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]];
  }
  // bottom
  else if (edge & 4) {
    return [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]];
  }
  // right
  else if (edge & 2) {
    return [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])];
  }
  // left
  else if (edge & 1) {
    return [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])];
  }
  throw new Error(`can't find intersection`);
}


/**
 * Bit code reflects the point position relative to the bbox:
 *           left  mid  right
 *      top  1001  1000  1010
 *      mid  0001  0000  0010
 *   bottom  0101  0100  0110
 */
function bitCode(p: IPoint, bbox: Tuple4): number {
  let code = 0;

  if (p[0] < bbox[0]) code |= 1; // left
  else if (p[0] > bbox[2]) code |= 2; // right

  if (p[1] < bbox[1]) code |= 4; // bottom
  else if (p[1] > bbox[3]) code |= 8; // top

  return code;
}

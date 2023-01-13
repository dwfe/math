import {IPoint} from '../geometry'

/**
 *
 * @return [extremeX, extremeY]
 */
export function getPointsExtremeValues(points: IPoint[]): IExtreme[] {
  if (points.length === 0) {
    throw new Error(`can't calculate extreme values for zero length array`);
  }
  const extremeX = {
    min: Number.MAX_VALUE,
    max: -Number.MAX_VALUE,
  };
  const extremeY = {
    min: Number.MAX_VALUE,
    max: -Number.MAX_VALUE,
  };
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (x < extremeX.min) {
      extremeX.min = x;
    }
    if (x > extremeX.max) {
      extremeX.max = x;
    }
    if (y < extremeY.min) {
      extremeY.min = y;
    }
    if (y > extremeY.max) {
      extremeY.max = y;
    }
  }
  return [extremeX, extremeY];
}

export interface IExtreme {
  min: number;
  max: number;
}

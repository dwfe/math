import {applyPaddingToRect} from './applyPaddingToRect';
import {IPoint, IRect, Rect} from '../../geometry';
import {getPointsExtremeValues} from '../../util';

/**
 * Вычислить прямоугольник по экстремумам переданного массива точек.
 * К прямоугольнику можно применить padding.
 */
export function getBoundingRect(points: IPoint[], padding = 0): IRect {

  // оборачивающий прямоугольник
  const [extremeX, extremeY] = getPointsExtremeValues(points);
  let boundingRect = Rect.fromCornerPoint(
    extremeX.max - extremeX.min,  // width
    extremeY.max - extremeY.min,  // height
    [extremeX.min, extremeY.min], // точка отрисовки
    'leftTop'                     // место, где находится точка отрисовки относительно оборачивающего прямоугольника
  );

  // добавить padding
  if (padding > 0) {
    boundingRect = applyPaddingToRect(boundingRect, padding);
  }

  return boundingRect;
}

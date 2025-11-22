// @ts-ignore
import polygonSplitter from 'polygon-splitter';
import {IPoint} from '../../geometry';

/**
 * Разрезать полигон линией.
 *
 * Внимание! Полигон должен быть явно замкнут.
 * Иначе алгоритм работает с багами (радит некорректно).
 *
 * Возможно, есть смысл рассмотреть другие решения:
 *   - Splitting an arbitrary polygon by a line: https://geidav.wordpress.com/2015/03/21/splitting-an-arbitrary-polygon-by-a-line/
 *   - Interactively split a polygon by a line: https://observablehq.com/@chrispahm/interactively-split-a-polygon-by-a-line
 *   - https://github.com/mfogel/polygon-clipping
 */
export function splitPolygonWithLine(origPolygon: IPoint[], cuttingLine: IPoint[]): Array<Array<IPoint[]>> {
  const polygon = {
    type: 'Polygon',
    coordinates: [origPolygon]
  }
  const polyline = {
    type: 'LineString',
    coordinates: cuttingLine,
  }
  // разрезание
  const output = polygonSplitter(polygon, polyline);
  return (
    output?.geometry?.coordinates || // много полигонов
    [[origPolygon]] // если исходный полигон не был разрезан. В результате выполнения polygonSplitter будет заполнено поле: output.coordinates
  );
}

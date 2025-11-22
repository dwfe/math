import {IPoint, StraightLine} from '../../geometry';

/**
 * Разрезать линию линией.
 */
export function splitLineWithLine(origLine: IPoint[], cuttingLine: StraightLine): Array<IPoint[]> {
  const result: Array<IPoint[]> = [];

  // бежим по точкам и проверяем каждый отрезок на пересечение с cuttingLine(разрезающей линией)
  let next: IPoint[] = [];
  for (let i = 1; i < origLine.length; i++) {
    const prev = origLine[i - 1];
    const curr = origLine[i];

    next.push(prev);

    const checkLine = new StraightLine(prev, curr);
    const {dontIntersect, intersectionPoint} = checkLine.segmentIntersectsSegment(cuttingLine);
    if (dontIntersect) continue;

    next.push(intersectionPoint!); // когда линия упирается в разрез,
    result.push(next);             // тогда завершить эту линию

    next = [intersectionPoint!]; // начать новую линию
  }

  // последняя точка в цикле не учитывается, поэтому учтем ее здесь
  const last = origLine.at(-1);
  if (last) next.push(last);

  if (next.length > 2) // эта проверка на всякий случай,
    result.push(next); // т.к., по-идее, обыгрывается невозможная ситуация

  return result;
}

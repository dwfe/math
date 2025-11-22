import {IPoint, Point} from '../geometry';

export function isClosedLine(line: IPoint[]) {
  if (!isLine(line)) {
    return false;
  }
  return Point.isEqual(
    line[0],
    line.at(-1)!
  );
}

export function isClosedLineAccuracy(line: IPoint[], accuracy?: number) {
  if (!isLine(line)) {
    return false;
  }
  if (isClosedLine(line)) {
    return true;
  }
  return Point.isEqualAccuracy(
    line[0],
    line.at(-1)!,
    accuracy,
  );
}

// Линия - это как минимум 2 точки
export function isLine(line: IPoint[]) {
  return line.length > 1;
}

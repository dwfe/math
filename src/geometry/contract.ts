export type TPoint = [number, number]

export interface IPoint {
  x: number;
  y: number;
}

export interface IDiff {
  dX: number;
  dY: number;
}

export type TVector = [TPoint, TPoint] // 2D vector: [startPoint, endPoint]

// https://developer.mozilla.org/en-US/docs/Web/CSS/angle
export enum AngleType {
  DEGREES = 'deg',
  RADIANS = 'rad',
  GRADIANS = 'grad',
  TURNS = 'turn',
}

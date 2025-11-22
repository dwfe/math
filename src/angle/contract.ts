import {ICornerPointPosition} from '../geometry';

// https://developer.mozilla.org/en-US/docs/Web/CSS/angle
export type IAngleUnit = 'deg' | 'rad' | 'grad' | 'turn';

export type IAngleQuadrant = ICornerPointPosition;

// https://en.wikipedia.org/wiki/Cardinal_direction
export enum CardinalDirection {
  N = 0,    // С   - Север
  NNE = 1,  // ССВ - Север-Северо-Восток
  NE = 2,   // СВ  - Северо-Восток
  ENE = 3,  // ВСВ - Восток-Северо-Восток
  E = 4,    // В   - Восток
  ESE = 5,  // ВЮВ - Восток-Юго-Восток
  SE = 6,   // ЮВ  - Юго-Восток
  SSE = 7,  // ЮЮВ - Юг-Юго-Восток
  S = 8,    // Ю   - Юг
  SSW = 9,  // ЮЮЗ - Юг-Юго-Запад
  SW = 10,  // ЮЗ  - Юго-Запад
  WSW = 11, // ЗЮЗ - Запад-Юго-Запад
  W = 12,   // З   - Запад
  WNW = 13, // ЗСЗ - Запад-Северо-Запад
  NW = 14,  // СЗ  - Северо-Запад
  NNW = 15, // ССЗ - Север-Северо-Запад
}


export interface IDegMinSecStrOpt {
  skipSec?: boolean;
  geoDirection?: 'lon' | 'lat';
  lang?: 'en' | 'ru';
  separator?: string;
}

export enum RelativeToAxis {
  X = 1,
  Y = 2,
}

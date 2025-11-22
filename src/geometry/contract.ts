import {Tuple4, Tuple5} from '../contract'

export type IYPosition = 'top' | 'bottom';
export type IXPosition = 'left' | 'right';
export type ISidePosition = IYPosition | IXPosition;
export type ICornerPointPosition = 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';
export type IEdgePosition = ISidePosition | ICornerPointPosition;
export type IRectPosition = IEdgePosition | 'center';


export type IPoint = number[];
export type ILine = IPoint[];
export type IPolygon = IPoint[];
export type IMultiline = Array<IPoint[]>;
export type IMultipolygon = Array<IPoint[]>;


export interface IRect extends IRectPoints {
  left: number;
  top: number;
  right: number;
  bottom: number;

  leftTop: IPoint,
  rightTop: IPoint,
  rightBottom: IPoint,
  leftBottom: IPoint,

  points: Tuple4<IPoint>;
  polygon: Tuple5<IPoint>;

  width: number;
  height: number;
  aspectRatio: number;

  center: IPoint;
}

export interface IRectPoints {
  leftTop: IPoint;
  rightTop: IPoint;
  rightBottom: IPoint;
  leftBottom: IPoint;
}

export interface IStraightLineOpt {

  /**
   * Количество чисел после запятой, которое должно быть во всех координатах точки.
   * Например, в пиксельном пространстве после применения всевозможных трансформаций:
   *  - координата x для точки p1 = 748.523645172341
   *  - координата x для точки p2 = 748.5236451723413
   * линия, созданная по таким точкам, не будет считаться параллельной оси y. И в некоторых кейсах это плохо.
   * Поэтому можно взять и обрезать десятичную часть, например, до трех знаков.
   */
  maxDecimalsInPointCoords?: number;

  /**
   * Нечеткость строго горизонтальных и строго вертикальных линий - это особенность отрисовки на канвасе для экранов с обычной плотностью пикселей.
   * Чтобы такие линии были четкими надо соответствующую их координату делать с половиной пикселя:
   *   - координата x - для вертикальных линий;
   *   - координата y - для горизонтальных линий.
   */
  makeCrisp?: boolean;
}

export interface IStraightLinesIntersection {
  isSameLine?: boolean; // прямые линии совпадают во всех точках
  dontIntersect?: boolean; // нет пересечений
  intersectionPoint?: IPoint; // одна единственная точка пересечения
}

export interface ISegmentsIntersection {
  onSameLineAndIntersect?: boolean; // отрезки лежат на одной прямой линии, и у них есть общие точки пересечения
  dontIntersect?: boolean; // нет пересечений
  intersectionPoint?: IPoint; // одна единственная точка пересечения
}

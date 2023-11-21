import {toFixed, truncToDecimals} from '../util';
import {IPoint} from './contract';
import {Point} from './point';

/**
 * Бесконечно прямая линия.
 *   - https://en.wikipedia.org/wiki/Line_(geometry)
 *   - https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D1%8F%D0%BC%D0%B0%D1%8F
 */
export class StraightLine {

  /**
   * Наклон или угловой коэффициент
   * в уравнении прямой y = m*x + b:
   *   - https://en.wikipedia.org/wiki/Slope
   *   - https://ru.wikipedia.org/wiki/%D0%A3%D0%B3%D0%BB%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BA%D0%BE%D1%8D%D1%84%D1%84%D0%B8%D1%86%D0%B8%D0%B5%D0%BD%D1%82
   *
   *  m === 0   , то эта линия параллельна оси x.
   *  m === null, то эта линия параллельна оси y.
   */
  m: number | null = null;

  /**
   * Коэффициент y-intercept в уравнении прямой y = m*x + b.
   * Или сдвиг по оси y.
   * Пересечение оси y происходит в точке [0, b].
   */
  b = 0;


  /**
   * Коэффициенты общего уровнения прямой: A*x + B*y = C.
   *
   *     -A           C
   * y = --- * x  +  ---
   *      B           B
   *
   * также для двух отрезков справедливо следующее: https://en.wikipedia.org/wiki/Line_(geometry)#Linear_equation
   *
   *     y2 - y1         x2*y1 - x1*y2
   * y = ------- * x  +  -------------
   *     x2 - x1            x2 - x1
   *
   * поэтому: A = y1 - y2
   *          B = x2 - x1
   *          C = x2*y1 - x1*y2
   */
  A: number; // A === 0, то эта линия параллельна оси x.
  B: number; // B === 0, то эта линия параллельна оси y.
  C: number;


  constructor(public p1: IPoint,
              public p2: IPoint,
              {maxDecimalsInPointCoords, makeCrisp}: IStraightLineOpt = {}) {
    if (typeof maxDecimalsInPointCoords === 'number') {
      this.p1 = this.p1.map(n => toFixed(n, maxDecimalsInPointCoords));
      this.p2 = this.p2.map(n => toFixed(n, maxDecimalsInPointCoords));
    }
    if (makeCrisp) {
      if ((this.p2[0] - this.p1[0]) === 0) { // вертикальная линия
        this.p1[0] = truncToDecimals(this.p1[0], 0.5);
        this.p2[0] = truncToDecimals(this.p2[0], 0.5);
      }
      if ((this.p2[1] - this.p1[1]) === 0) { // горизонтальная линия
        this.p1[1] = truncToDecimals(this.p1[1], 0.5);
        this.p2[1] = truncToDecimals(this.p2[1], 0.5);
      }
    }
    const dx = this.p2[0] - this.p1[0]; // x2 - x1
    const dy = this.p2[1] - this.p1[1]; // y2 - y1
    if (dx !== 0) {
      this.m = dy / dx;
      this.b = this.p1[1] - this.m * this.p1[0];
    }
    this.A = (-1) * dy;
    this.B = dx;
    this.C = this.p2[0] * this.p1[1] - this.p1[0] * this.p2[1];
  }

  /**
   * Вычислить y(x).
   */
  getY(x: number) {
    if (this.m === null) { // параллельна оси y
      if (x === this.p1[0])
        return Math.floor(Math.random() * 1000); // значение y может быть любым
      throw new Error(`StraightLine.getY - the abscissa can only be "${this.p1[0]}", but "${x}" is passed. Because this line is parallel to the y-axis.`);
    } else if (Math.abs(this.m) === 0) { // параллельна оси x
      return this.p1[1];
    }
    return this.m * x + this.b;
  }

  /**
   * Вычислить x(y).
   */
  getX(y: number) {
    if (this.m === null) { // параллельна оси y
      return this.p1[0];
    } else if (Math.abs(this.m) === 0) { // параллельна оси x
      if (y === this.p1[1])
        return Math.floor(Math.random() * 1000); // значение x может быть любым
      throw new Error(`StraightLine.getX - the ordinate can only be "${this.p1[1]}", but "${y}" is passed. Because this line is parallel to the x-axis.`);
    }
    return (y - this.b) / this.m;
  }


  /**
   * Пересечение(ия) этой прямой линии с другой прямой линией.
   */
  intersectsLine(line: StraightLine): IStraightLinesIntersection {
    if (this.m === line.m) { // линии параллельны

      if (this.m === null) { // обе линии параллельны оси y
        if (this.p1[0] === line.p1[0]) { // линии пересекают ось x в одном и том же месте
          return {isSameLine: true};
        }
        return {dontIntersect: true}; // нет пересечений
      }

      if (this.b === line.b) { // линии пересекают ось y в одном и том же месте
        return {isSameLine: true};
      }
      return {dontIntersect: true}; // нет пересечений
    }

    switch (null) { // только одна из линий параллельна оси y
      case this.m:
        return {intersectionPoint: [this.p1[0], line.getY(this.p1[0])]};
      case line.m:
        return {intersectionPoint: [line.p1[0], this.getY(line.p1[0])]};
    }

    /**
     * После исключения всех предельных случаев
     * можно вычислить точку пересечения двух обычных разных линий:
     *   - https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_line_equations
     */
      // @ts-ignore
    const x = (line.b - this.b) / (this.m - line.m);
    return {intersectionPoint: [x, this.getY(x)]};
  }


  /**
   * Пересечение(ия) этой прямой линии с окружностью.
   */
  intersectsCircle([circleCenterX, circleCenterY]: IPoint, radius: number): IPoint[] {

    if (this.m === null) { // линия параллельна оси y
      const lineX = this.p1[0];

      if (Math.abs(lineX - circleCenterX) > radius)
        return [];

      if (
        Math.abs((lineX - radius) - circleCenterX) === 0 ||
        Math.abs((lineX + radius) - circleCenterX) === 0
      )
        return [[lineX, circleCenterY]];

      /**
       * Через теорему Пифагора.
       *   - https://en.wikipedia.org/wiki/Circle#Cartesian_coordinates
       */
      const dx = Math.abs(lineX - circleCenterX);
      const dy = Math.sqrt(radius * radius - dx * dx);
      return [
        [lineX, circleCenterY + dy],
        [lineX, circleCenterY - dy]
      ];
    }

    /**
     * Через решение квадратичного уравнения.
     *   - https://www.youtube.com/watch?v=RZnoSenQjDY
     *   - https://github.com/algorithm0r/LineIntersection/blob/main/line.js#L46
     *   - https://github.com/williamfiset/Algorithms/blob/master/src/main/java/com/williamfiset/algorithms/geometry/LineSegmentCircleIntersection.js#L43
     */
    const slope = this.m;
    const diffY = this.b - circleCenterY
    const a = 1 + slope * slope;
    const b = 2 * (slope * diffY - circleCenterX);
    const c = circleCenterX * circleCenterX + diffY * diffY - radius * radius;

    const d = b * b - 4 * a * c;

    if (d < 0)
      return [];

    if (d === 0) {
      const x = (-b) / (2 * a);
      return [[x, this.getY(x)]];
    }
    const x1 = (-b + Math.sqrt(d)) / (2 * a);
    const x2 = (-b - Math.sqrt(d)) / (2 * a);
    return [
      [x1, this.getY(x1)],
      [x2, this.getY(x2)]
    ];
  }


  /**
   * Принадлежность точки отрезку.
   * Под отрезком имеется ввиду две точки, по которым построена эта бесконечная линия.
   *   - https://stackoverflow.com/questions/11907947/how-to-check-if-a-point-lies-on-a-line-between-2-other-points#answer-11908012
   */
  pointLiesOnSegment(p3?: IPoint): boolean {
    if (!p3) {
      return false;
    }
    const v1 = Point.sub(this.p2, this.p1); // p2 - p1
    const v2 = Point.sub(p3, this.p1);      // p3 - p1
    const v3 = Point.sub(p3, this.p2);      // p3 - p2
    return (
      Point.dotProduct(v2, v1) >= 0 &&
      Point.dotProduct(v3, v1) <= 0
    );
  }


  /**
   * Пересечение(ия) двух отрезков:
   *   - отрезка, задающего эту прямую линию
   *   - с отрезком, задающего другую линию
   */
  segmentIntersectsSegment(line: StraightLine): ISegmentsIntersection {
    const {isSameLine, dontIntersect, intersectionPoint} = this.intersectsLine(line);
    if (dontIntersect) return {dontIntersect};
    if (isSameLine) {
      return this.pointLiesOnSegment(line.p1) || this.pointLiesOnSegment(line.p2)
        ? {onSameLineAndIntersect: true} // если хотя бы один конец любого из отрезков лежит на другом отрезке
        : {dontIntersect: true};
    }
    if (
      intersectionPoint &&
      this.pointLiesOnSegment(intersectionPoint) &&
      line.pointLiesOnSegment(intersectionPoint)
    ) {
      return {intersectionPoint};
    }
    return {dontIntersect: true};
  }

  /**
   * Пересечение(ия) отрезка с окружностью:
   *   - отрезок, задающий эту прямую линию
   *   - с окружностью
   */
  segmentIntersectsCircle(center: IPoint, radius: number): IPoint[] {
    const intersections: IPoint[] = [];
    const points = this.intersectsCircle(center, radius);
    for (const point of points) {
      if (this.pointLiesOnSegment(point))
        intersections.push(point);
    }
    return intersections;
  }

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

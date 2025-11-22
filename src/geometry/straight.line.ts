import {IPoint, ISegmentsIntersection, IStraightLineOpt, IStraightLinesIntersection} from './contract';
import {toFixed, truncToDecimals} from '../util';
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
   * Коэффициенты общего уравнения прямой: A*x + B*y = C.
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
   *          и, соответственно,
   *          C = -(A * x1 + B * y1)
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
    this.C = (-1) * (this.A * this.p1[0] + this.B * this.p1[1]);
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
   * Проверить принадлежит ли точка ОТРЕЗКУ: this.p1 - this.p2
   */
  pointBelongsToSegment(p?: IPoint): boolean {
    return StraightLine.pointBelongsToSegment(this.p1, this.p2, p);
  }

  /**
   * Проверить принадлежит ли точка этой линии.
   */
  pointBelongsToLine(point: IPoint, accuracy = 0.0000000001) {
    const x = point[0];
    const y = point[1];
    return (
      Math.abs(x - this.getX(y)) < accuracy &&
      Math.abs(y - this.getY(x)) < accuracy
    );
  }

  /**
   * Проверить в каком положении находится точка относительно линии.
   */
  pointPositionRelativeToLine(p: IPoint): number {
    return StraightLine.pointPositionRelativeToLine(this.p1, this.p2, p);
  }


  /**
   * Пересечение(ия) двух отрезков:
   *   - отрезок, задающий эту прямую линию
   *   - отрезок, задающий другую линию
   */
  segmentIntersectsSegment(line: StraightLine): ISegmentsIntersection {
    const {isSameLine, dontIntersect, intersectionPoint} = this.intersectsLine(line);
    if (dontIntersect) return {dontIntersect};
    if (isSameLine) {
      return this.pointBelongsToSegment(line.p1) || this.pointBelongsToSegment(line.p2)
        ? {onSameLineAndIntersect: true} // если хотя бы один конец любого из отрезков лежит на другом отрезке
        : {dontIntersect: true};
    }
    if (
      intersectionPoint &&
      this.pointBelongsToSegment(intersectionPoint) &&
      line.pointBelongsToSegment(intersectionPoint)
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
      if (this.pointBelongsToSegment(point))
        intersections.push(point);
    }
    return intersections;
  }


  normalPointData(p: IPoint) {
    return StraightLine.normalPointData(this.p1, this.p2, p);
  }

  normalLength(p: IPoint) {
    return StraightLine.normalLength(this.p1, this.p2, p);
  }

  /**
   * Вычислить точку n на прямой a-b, которая также принадлежит прямой p-n, перпендикулярной a-b.
   * Таким образом точка n является точкой нормали к прямой a-b относительно внешней точки p.
   *   https://stackoverflow.com/questions/37197987/find-point-along-line-where-normal-extends-through-another-point#answer-37201852
   *
   * @param a - точка a прямой a-b
   * @param b - точка b прямой a-b
   * @param p - точка, из которой проводится нормаль к прямой a-b
   */
  static normalPointData(a: IPoint, b: IPoint, p: IPoint) {
    const denominator = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
    // если a и b совпадают
    if (denominator === 0) {
      return {normalPoint: a, isOnSegment: true};
    }
    const numerator = ((b[0] - a[0]) * (p[0] - a[0]) + (b[1] - a[1]) * (p[1] - a[1]));
    const cf = numerator / denominator;
    return {
      normalPoint: [
        a[0] + (b[0] - a[0]) * cf,
        a[1] + (b[1] - a[1]) * cf
      ],
      isOnSegment: cf >= 0 && cf <= 1 // точка нормали лежит на отрезке a-b?
    };
  }

  /**
   * Вычислить длину отрезка начинающегося в точке p и перпендикулярного прямой a-b.
   * Таким образом получим длину нормали к прямой a-b относительно внешней точки p.
   *   https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
   *
   * @param a - точка a прямой a-b
   * @param b - точка b прямой a-b
   * @param p - точка, из которой проводится нормаль к прямой a-b
   */
  static normalLength(a: IPoint, b: IPoint, p: IPoint) {
    const denominator = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // если a и b совпадают
    if (denominator === 0) {
      return Point.distance(a, p);
    }
    const numerator = Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (p[0] - a[0]) * (b[1] - a[1]));
    return numerator / denominator;
  }


  /**
   * Принадлежность точки отрезку.
   *   https://stackoverflow.com/questions/11907947/how-to-check-if-a-point-lies-on-a-line-between-2-other-points#answer-11908012
   */
  static pointBelongsToSegment(a: IPoint, b: IPoint, p?: IPoint): boolean {
    if (!p) {
      return false;
    }
    const v1 = Point.sub(b, a); // b - a
    const v2 = Point.sub(p, a); // p - a
    const v3 = Point.sub(p, b); // p - b
    return (
      Point.dotProduct(v2, v1) >= 0 &&
      Point.dotProduct(v3, v1) <= 0
    );
  }


  /**
   * Расположение тестируемой точки относительно прямой линии, заданной точками a и b.
   *   https://stackoverflow.com/questions/2752725/finding-whether-a-point-lies-inside-a-rectangle-or-not#answer-2752753
   *
   * Алгоритм относительно отрезка:
   *   https://www.geeksforgeeks.org/direction-point-line-segment/
   *
   * @param a - точка прямой a-b
   * @param b - еще одна точка прямой a-b
   * @param p - тестируемая точка
   * @return Справа или слева лежит тестируемая точка.
   *         Порядок точек a-b важен.
   *         Допустим функция выдает (+)значение для a-b, но для b-a точно будет отдавать (-)значение.
   *         Для примера результат можно интерпретировать так:
   *           • (result > 0) точка лежит с левой стороны отрезка;
   *           • (result < 0) точка лежит с правой стороны отрезка;
   *           • (result = близкое к 0 число) точка лежит на прямой.
   */
  static pointPositionRelativeToLine(a: IPoint, b: IPoint, p: IPoint): number {
    return (b[0] - a[0]) * (p[1] - a[1]) - (p[0] - a[0]) * (b[1] - a[1]);
  }

}

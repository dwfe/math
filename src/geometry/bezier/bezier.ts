import {IPoint} from '../contract';
import {Rect} from '../rect';
import {Equation} from './equation';
import {approximately} from '../../util/approximately';
import {ICurveIntersections, ICurveIntersectPoint, ICurveIntersectWithTangent} from '../../__tests__/geometry/bezier/contracts';

/**
 * Класс для работы с кривой Безье.
 * На данный момент кубической кривой Безье,
 * {@link https://ru.wikipedia.org/wiki/%D0%9A%D1%80%D0%B8%D0%B2%D0%B0%D1%8F_%D0%91%D0%B5%D0%B7%D1%8C%D0%B5#%D0%9A%D1%83%D0%B1%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B5_%D0%BA%D1%80%D0%B8%D0%B2%D1%8B%D0%B5 CubicBezier}
 * для квадратичной кривой применимы те же принципы, но методы не описаны за неиспользуемостью.
 *
 * @name <curveEquation>
 * Кривая описывается следующим уравнением
 * B(t) = (1 - t)^3^ * P0 + 3t(1 - t)^2^ * P1 + 3t^2^(1 - t) * P2 + t^3^ * P3; t ∈ [0;1]
 * Параметр t принадлежит диапазону от 0 до 1 включительно. По сути дела это своего рода длина кривой, независящая ни
 * от каких геометрических обстоятельств. Это важно понимать, так как часто используется в работе.
 * Уравнение выше используется для нахождения координаты оси на заданной "расстоянии" t, поэтому для нахождения
 * точки кривой уравнение считается дважды независимо для каждой оси и поэтому многие методы класса принимают на вход точки
 * и указатель на ось, какая будет использована для расчёта, чтобы снизить число копирований в использующем коде
 *
 * Первая производная кривая описывается следующим уравнением
 * B`(t) = -3(1 - t)^2^ * P0 + 3(1 - 4t + 3t^2^) * P1 + 3(2t - 3t^2^) * P2 + 3t^2^ * P3; t ∈ [0;1]
 * Нахождение значения производной так же осуществляется для каждой оси независимо.
 * Используется главным образом для нахождения касательной на расстоянии t и определения минимумов и максимумов кривой.
 * {@link https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F_%D1%84%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%B8#%D0%93%D0%B5%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D0%B8_%D1%84%D0%B8%D0%B7%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9_%D1%81%D0%BC%D1%8B%D1%81%D0%BB_%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9 Геометрический смысл}
 *
 *
 * Вторая производная кривая описывается следующим уравнением
 * B``(t) = 6(1 - t) * P0 + 3(-4 + 6t) * P1 + 3(2 - 6t) * P2 + 6t * P3; t ∈ [0;1]
 * Используется для нахождения точек перегиба и определения знака кривой на участке.
 * {@link https://ru.wikipedia.org/wiki/%D0%92%D1%82%D0%BE%D1%80%D0%B0%D1%8F_%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F#%D0%92%D1%82%D0%BE%D1%80%D0%B0%D1%8F_%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%BE%D0%B4%D0%BD%D0%B0%D1%8F_%D0%BD%D0%B0_%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D0%BA%D0%B5 Геометрический смысл}
 *
 * @see {@link https://pomax.github.io/bezierinfo/index.html Математическая основа класса}
 */
export class Bezier {

  // region Helpers
  /**
   * Точка на второй производной кривой безье при заданном t для выбранной оси.
   */
  static findSecondDerivativeCoordinateByTAtAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number, axis: 0 | 1) {
    return 6 * (1 - t) * p0[axis] + 3 * (-4 + 6 * t) * p1[axis] + 3 * (2 - 6 * t) * p2[axis] + 6 * t * p3[axis]
  }

  /**
   * Точка на кривой безье при заданном t для выбранной оси
   */
  private static findCoordinateByTatAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number, axis: 0 | 1) {
    return Math.pow(1 - t, 3) * p0[axis] + 3 * Math.pow(1 - t, 2) * t * p1[axis] + 3 * (1 - t) * Math.pow(t, 2) * p2[axis] + Math.pow(t, 3) * p3[axis]
  }

  /**
   * Точка на производной кривой безье при заданном t
   */
  private static findDerivativePointByT(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number): IPoint {
    return [
      Bezier.findDerivativeCoordinateByTAtAxis(p0, p1, p2, p3, t, 0),
      Bezier.findDerivativeCoordinateByTAtAxis(p0, p1, p2, p3, t, 1),
    ]
  }

  /**
   * Точка на кривой безье при заданном t
   */
  static findPointByT(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number) {
    return [
      Bezier.findCoordinateByTatAxis(p0, p1, p2, p3, t, 0),
      Bezier.findCoordinateByTatAxis(p0, p1, p2, p3, t, 1),
    ]
  }

  /**
   * Точка на проивзодной кривой безье при заданном t для выбранной оси
   */
  private static findDerivativeCoordinateByTAtAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, t: number, axis: 0 | 1) {
    return -3 * Math.pow(1 - t, 2) * p0[axis] + 3 * (1 - 4 * t + 3 * t ** 2) * p1[axis] + 3 * (2 * t - 3 * t ** 2) * p2[axis] + 3 * t ** 2 * p3[axis]
  }

  // region cubic equation
  /**
   * Коэффициент А для кубического уравнения кривой
   */
  private static getAatAxisForCubic(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, axis: 0 | 1) {
    return -p0[axis] + 3 * (p1[axis] - p2[axis]) + p3[axis]
  }

  /**
   * Коэффициент Б для кубического уравнения кривой
   */
  private static getBatAxisForCubic(p0: IPoint, p1: IPoint, p2: IPoint, axis: 0 | 1) {
    return 3 * (p0[axis] - 2 * p1[axis] + p2[axis])
  }

  /**
   * Коэффициенты для кубического уравнения кривой
   */
  private static getCoefsForCubicEquationAtAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, axis: 0 | 1): [number, number, number, number] {
    let a = Bezier.getAatAxisForCubic(p0, p1, p2, p3, axis)
    let b = Bezier.getBatAxisForCubic(p0, p1, p2, axis)
    let c = Bezier.getCatAxisForQuadratic(p0, p1, axis)
    let d = Bezier.getDatAxisForCubic(p0, axis)
    return [a, b, c, d]
  }

  //endregion cubic equation

  //region quadratic equation
  /**
   * Коэфициент а для квадратного уравнения кривой производной
   */
  private static getAatAxisForQuadratic(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, axis: 0 | 1) {
    return 3 * (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis])
  }

  /**
   * Коэфициент b для квадратного уравнения кривой производной
   */
  private static getBatAxisForQuadratic(p0: IPoint, p1: IPoint, p2: IPoint, axis: 0 | 1) {
    return 6 * (p0[axis] - 2 * p1[axis] + p2[axis])
  }

  /**
   * Коэфициент c для квадратного уравнения кривой производной
   */
  private static getCatAxisForQuadratic(p0: IPoint, p1: IPoint, axis: 0 | 1) {
    return 3 * (p1[axis] - p0[axis])
  }

  /**
   * Коэфициент а для кубического уравнения кривой производной
   */
  private static getDatAxisForCubic(p0: IPoint, axis: 0 | 1) {
    return p0[axis]
  }

  /**
   * Коэфициенты для квадратного уравнения кривой производной
   */
  private static getCoefsForQuadraticEquationAtAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, axis: 0 | 1): [number, number, number] {
    let a = Bezier.getAatAxisForQuadratic(p0, p1, p2, p3, axis)
    let b = Bezier.getBatAxisForQuadratic(p0, p1, p2, axis)
    let c = Bezier.getCatAxisForQuadratic(p0, p1, axis)
    return [a, b, c]
  }

  // endregion quadratic equation

  //endregion Helpers

  /**
   * Обернуть кривую Безье прямоугольником, параллельным осям x и y
   */
  static fitToRect(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint) {
    let rangeX = Bezier.minMaxAtAxis(p0, p1, p2, p3, 0)
    let rangeY = Bezier.minMaxAtAxis(p0, p1, p2, p3, 1)
    return Rect.fromCornerPoint(rangeX[1] - rangeX[0], rangeY[1] - rangeY[0], [rangeX[0], rangeY[0]], 'leftTop')
  }

  /**
   * Минимум/максимум кривой безье по выбранной оси
   *
   * Суть: если функция имеет локальный максимум/минимум при значении аргумента, равном 𝑥, то f'(x)=0
   * Решаем уравнение производной для выбранной оси
   */
  static minMaxAtAxis(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, axis: 0 | 1): [number, number] {
    // Корни уравнения производной, суть массив "расстояний" t, отсортированный по возрастанию
    let roots = Equation.solveQuadratic(...Bezier.getCoefsForQuadraticEquationAtAxis(p0, p1, p2, p3, axis))

    // В результате вычислений возможны погрешности. Корни, примерно равные 0 и 1 заменяем 0 и 1
    roots = roots.map((root) => {
      return approximately(root, 0) ? 0 : approximately(root, 1) ? 1 : root
    })

    // По умолчанию, минимум и максимум уже установлен - это t = 0 и t = 1
    // Нас интересуют корни, отличные от 0 и 1, но находящиеся в их пределах
    roots = roots.filter((root) => root > 0 && root < 1)


    // Здесь у нас массив t от нуля до двух элементов + значения 0 и 1
    // Поиск значения по производной может вернуть не абсолютный экстремум, а локальный.
    // Можно либо увеличить вероятность определения локального/абсолютного экстремума, но
    // проще просто рассчитать координаты в этих точках и вернуть фактические экстремумы из расчитанных корней и
    // точек p0 и p3, так как именно в них заканчивается/начинается кривая
    roots = roots.map((root) => Bezier.findCoordinateByTatAxis(p0, p1, p2, p3, root, axis))

    return [Math.min(...roots, p0[axis], p3[axis]), Math.max(...roots, p0[axis], p3[axis])]
  }


  static getXbyY(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, atPoint: IPoint, findAxis: 0 | 1, withTangent: false): ICurveIntersections<ICurveIntersectPoint>
  static getXbyY(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, atPoint: IPoint, findAxis: 0 | 1, withTangent: true): ICurveIntersections<ICurveIntersectWithTangent>
  /**
   * Найти все пересечения кривой безье с линией, пареллельной выбранной оси и проходящей через atPoint
   * {@link https://pomax.github.io/bezierinfo/index.html#yforx Визуализация}
   *
   * На примере X от Y. Найти все X по Y точки atPoint.
   * Последовательность действий:
   * 1. решение уравнения кривой для оси Y, равное atPoint[1]. В результате получаем массив расстояний t,
   * на которых Y равен искомой величине
   * 2. Для каждого t вновь решаем уравнение кривой с уже известным аргументом но для другой оси, в результате чего
   * получаем массив величин X на этом расстоянии t.
   * 3. Опционально в зависимости от аргумента withTangent на том же расстоянии t находим точку первой производной,
   * которая как раз таки и иллюстрирует касательную в той же точке на самой кривой.
   *
   * @params_points p0, p1, p2, p3 - точки кривой
   * @params_atPoint точка, через которую проходит параллельная выбранной оси линия
   * @params_findAxis линия строится параллельно оси X(0) или оси Y(1)
   * @params_withTangent указания на то, что необходимо вернуть ещё и касательные для найденных точек
   * @returns {Array<IPoint | {point: IPoint, tangent: IPoint}>>} возвращается массив либо точек, либо объектов
   * {point, tangent} с точкой и касательной соответственно
   */
  static getXbyY(p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, atPoint: IPoint, findAxis: 0 | 1, withTangent: boolean = false): ICurveIntersections<ICurveIntersectPoint | ICurveIntersectWithTangent> {
    // Все точки искомой оси лежат на прямой, проходящей через atPoint
    if (
      atPoint[1 - findAxis] === p0[1 - findAxis] &&
      atPoint[1 - findAxis] === p1[1 - findAxis] &&
      atPoint[1 - findAxis] === p2[1 - findAxis] &&
      atPoint[1 - findAxis] === p3[1 - findAxis]
    ) {
      return {isSameLine: true}
    }

    /**
     * Нужно решить вот эту простыню {@see curveEquation}, которая равна занчению в точке atPoint
     * Общий вид - кубическое уравнение ax^2 + bx + c = d
     */

      // коэффициенты a, b, c, d для кубического уравнения
    let coef = Bezier.getCoefsForCubicEquationAtAxis(p0, p1, p2, p3, (1 - findAxis) as 0 | 1)

    // приведение уравнения к виду ax^2 + bx + c - d = 0
    coef[3] -= atPoint[1 - findAxis]

    // собственно решение. Решение взято со stackoverflow.
    // согласно https://pomax.github.io/bezierinfo мнимые корни уравнения значения не имеют
    // обрабатываются ли мнимые корни в решении и если да, то как, точного ответа нет...
    // однако пока работает. TODO Возможно найти кейс с кривой, когда будет извлекаться корень из -1 по идее и проверить
    let roots = Equation.solveCubic(...coef)
    roots = roots
      // Здесь возможен косяк для очень дробных чисел, которые не являются погрешностью, так как здесь
      // сравнение на приблизительную равность нулю и единице. Важно это сделать, иначе корректность
      // нахождения корней страдает
      .map(r => approximately(r, 0) ? 0 : approximately(r, 1) ? 1 : r)
      // Отсеиваем всё, что вне диапазона [0;1], так как только эти значения t имеют смысл
      .filter(r => r >= 0 && r <= 1)
      // Сортируем по возрастанию для удобства
      .sort((a, b) => a - b)

    let coord: number

    // для каждого корня уравнения, который по сути t
    let intersections = roots.map((root, i) => {
      // находим координату на искомой оси
      coord = Bezier.findCoordinateByTatAxis(p0, p1, p2, p3, root, findAxis)
      return {
        point: [findAxis ? atPoint[0] : coord, findAxis ? coord : atPoint[1]],
        tangent: withTangent ? Bezier.findDerivativePointByT(p0, p1, p2, p3, roots[i]) : undefined
      }
    })

    if (!intersections.length) return {dontIntersect: true}

    intersections = intersections.sort((a, b) => a.point[findAxis] - b.point[findAxis])

    return {intersections}
  }
}

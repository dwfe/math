import '@do-while-for-each/test';
import {IPoint, IRectPoints, Point, Rect, StraightLine} from '../../geometry';
import {RectContains} from '../../algorithm';
import {IMatrix} from '../../linear-algebra/contract';
import {identityMatrix, Matrix, Operator} from '../../linear-algebra';
import {Tuple2} from '../../contract';

describe('RectContains', () => {

  /**
   * Т.к. проверка нахождения точки внутри прямоугольника основывается
   * на проверке с какой строны линии находится тестируемая точка,
   * поэтому протестируем здесь StraightLine.pointLocation
   */
  test('StraightLine.pointLocation', () => {
    const check = (a: IPoint, b: IPoint, p: IPoint, expectedValue: number) => {
      const d = StraightLine.pointPositionRelativeToLine(a, b, p);
      expect(expectedValue).eq(d);
    };

    // точка находятся на прямой, но не принадлежит отрезку a-b
    check([-12.042, 0.803], [-6.684, -9.702], [-5.597, -11.834], -0.00432100000000446);

    check([-12.042, 0.803], [-6.684, -9.702], [-12.008, 0.792], 0.29823200000000727);
    check([-12.042, 0.803], [-6.684, -9.702], [-9.585, -4.004], 0.054878999999996125);
    check([-12.042, 0.803], [-6.684, -9.702], [0, 0], 122.198736);
    check([-12.042, 0.803], [-6.684, -9.702], [-21, -9], -146.628264);
  });


  test('point', () => {
    const check = (rect: IRectPoints, point: IPoint, expectedResult: boolean) => {
      expect(expectedResult).eq(RectContains.point(rect, point));
    };
    const offset = 0.0001;

    // прямоугольник, стороны которого параллельны осям координат
    let rect: IRectPoints = {
      leftTop: [-10, -10],
      rightTop: [10, -10],
      rightBottom: [10, 30],
      leftBottom: [-10, 30],
    };
    check(rect, [0, 0], true);
    check(rect, rect.leftTop, true);
    check(rect, [rect.leftTop[0] - offset, rect.leftTop[1]], false);
    check(rect, [rect.leftTop[0], rect.leftTop[1] - offset], false);
    check(rect, rect.rightTop, true);
    check(rect, [rect.rightTop[0] + offset, rect.rightTop[1]], false);
    check(rect, [rect.rightTop[0], rect.rightTop[1] - offset], false);
    check(rect, rect.rightBottom, true);
    check(rect, [rect.rightBottom[0] + offset, rect.rightBottom[1]], false);
    check(rect, [rect.rightBottom[0], rect.rightBottom[1] + offset], false);
    check(rect, rect.leftBottom, true);
    check(rect, [rect.leftBottom[0] - offset, rect.leftBottom[1]], false);
    check(rect, [rect.leftBottom[0], rect.leftBottom[1] + offset], false);


    // прямоугольник повернутый в пространстве
    rect = {
      leftTop: [-6.684, -9.702],
      rightTop: [12.366, 0.013],
      rightBottom: [7.009, 10.519],
      leftBottom: [-12.042, 0.803],
    };
    check(rect, [0, 0], true);
    check(rect, rect.leftTop, true);
    check(rect, [-6.921, -9.573], false);
    check(rect, [-6.393, -9.691], false);
    check(rect, [-6.648, -9.553], true);
    check(rect, rect.rightTop, true);
    check(rect, [12.342, 0.026], true);
    check(rect, [12.340, -0.023], false);
    check(rect, [12.365, 0.057], false);
    check(rect, rect.rightBottom, true);
    check(rect, [6.993, 10.447], true);
    check(rect, [6.847, 10.554], false);
    check(rect, [7.175, 10.406], false);
    check(rect, rect.leftBottom, true);
    check(rect, [-12.008, 0.792], true);
    check(rect, [-12.041, 0.406], false);
    check(rect, [-11.886, 1.043], false);
    check(rect, [-5.597, -11.834], false);
  });

  describe('RectContains.circle', () => {

    const rectAxisParallel: IRectPoints = {
      leftTop: [-20, -20],
      rightTop: [20, -20],
      rightBottom: [20, 10],
      leftBottom: [-20, 10],
    };

    const rectRotated: IRectPoints = {
      leftTop: [-25.170, -5.455],
      rightTop: [6.859, -29.417],
      rightBottom: [24.830, -5.395],
      leftBottom: [-7.199, 18.567],
    };

    test('circle', () => {
      const check = (rect: IRectPoints, center: IPoint, radius: number, expected: boolean) => {
        expect(expected).eq(RectContains.circle(rect, center, radius));
      };
      check(rectAxisParallel, [-10, -10], 10, true);
      check(rectAxisParallel, [-10, -10], 10.001, false);
      check(rectAxisParallel, [-5, -5], 10, true);
      check(rectAxisParallel, [-30.911, -8.085], 10, false);
      check(rectAxisParallel, [-23.252, 12.851], 10, false);
      check(rectAxisParallel, [29.738, 4.101], 10, false);
      check(rectAxisParallel, [21.137, -30.214], 10, false);
      check(rectAxisParallel, [9.492, -0.841], 10, true);

      check(rectRotated, [-11.172, -3.438], 10, true);
      check(rectRotated, [-11.172, -3.438], 10.001, false);
      check(rectRotated, [0, 0], 10, true);
      check(rectRotated, [-32.400, 2.987], 10, false);
      check(rectRotated, [3.161, -32.948], 10, false);
      check(rectRotated, [-17.394, -29.745], 10, false);
      check(rectRotated, [31.454, -7.091], 10, false);
      check(rectRotated, [26.061, -20.761], 10, false);
      check(rectRotated, [14.728, 14.548], 10, false);
      check(rectRotated, [2.302, 24.235], 10, false);
      check(rectRotated, [-21.536, 16.189], 10, false);
    });

  });

  describe('RectContains.rect', () => {

    const outer: IRectPoints = {
      leftTop: [-20, -20],
      rightTop: [20, -20],
      rightBottom: [20, 10],
      leftBottom: [-20, 10],
    };

    const inner: IRectPoints = {
      leftTop: [-1, -1],
      rightTop: [1, -1],
      rightBottom: [1, 1],
      leftBottom: [-1, 1],
    }

    // Трансформированный внутренний
    let innerTemp: IRectPoints
    // Трансформированный внешний
    let outerTemp: IRectPoints

    function transformRectPoints(rect: IRectPoints, m: IMatrix) {
      const points = Rect.applyTransform(rect, m)
      return {
        leftTop: points[0],
        rightTop: points[1],
        rightBottom: points[2],
        leftBottom: points[3],
      }
    }

    const shouldContainsInnerTransform: IMatrix[] = [
      identityMatrix,  // Без трансформа, внутренний во внешнем
      Matrix.rotateIdentity(90),   // Поворот на 90 градусов
      Operator.rotateAtPoint(inner.leftTop, 90),   // Поворот на 90 градусов от левого верхнего угла внутреннего прямоугольника
      Matrix.translateIdentity(...Point.sub(outer.leftTop, inner.leftTop) as Tuple2),   // совмещение левых верхних углов
      Matrix.multiply(
        Operator.rotateAtPoint([outer.leftTop[0] + 1, outer.leftTop[1] + 1], 180),      // 2. поворот относительно нижнего правого угла внутреннего прямоугольника
        Matrix.translateIdentity(...outer.leftTop as Tuple2),                                   // 1. смещение центра внутреннего на левый верхний угол внешнего
      )
    ]

    const shouldNotContainsInnerTransform: IMatrix[] = [
      Matrix.translateIdentity(...outer.leftTop as Tuple2),
      Matrix.translateIdentity(...outer.rightTop as Tuple2),
      Matrix.translateIdentity(...outer.leftBottom as Tuple2),
      Matrix.translateIdentity(...outer.rightBottom as Tuple2),
      Matrix.multiply(
        Operator.rotateAtPoint(outer.leftTop, 0.0001),      // 2. поворот относительно левого верхнего угла на сколько угодно малый угол
        Matrix.translateIdentity(...Point.sub(outer.leftTop, inner.leftTop) as Tuple2),   //1. совмещение левых верхних углов
      ),
      Matrix.multiply(
        Operator.rotateAtPoint([outer.leftTop[0] + 1, outer.leftTop[1] + 1], 0.0001),      // 2. поворот относительно центра внутреннего на сколько угодно малый угол
        Matrix.translateIdentity(...Point.sub(outer.leftTop, inner.leftTop) as Tuple2),   //1. совмещение левых верхних углов
      )
    ]

    const shouldContainsOuterTransform: IMatrix[] = [
      identityMatrix,
      Matrix.rotateIdentity(90),   // Поворот на 90 градусов
      Matrix.translateIdentity(1, 1),       // Внешний уехал на 1 в обоих направлениях
      Matrix.translateIdentity(...Point.sub(inner.leftTop, outer.leftTop) as Tuple2),   // совмещение левых верхних углов
    ]

    const shouldNotContainsOuterTransform: IMatrix[] = [
      Operator.rotateAtPoint(outer.leftTop, 90),   // Поворот на 90 градусов от левого верхнего угла внешнего прямоугольника
      Matrix.translateIdentity(-100, -100),       // Внешний уехал за пределы внутреннего
      Matrix.multiply(
        Operator.rotateAtPoint(outer.leftTop, 0.001),      // 2. поворот относительно нижнего правого угла внутреннего прямоугольника на сколь угодно малый угол
        Matrix.translateIdentity(...Point.sub(inner.leftTop, outer.leftTop) as Tuple2),          // 1. совмещение левых верхних углов
      ),
      Matrix.multiply(
        Operator.rotateAtPoint([0, 0], 0.001),                                           // 2. поворот относительно 0,0 на сколь угодно малый угол
        Matrix.translateIdentity(...Point.sub(inner.leftTop, outer.leftTop) as Tuple2),          // 1. совмещение левых верхних углов
      )
    ]

    test('rect', () => {
      outerTemp = outer
      for (let m of shouldContainsInnerTransform) {
        innerTemp = transformRectPoints(inner, m)
        expect(RectContains.rect(outerTemp, innerTemp)).eq(true)
      }

      for (let m of shouldNotContainsInnerTransform) {
        innerTemp = transformRectPoints(inner, m)
        expect(RectContains.rect(outerTemp, innerTemp)).eq(false)
      }

      innerTemp = inner
      for (let m of shouldContainsOuterTransform) {
        outerTemp = transformRectPoints(outer, m)
        expect(RectContains.rect(outerTemp, innerTemp)).eq(true)
      }

      for (let m of shouldNotContainsOuterTransform) {
        outerTemp = transformRectPoints(outer, m)
        expect(RectContains.rect(outerTemp, innerTemp)).eq(false)
      }
    });


  });
});

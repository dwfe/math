import {isSomethingANumber} from '@do-while-for-each/common';
import {noThrow, Throw} from '@do-while-for-each/test';
import {IPoint, IRectPoints, ISegmentsIntersection, IStraightLinesIntersection, Point, StraightLine} from '../../geometry';
import {toFixed} from '../../util';


describe('geometry. straight-line - init', () => {

  test('k === null', () => {
    const line = new StraightLine([1, 0], [1, 2]);
    expect(line.m).eq(null);
    expect(line.b).eq(0);
  });

  test('k, b exists', () => {
    {
      const line = new StraightLine([0, 0], [5, 5]);
      expect(line.m).eq(1);
      expect(line.b).eq(0);
    }
    {
      const line = new StraightLine([0, -3], [9, 6]);
      expect(line.m).eq(1);
      expect(line.b).eq(-3);
    }
  });

  test('y-intercept', () => {
    const line = new StraightLine([-2, -5], [9, 6]);
    expect(line.getY(0)).eq(line.b);
  });

  test('x-intercept', () => {
    const line = new StraightLine([3, 1], [-3, 7]);
    expect(line.getX(0)).eq(4);
  });

  test('параллельно оси y', () => {
    {
      const line = new StraightLine([2, 0], [2, 1]);
      expect(line.m).eq(null);
      expect(Math.abs(line.A)).not.eq(0);
      expect(Math.abs(line.B)).eq(0);
    }
    {
      const line = new StraightLine([0, 0], [0, 1]);
      expect(line.m).eq(null);
      expect(Math.abs(line.A)).not.eq(0);
      expect(Math.abs(line.B)).eq(0);
    }
  });

  test('параллельно оси x', () => {
    {
      const line = new StraightLine([-1, 2], [-10, 2]);
      expect(Math.abs(line.m as any)).eq(0);
      expect(Math.abs(line.A)).eq(0);
      expect(Math.abs(line.B)).not.eq(0);
    }
    {
      const line = new StraightLine([-1, 0], [-10, 0]);
      expect(Math.abs(line.m as any)).eq(0);
      expect(Math.abs(line.A)).eq(0);
      expect(Math.abs(line.B)).not.eq(0);
    }
  });

  test('getY', () => {
    {// параллельно оси y - Error
      const line = new StraightLine([2, 0], [2, 1]);
      Throw(() => line.getY(1), `StraightLine.getY - the abscissa can only be "2", but "1" is passed. Because this line is parallel to the y-axis.`);
    }
    {// параллельно оси y вар.1
      const line = new StraightLine([2, 0], [2, 1]);
      noThrow(() => expect(isSomethingANumber(line.getY(2))).True());
    }
    {// параллельно оси y вар.2
      const line = new StraightLine([0, 0], [0, 1]);
      noThrow(() => expect(isSomethingANumber(line.getY(0))).True());
    }
    {// параллельно оси x вар.1
      const line = new StraightLine([2, 1], [3, 1]);
      expect(line.getY(10)).eq(1);
      expect(line.getY(-100)).eq(1);
    }
    {// параллельно оси x вар.2
      const line = new StraightLine([2, 0], [3, 0]);
      expect(line.getY(10)).eq(0);
      expect(line.getY(-100)).eq(0);
    }
    {
      const line = new StraightLine([1, 1], [2, 2]);
      expect(line.getY(5)).eq(5);
    }
    {
      const line = new StraightLine([0, -3], [9, 6]);
      expect(line.getY(5)).eq(2);
    }
  });

  test('getX', () => {
    {// параллельно оси y вар.1
      const line = new StraightLine([2, 0], [2, 1]);
      expect(line.getX(-100)).eq(2);
      expect(line.getX(10)).eq(2);
    }
    {// параллельно оси y вар.1
      const line = new StraightLine([0, 0], [0, 1]);
      expect(line.getX(-100)).eq(0);
      expect(line.getX(10)).eq(0);
    }
    {// параллельно оси x - Error
      const line = new StraightLine([2, 1], [3, 1]);
      Throw(() => line.getX(-1), `StraightLine.getX - the ordinate can only be "1", but "-1" is passed. Because this line is parallel to the x-axis.`);
    }
    {// параллельно оси x вар.1
      const line = new StraightLine([2, 1], [3, 1]);
      noThrow(() => expect(isSomethingANumber(line.getX(1))).True());
    }
    {// параллельно оси x вар.2
      const line = new StraightLine([-2, 0], [3, 0]);
      noThrow(() => expect(isSomethingANumber(line.getX(0))).True());
    }
    {
      const line = new StraightLine([0, -3], [9, 6]);
      expect(line.getX(4)).eq(7);
    }
    {
      const line = new StraightLine([1, 1], [2, 2]);
      expect(line.getX(-1)).eq(-1);
    }
  });

  test('opt.maxDecimalsInPointCoords', () => {
    const {p1, p2} = new StraightLine([1.23456, -4.56789], [87, 3.45678], {maxDecimalsInPointCoords: 2});
    expect(Point.isEqual(p1, [1.23, -4.57])).True();
    expect(Point.isEqual(p2, [87, 3.46])).True();
  });

  test('opt.makeCrisp', () => {
    {
      const {p1, p2} = new StraightLine([1.23456, -2.73], [87, -2.73], {makeCrisp: true});
      expect(Point.isEqual(p1, [1.23456, -2.5])).True();
      expect(Point.isEqual(p2, [87, -2.5])).True();
    }
    {
      const {p1, p2} = new StraightLine([1.23456, -4.56789], [1.23456, 3.45678], {makeCrisp: true});
      expect(Point.isEqual(p1, [1.5, -4.56789])).True();
      expect(Point.isEqual(p2, [1.5, 3.45678])).True();
    }
  });

});

describe('geometry. straight-line - intersectsLine', () => {

  // @ts-ignore
  function check(res: IStraightLinesIntersection, isSameLine, dontIntersect, intersectionPoint) {
    expect(isSameLine).eq(res.isSameLine);
    expect(dontIntersect).eq(res.dontIntersect);
    if (Array.isArray(res.intersectionPoint)) {
      expect(Point.isEqual(intersectionPoint, res.intersectionPoint)).True();
    } else {
      expect(undefined).eq(res.intersectionPoint);
    }
  }

  test('линии параллельны. И сопадают', () => {
    {
      const line1 = new StraightLine([1, 1], [2, 2]);
      const line2 = new StraightLine([1, 1], [2, 2]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([1, 1], [2, 2]);
      const line2 = new StraightLine([2, 2], [1, 1]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([1, 1], [2, 2]);
      const line2 = new StraightLine([-2, -2], [10, 10]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([0, 1], [0, 2]);
      const line2 = new StraightLine([0, -2], [0, 10]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([10, 1], [10, 2]);
      const line2 = new StraightLine([10, -2], [10, 10]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([1, 0], [2, 0]);
      const line2 = new StraightLine([-2, 0], [10, 0]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([1, -1], [2, -1]);
      const line2 = new StraightLine([-2, -1], [10, -1]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
  });

  test('линии параллельны. И не совпадают, т.к. разнесены по оси y', () => {
    {
      const line1 = new StraightLine([1, 1], [2, 2]);
      const line2 = new StraightLine([0, -3], [9, 6]);
      check(line1.intersectsLine(line2), undefined, true, undefined);
    }
    {
      const line1 = new StraightLine([1, 1], [2, 1]);
      const line2 = new StraightLine([1, -1], [2, -1]);
      check(line1.intersectsLine(line2), undefined, true, undefined);
    }
  });

  test('линии параллельны оси Y. И сопадают', () => {
    {
      const line1 = new StraightLine([6, 1], [6, 2]);
      const line2 = new StraightLine([6, -3], [6, 6]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
    {
      const line1 = new StraightLine([0, 1], [0, -2]);
      const line2 = new StraightLine([0, 6], [0, 3]);
      check(line1.intersectsLine(line2), true, undefined, undefined);
    }
  });

  test('линии параллельны оси Y. И не сопадают, т.к. разнесены по оси x', () => {
    {
      const line1 = new StraightLine([6, 1], [6, 2]);
      const line2 = new StraightLine([0, -3], [0, 6]);
      check(line1.intersectsLine(line2), undefined, true, undefined);
    }
    {
      const line1 = new StraightLine([0, 1], [0, -2]);
      const line2 = new StraightLine([1, 6], [1, 3]);
      check(line1.intersectsLine(line2), undefined, true, undefined);
    }
  });

  test('только линия1 параллельна оси Y', () => {
    {
      const line1 = new StraightLine([4, -1], [4, 2]);
      const line2 = new StraightLine([0, -3], [9, 6]);
      check(line1.intersectsLine(line2), undefined, undefined, [4, 1]);
    }
    {
      const line1 = new StraightLine([4, -1], [4, 2]);
      const line2 = new StraightLine([0, 10], [1, 10]);
      check(line1.intersectsLine(line2), undefined, undefined, [4, 10]);
    }
  });

  test('только линия2 параллельна оси Y', () => {
    {
      const line1 = new StraightLine([0, -3], [9, 6]);
      const line2 = new StraightLine([4, -1], [4, 2]);
      check(line1.intersectsLine(line2), undefined, undefined, [4, 1]);
    }
    {
      const line1 = new StraightLine([0, 10], [1, 10]);
      const line2 = new StraightLine([4, -1], [4, 2]);
      check(line1.intersectsLine(line2), undefined, undefined, [4, 10]);
    }
  });

  test('только одна линия параллельна оси X (на всякий случай)', () => {
    const line1 = new StraightLine([0, -3], [9, 6]);
    const line2 = new StraightLine([0, 4], [5, 4]);
    check(line1.intersectsLine(line2), undefined, undefined, [7, 4]);
  });

  test('есть пересечение', () => {
    { // 1 сектор
      const line1 = new StraightLine([-1, 3], [25, 6]);
      const line2 = new StraightLine([0, -3], [9, 6]);

      const res = line1.intersectsLine(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 5))

      check(res, undefined, undefined, [6.91304, 3.91304]);
    }
    { // 2 сектор
      const line1 = new StraightLine([0, 2], [-8, 0]);
      const line2 = new StraightLine([-4, 5], [-2, 0]);

      const res = line1.intersectsLine(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 5))

      check(res, undefined, undefined, [-2.54545, 1.36364]);
    }
    { // 3 сектор
      const line1 = new StraightLine([-8, 0], [0, -2]);
      const line2 = new StraightLine([-3, -3], [0, -1]);

      const res = line1.intersectsLine(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 5))

      check(res, undefined, undefined, [-1.09091, -1.72727]);
    }
    { // 4 сектор
      const line1 = new StraightLine([1, -4], [2, -1]);
      const line2 = new StraightLine([1, -3], [3, -2]);

      const res = line1.intersectsLine(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 5))

      check(res, undefined, undefined, [1.4, -2.8]);
    }
    { // https://en.wikipedia.org/wiki/Intersection_(geometry)#Two_line_segments
      const line1 = new StraightLine([1, 1], [3, 2]);
      const line2 = new StraightLine([1, 4], [2, -1]);
      check(line1.intersectsLine(line2), undefined, undefined, [17 / 11, 14 / 11]);
    }
  });

});

describe('geometry. straight-line - intersectsCircle', () => {

  describe('линия параллельна оси y', () => {

    test('нет пересечений', () => {
      { // линия слева вар.1
        const line = new StraightLine([2, 0], [2, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
      { // линия слева вар.2
        const line = new StraightLine([2.4, 0], [2.4, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
      { // линия справа вар.1
        const line = new StraightLine([10, 0], [10, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
      { // линия справа вар.2
        const line = new StraightLine([7.51, 0], [7.51, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      { // линия слева вар.1
        const line = new StraightLine([2.5, 0], [2.5, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [2.5, 4])).True();
      }
      { // линия справа вар.1
        const line = new StraightLine([7.5, 0], [7.5, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [7.5, 4])).True();
      }
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([3.5, 0], [3.5, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [3.5, 6])).True();
        expect(Point.isEqual(point2, [3.5, 2])).True();
      }
      {
        const line = new StraightLine([5, 0], [5, 1]);
        const res = line.intersectsCircle([5, 4], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [5, 6.5])).True();
        expect(Point.isEqual(point2, [5, 1.5])).True();
      }
    });

  });

  describe('линия параллельна оси x', () => {

    test('нет пересечений', () => {
      { // линия сверху вар.1
        const line = new StraightLine([0, -1], [1, -1]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
      { // линия сверху вар.2
        const line = new StraightLine([0, -2.499], [1, -2.499]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
      { // линия снизу вар.1
        const line = new StraightLine([0, -9], [1, -9]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
      { // линия снизу вар.2
        const line = new StraightLine([0, -7.501], [1, -7.501]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      { // линия сверху
        const line = new StraightLine([0, -2.5], [1, -2.5]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [0, -2.5])).True();
      }
      { // линия снизу
        const line = new StraightLine([0, -7.5], [1, -7.5]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [0, -7.5])).True();
      }
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([0, -6.5], [1, -6.5]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [2, -6.5])).True();
        expect(Point.isEqual(point2, [-2, -6.5])).True();
      }
      {
        const line = new StraightLine([0, -5], [1, -5]);
        const res = line.intersectsCircle([0, -5], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [2.5, -5])).True();
        expect(Point.isEqual(point2, [-2.5, -5])).True();
      }
    });

  });

  describe('просто обычная линия', () => {

    test('нет пересечений', () => {
      {
        const line = new StraightLine([7, 5], [-2, -4]);
        const res = line.intersectsCircle([2, -4], 2.5);
        expect(res.length).eq(0);
      }
      {
        const line = new StraightLine([0, 6], [9, 0]);
        const res = line.intersectsCircle([-2.5, 4.662], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      const line = new StraightLine([-5, 0], [0, Math.sqrt(13 * 13 - 25)]);
      const res = line.intersectsCircle([0, 10 / 3], 10 / 3);
      expect(res.length).eq(1);
      const point = res[0].map(n => toFixed(n, 7));
      expect(Point.isEqual(point, [-3.0769231, 4.6153846])).True();
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([0, 0], [1, 2]);
        const res = line.intersectsCircle([1, 2], 2);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [(5 + 2 * Math.sqrt(5)) / 5, (10 + 4 * Math.sqrt(5)) / 5])).True();
        expect(Point.isEqual(point2, [(5 - 2 * Math.sqrt(5)) / 5, (10 - 4 * Math.sqrt(5)) / 5])).True();
      }
      {
        const line = new StraightLine([0, 14], [1, 19]);
        const res = line.intersectsCircle([-5, 2], 13);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [0, 14])).True();
        expect(Point.isEqual(point2, [-5, -11])).True();
      }
    });

  });

});

describe('geometry. straight-line - segmentIntersectsSegment', () => {

  // @ts-ignore
  function check(res: ISegmentsIntersection, onSameLineAndIntersect, dontIntersect, intersectionPoint) {
    expect(onSameLineAndIntersect).eq(res.onSameLineAndIntersect);
    expect(dontIntersect).eq(res.dontIntersect);
    if (Array.isArray(res.intersectionPoint)) {
      expect(Point.isEqual(intersectionPoint, res.intersectionPoint)).True();
    } else {
      expect(undefined).eq(res.intersectionPoint);
    }
  }

  test('не пересекаются', () => {
    {
      const line1 = new StraightLine([9, 0], [-2, 9]);
      const line2 = new StraightLine([-2, 1], [4, 3]);
      check(line1.segmentIntersectsSegment(line2), undefined, true, undefined);
    }
    {
      const line1 = new StraightLine([9, 0], [-2, 9]);
      const line2 = new StraightLine([-2, 1], [5.33, 3]);
      check(line1.segmentIntersectsSegment(line2), undefined, true, undefined);
    }
  });

  test('пересекаются', () => {
    {
      const line1 = new StraightLine([9, 0], [-2, 9]);
      const line2 = new StraightLine([-2, 1], [5.333334, 3]);
      const res = line1.segmentIntersectsSegment(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 8));
      check(res, undefined, undefined, [5.3333335, 2.99999986]);
    }
    {
      const line1 = new StraightLine([9, 0], [0, 1]);
      const line2 = new StraightLine([0, 0], [5, 5]);
      const res = line1.segmentIntersectsSegment(line2);
      res.intersectionPoint = res.intersectionPoint!.map(n => toFixed(n, 8));
      check(res, undefined, undefined, [0.9, 0.9]);
    }
  });

  test('лежат на одной прямой', () => {
    { // нет общих точек
      const line1 = new StraightLine([1, 1], [5, 5]);
      const line2 = new StraightLine([5.000000000001, 5.000000000001], [10, 10]);
      check(line1.segmentIntersectsSegment(line2), undefined, true, undefined);
    }
    { // нет общих точек
      const line1 = new StraightLine([1, 1], [5, 5]);
      const line2 = new StraightLine([0, 0], [0.999999999999, 0.999999999999]);
      check(line1.segmentIntersectsSegment(line2), undefined, true, undefined);
    }
    { // есть общие точки
      const line1 = new StraightLine([1, 1], [5, 5]);
      const line2 = new StraightLine([0, 0], [1, 1]);
      check(line1.segmentIntersectsSegment(line2), true, undefined, undefined);
    }
    { // есть общие точки
      const line1 = new StraightLine([1, 1], [5, 5]);
      const line2 = new StraightLine([3, 3], [10, 10]);
      check(line1.segmentIntersectsSegment(line2), true, undefined, undefined);
    }
    { // есть общие точки
      const line1 = new StraightLine([1, 1], [5, 5]);
      const line2 = new StraightLine([5, 5], [10, 10]);
      check(line1.segmentIntersectsSegment(line2), true, undefined, undefined);
    }
  });

});

describe('geometry. straight-line - segmentIntersectsCircle', () => {

  describe('линия параллельна оси y', () => {

    test('нет пересечений', () => {
      {
        const line = new StraightLine([2.5, 0], [2.5, 1]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
      {
        const line = new StraightLine([2.5, 0], [2.5, 3.999999999999]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      {
        const line = new StraightLine([2.5, 0], [2.5, 4]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [2.5, 4])).True();
      }
      { // линия справа вар.1
        const line = new StraightLine([7.5, 0], [7.5, 7]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [7.5, 4])).True();
      }
      {
        const line = new StraightLine([3.5, 3], [3.5, 10]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [3.5, 6])).True();
      }
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([5, 0], [5, 10]);
        const res = line.segmentIntersectsCircle([5, 4], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [5, 6.5])).True();
        expect(Point.isEqual(point2, [5, 1.5])).True();
      }
    });

  });

  describe('линия параллельна оси x', () => {

    test('нет пересечений', () => {
      {
        const line = new StraightLine([0, -2.499], [1, -2.499]);
        const res = line.segmentIntersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
      {
        const line = new StraightLine([0.0000000001, -2.5], [1, -2.5]);
        const res = line.segmentIntersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
      {
        const line = new StraightLine([0, -6.5], [1, -6.5]);
        const res = line.segmentIntersectsCircle([0, -5], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      {
        const line = new StraightLine([0, -2.5], [1, -2.5]);
        const res = line.segmentIntersectsCircle([0, -5], 2.5);
        expect(res.length).eq(1);
        expect(Point.isEqual(res[0], [0, -2.5])).True();
      }
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([-10, -6.5], [10, -6.5]);
        const res = line.segmentIntersectsCircle([0, -5], 2.5);
        expect(res.length).eq(2);
        const [point1, point2] = res;
        expect(Point.isEqual(point1, [2, -6.5])).True();
        expect(Point.isEqual(point2, [-2, -6.5])).True();
      }
    });

  });

  describe('просто обычная линия', () => {

    test('нет пересечений', () => {
      {
        const line = new StraightLine([7, 5], [-2, -4]);
        const res = line.segmentIntersectsCircle([2, -4], 2.5);
        expect(res.length).eq(0);
      }
    });

    test('одно пересечение', () => {
      const line = new StraightLine([-5, 0], [0, Math.sqrt(13 * 13 - 25)]);
      const res = line.segmentIntersectsCircle([0, 10 / 3], 10 / 3);
      expect(res.length).eq(1);
      const point = res[0].map(n => toFixed(n, 7));
      expect(Point.isEqual(point, [-3.0769231, 4.6153846])).True();
    });

    test('два пересечения', () => {
      {
        const line = new StraightLine([7, 4], [-2, -5]);
        const res = line.segmentIntersectsCircle([2, -4], 2.5);
        expect(res.length).eq(2);
        let [point1, point2] = res;
        point1 = point1.map(n => toFixed(n, 7));
        point2 = point2.map(n => toFixed(n, 7));
        expect(Point.isEqual(point1, [1.4354143, -1.5645857])).True();
        expect(Point.isEqual(point2, [-0.4354143, -3.4354143])).True();
      }
    });

  });

});

describe('geometry. straight-line - PointBelongsToSegment', () => {

  test('линия параллельна оси y', () => {
    const line = new StraightLine([2.5, 0], [2.5, 1]);
    expect(line.pointBelongsToSegment([2.5, -10])).False();
    expect(line.pointBelongsToSegment([2.5, -0.000000000001])).False();
    expect(line.pointBelongsToSegment([2.5, 0.000000000001])).True();
    expect(line.pointBelongsToSegment([2.5, 0.4])).True();
    expect(line.pointBelongsToSegment([2.5, 0.999999999999])).True();
    expect(line.pointBelongsToSegment([2.5, 1.000000000001])).False();
    expect(line.pointBelongsToSegment([2.5, 4])).False();
  });

  test('линия параллельна оси x', () => {
    const line = new StraightLine([0, 1], [1, 1]);
    expect(line.pointBelongsToSegment([-10, 1])).False();
    expect(line.pointBelongsToSegment([-0.000000000000001, 1])).False();
    expect(line.pointBelongsToSegment([0.000000000000001, 1])).True();
    expect(line.pointBelongsToSegment([0.3, 1])).True();
    expect(line.pointBelongsToSegment([0.999999999999999, 1])).True();
    expect(line.pointBelongsToSegment([1.000000000000001, 1])).False();
    expect(line.pointBelongsToSegment([100, 1])).False();
  });

  test('обычная линия', () => {
    const line = new StraightLine([0, 6], [9, 0]);
    { // перед отрезком
      const x = -0.000000000000001;
      const point = [x, line.getY(x)];
      expect(line.pointBelongsToSegment(point)).False();
    }
    { // на отрезке
      const x = 3.3152345123462346;
      const point = [x, line.getY(x)];
      expect(line.pointBelongsToSegment(point)).True();
    }
    { // на отрезке
      const x = 7.893469523052983;
      const point = [x, line.getY(x)];
      expect(line.pointBelongsToSegment(point)).True();
    }
    { // после отрезка
      const x = 9.000000000000001;
      const point = [x, line.getY(x)];
      expect(line.pointBelongsToSegment(point)).False();
    }
  });

  test('не передана точка', () => {
    const line = new StraightLine([0, 6], [9, 0]);
    expect(line.pointBelongsToSegment()).False();
  });

  test('концы сегмента по совпадающей линии', () => {
    { // обычная линия 1
      const line = new StraightLine([1, 1], [5, 5]);
      expect(line.pointBelongsToSegment([0.99999999999, 0.99999999999])).False()
      expect(line.pointBelongsToSegment([1, 1])).True()
      expect(line.pointBelongsToSegment([1.00000000001, 1.00000000001])).True()
      expect(line.pointBelongsToSegment([4.99999999999, 4.99999999999])).True()
      expect(line.pointBelongsToSegment([5, 5])).True()
      expect(line.pointBelongsToSegment([5.00000000001, 5.00000000001])).False()
    }
    { // обычная линия 2
      const line = new StraightLine([-4, 1], [-8, 4]);
      expect(line.pointBelongsToSegment([-3.99999999999, line.getY(-3.99999999999)])).False()
      expect(line.pointBelongsToSegment([-4, 1])).True()
      expect(line.pointBelongsToSegment([-4.00000000001, line.getY(-4.00000000001)])).True()
      expect(line.pointBelongsToSegment([-7.99999999999, line.getY(-7.99999999999)])).True()
      expect(line.pointBelongsToSegment([-8, 4])).True()
      expect(line.pointBelongsToSegment([-8.00000000001, line.getY(-8.00000000001)])).False()
    }
    { // линия параллельна оси y
      const line = new StraightLine([1, 0], [1, 1]);
      expect(line.pointBelongsToSegment([1, -0.00000000001])).False()
      expect(line.pointBelongsToSegment([1, 0])).True()
      expect(line.pointBelongsToSegment([1, 1])).True()
      expect(line.pointBelongsToSegment([1, 1.00000000001])).False()
    }
    { // линия параллельна оси x
      const line = new StraightLine([0, 1], [1, 1]);
      expect(line.pointBelongsToSegment([-0.00000000001, 1])).False()
      expect(line.pointBelongsToSegment([0, 1])).True()
      expect(line.pointBelongsToSegment([1, 1])).True()
      expect(line.pointBelongsToSegment([1.00000000001, 1])).False()
    }
  });


  describe('normal', () => {

    // данные для проверки параметров нормали: точки и длины
    const getDataV1 = () => { // окружность внутри прямоугольника(повернут)
      const r: IRectPoints = {
        leftTop: [-47.558, 54.032],
        rightTop: [101.454, -0.356],
        rightBottom: [135.741, 93.582],
        leftBottom: [-13.272, 147.971],
      };
      const p = [24.093, 82.835]; // из этой точки проводится нормаль к линии
      const topNormalPoint = [6.393, 34.340];
      const rightNormalPoint = [119.154, 48.138];
      const bottomNormalPoint = [40.680, 128.279];
      const leftNormalPoint = [-29.858, 102.526];
      return {r, p, topNormalPoint, rightNormalPoint, bottomNormalPoint, leftNormalPoint};
    };

    const getDataV2 = () => { // окружность не вся внутри прямоугольника(повернут)
      const r: IRectPoints = {
        leftTop: [-59.599, 5.791],
        rightTop: [-44.466, -39.147],
        rightBottom: [14.011, -19.455],
        leftBottom: [-1.121, 25.483],
      };
      const p = [-8.631, -10.073];
      const topNormalPoint = [-49.609, -23.873];
      const rightNormalPoint = [-3.488, -25.348];
      const bottomNormalPoint = [8.868, -4.181];
      const leftNormalPoint = [-18.620, 19.590];
      return {r, p, topNormalPoint, rightNormalPoint, bottomNormalPoint, leftNormalPoint};
    };

    const getDataV3 = () => { // окружность внутри прямоугольника(стороны параллельны осям)
      const r: IRectPoints = {
        leftTop: [-10, -10],
        rightTop: [10, -10],
        rightBottom: [10, 30],
        leftBottom: [-10, 30],
      };
      const p = [3, 13];
      const topNormalPoint = [3, -10];
      const rightNormalPoint = [10, 13];
      const bottomNormalPoint = [3, 30];
      const leftNormalPoint = [-10, 13];
      return {r, p, topNormalPoint, rightNormalPoint, bottomNormalPoint, leftNormalPoint};
    };

    // const getDataV3 = () => {
    //   const r: IRectPoints = {
    //     leftTop: [],
    //     rightTop: [],
    //     rightBottom: [],
    //     leftBottom: [],
    //   };
    //   const p = [];
    //   const topNormalPoint = [];
    //   const rightNormalPoint = [];
    //   const bottomNormalPoint = [];
    //   const leftNormalPoint = [];
    //   return {r, p, topNormalPoint, rightNormalPoint, bottomNormalPoint, leftNormalPoint};
    // };


    test('normal params', () => {
      // Проверяются результат работы двух функций normalPoint и normalLength
      // Причем еще проверяется результат между ними.
      // Изначальные данные округлены до 3х знаков.
      // Поэтому приходится играться с количеством знаков после запятой во время проверки.
      let decimalsNormalPoint = 10;
      let decimalsNormalLength = 10;

      // проверка точки нормали
      const checkNormalPoint = (a: IPoint, b: IPoint, p: IPoint, expectedNormalPoint: IPoint) => {
        const line = new StraightLine(a, b);
        const {normalPoint} = line.normalPointData(p);

        normalPoint[0] = toFixed(normalPoint[0], decimalsNormalPoint);
        normalPoint[1] = toFixed(normalPoint[1], decimalsNormalPoint);
        expectedNormalPoint[0] = toFixed(expectedNormalPoint[0], decimalsNormalPoint);
        expectedNormalPoint[1] = toFixed(expectedNormalPoint[1], decimalsNormalPoint);
        expect(Point.isEqual(normalPoint, expectedNormalPoint)).True();
      };

      // проверка длины отрезка нормали
      const checkNormalLength = (a: IPoint, b: IPoint, p: IPoint, expectedLen: number) => {
        const line = new StraightLine(a, b);
        let len = line.normalLength(p);
        len = toFixed(len, decimalsNormalLength);
        expectedLen = toFixed(expectedLen, decimalsNormalLength);
        expect(expectedLen).eq(len);
      };

      // Берем прямоугольник и проверяем параметры нормали ко всем четырем сторонам
      const check = ({r, p, topNormalPoint, rightNormalPoint, bottomNormalPoint, leftNormalPoint}: {
        r: IRectPoints, // прямоугольник, нам от него нужны точки сторон
        p: IPoint, // точка, из которой опускается нормаль к стороне прямоугольника -> к линии
        // точки номалей, для проверки
        topNormalPoint: IPoint, rightNormalPoint: IPoint, bottomNormalPoint: IPoint, leftNormalPoint: IPoint
      }) => {
        checkNormalPoint(r.leftTop, r.rightTop, p, topNormalPoint);
        checkNormalLength(r.leftTop, r.rightTop, p, Point.distance(p, topNormalPoint));

        checkNormalPoint(r.rightTop, r.rightBottom, p, rightNormalPoint);
        checkNormalLength(r.rightTop, r.rightBottom, p, Point.distance(p, rightNormalPoint));

        checkNormalPoint(r.rightBottom, r.leftBottom, p, bottomNormalPoint);
        checkNormalLength(r.rightBottom, r.leftBottom, p, Point.distance(p, bottomNormalPoint));

        checkNormalPoint(r.leftBottom, r.leftTop, p, leftNormalPoint);
        checkNormalLength(r.leftBottom, r.leftTop, p, Point.distance(p, leftNormalPoint));
      };

      decimalsNormalPoint = 3;
      decimalsNormalLength = 2;
      check(getDataV1());

      decimalsNormalPoint = 2;
      decimalsNormalLength = 1;
      check(getDataV2());

      decimalsNormalPoint = 15;
      decimalsNormalLength = 15;
      check(getDataV3());
    });

    test('normalPoint, граничные значения', () => {
      const check = (a: IPoint, b: IPoint, p: IPoint, expectedNormalPoint: IPoint) => {
        const line = new StraightLine(a, b);
        const {normalPoint} = line.normalPointData(p);
        expect(Point.isEqual(normalPoint, expectedNormalPoint))
      };
      check([0, 0], [0, 0], [0, 10], [0, 0]);
      check([0, 0], [0, 0], [0, 0], [0, 0]);
      check([-1, 20], [-1, 20], [2, 7], [-1, 20]);
    });

    test('normalLength, граничные значения', () => {
      const check = (a: IPoint, b: IPoint, p: IPoint, expectedNormalLength: number) => {
        const line = new StraightLine(a, b);
        const normalLen = line.normalLength(p);
        expect(normalLen).eq(expectedNormalLength);
      };
      check([0, 0], [0, 0], [0, 10], 10);
      check([-28.742, 10.744], [-28.742, 10.744], [10, 10], 38.74914321633448);
    });

    test('normalPoint, принадлежность сегменту', () => {
      const check = (a: IPoint, b: IPoint, p: IPoint, expectedIsOnSegment: boolean) => {
        const line = new StraightLine(a, b);
        const {isOnSegment} = line.normalPointData(p);
        expect(expectedIsOnSegment).eq(isOnSegment);
      };

      check([-28.742, 10.744], [-18.511, -2.339], [-24.594, 15.811], false);
      check([-28.742, 10.744], [-18.511, -2.339], [-23.184, 14.555], true);
      check([-10, -10], [10, -10], [10, 10], true);
      check([-10, -10], [10, -10], [10.0000001, 10], false);
    });

    test('normal параметры, через коэффициенты прямой A,B,C', () => {
      const check = (a: IPoint, b: IPoint, p: IPoint) => {
        const line = new StraightLine(a, b);
        const {A, B, C} = line;
        const [x0, y0] = p;
        const len = Math.abs(A * x0 + B * y0 + C) / Math.sqrt(A ** 2 + B ** 2);
        let x = (B * (B * x0 - A * y0) - A * C) / (A ** 2 + B ** 2);
        let y = (A * (-B * x0 + A * y0) - B * C) / (A ** 2 + B ** 2);

        const decimals = 10;

        // проверю длины по алгоритму по коэффициентам и тому, что в StraightLine
        expect(toFixed(line.normalLength(p), decimals)).eq(toFixed(len, decimals));

        x = toFixed(x, decimals);
        y = toFixed(y, decimals);
        const {normalPoint} = line.normalPointData(p);
        normalPoint[0] = toFixed(normalPoint[0], decimals);
        normalPoint[1] = toFixed(normalPoint[1], decimals);
        // проверю длины по алгоритму по коэффициентам и тому, что в StraightLine
        expect(Point.isEqual([x, y], normalPoint)).True();
      };

      check([-28.742, 10.744], [-18.511, -2.339], [-24.594, 15.811]);
      check([-10, -10], [10, -10], [10, 10]);
      check([-10, -10], [10, -10], [10.00001, 10]);
    });

  });


});

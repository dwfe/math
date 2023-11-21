import {noThrow, Throw} from '@do-while-for-each/test'
import {IRect, Point, Rect} from '../../geometry'

describe('geometry. rect', () => {

  test('fromCenter', () => {
    const rect = Rect.fromCenter(1, 1, [0, 0]);
    expect(rect.left).eq(-0.5);
    expect(rect.top).eq(-0.5);
    expect(rect.right).eq(0.5);
    expect(rect.bottom).eq(0.5);
  });

  test('4 points', () => {
    const rect = Rect.fromCenter(2, 2, [0, 0]);
    expect(Point.isEqual(rect.leftTop, [-1, -1])).True();
    expect(Point.isEqual(rect.leftBottom, [-1, 1])).True();
    expect(Point.isEqual(rect.rightTop, [1, -1])).True();
    expect(Point.isEqual(rect.rightBottom, [1, 1])).True();
  });

  test('width, height, aspectRatio, center', () => {
    const rect = Rect.fromCenter(2, 5, [0.5, 0.5]);
    expect(Point.isEqual(rect.center, [0.5, 0.5])).True();
    expect(2 / 5).eq(rect.aspectRatio);
    expect(Point.isEqual([0.5, 0.5], rect.center)).True();
  });

  test('height === 0', () => {
    noThrow(() => {
      const rect = Rect.fromOrigin(0, 0);
      expect(rect.aspectRatio).eq(0);
    });
    noThrow(() => {
      const rect = Rect.fromOrigin(1, 0);
      expect(rect.aspectRatio).eq(0);
    });

    noThrow(() => {
      const rect = Rect.fromCenter(0, 0);
      expect(rect.aspectRatio).eq(0);
    });
    noThrow(() => {
      const rect = Rect.fromCenter(1, 0);
      expect(rect.aspectRatio).eq(0);
    });
  });

  test('fromDOMRect', () => {
    const rect = Rect.fromDOMRect({
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,

      width: 200,
      height: 100,
    });
    expect(rect.left).eq(0);
    expect(rect.top).eq(0);
    expect(rect.right).eq(200);
    expect(rect.bottom).eq(100);
    expect(rect.width).eq(200);
    expect(rect.height).eq(100);
    expect(rect.aspectRatio).eq(2);
    expect(Point.isEqual(rect.center, [100, 50])).True();
  });

  test('isEqual', () => {
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 100), Rect.fromOrigin(100, 100))).True();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 200))).True();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 200, [70, 90]))).True();

    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 100, [70, 90]))).False();

    expect(Rect.isEqualByWidthHeight(undefined as any, Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), undefined as any)).False();
    expect(Rect.isEqualByWidthHeight(undefined as any, null as any)).False();
  });

  test('toPoints', () => {
    const rect = Rect.fromOrigin(1, 1);
    const arr = rect.points;
    expect(arr.length).eq(4);
    const [leftTop, rightTop, rightBottom, leftBottom] = arr; // порядок точек важен
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
  });

  test('toPointsObj', () => {
    const rect = Rect.fromOrigin(1, 1);
    expect(Object.keys(rect).length).eq(14);
    const {leftTop, rightTop, rightBottom, leftBottom} = rect;
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
  });

  test('toPolygon', () => {
    const rect = Rect.fromOrigin(1, 1);
    const arr = rect.polygon;
    expect(arr.length).eq(5);
    const [leftTop, rightTop, rightBottom, leftBottom, leftTopClosing] = arr; // порядок точек важен
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
    expect(Point.isEqual(leftTopClosing, leftTop)).True();
  });

  test('fromMiddleOfSide', () => {
    const check = ({
                     left, top, right, bottom,
                     leftTop, rightTop, rightBottom, leftBottom,
                     width, height, aspectRatio, center
                   }: IRect) => {
      expect(left).eq(3);
      expect(top).eq(2);
      expect(right).eq(12);
      expect(bottom).eq(9);
      expect(Point.isEqual(leftTop, [left, top])).True();
      expect(Point.isEqual(rightTop, [right, top])).True();
      expect(Point.isEqual(rightBottom, [right, bottom])).True();
      expect(Point.isEqual(leftBottom, [left, bottom])).True();
      expect(width).eq(9);
      expect(height).eq(7);
      expect(aspectRatio).eq(9 / 7);
      expect(Point.isEqual(center, [7.5, 5.5]));
    };
    check(Rect.fromMiddleOfSide(9, 7, [7.5, 2], 'top'));
    check(Rect.fromMiddleOfSide(9, 7, [3, 5.5], 'left'));
    check(Rect.fromMiddleOfSide(9, 7, [12, 5.5], 'right'));
    check(Rect.fromMiddleOfSide(9, 7, [7.5, 9], 'bottom'));
    // @ts-ignore
    Throw(() => Rect.fromMiddleOfSide(9, 7, [7.5, 2], '123'), `unknown side position "123", acceptable values: "top", "left", "right", "bottom"`);
  });

  test('fromCornerPoint', () => {
    const check = ({
                     left, top, right, bottom,
                     leftTop, rightTop, rightBottom, leftBottom,
                     width, height, aspectRatio, center
                   }: IRect) => {
      expect(left).eq(3);
      expect(top).eq(2);
      expect(right).eq(12);
      expect(bottom).eq(9);
      expect(Point.isEqual(leftTop, [left, top])).True();
      expect(Point.isEqual(rightTop, [right, top])).True();
      expect(Point.isEqual(rightBottom, [right, bottom])).True();
      expect(Point.isEqual(leftBottom, [left, bottom])).True();
      expect(width).eq(9);
      expect(height).eq(7);
      expect(aspectRatio).eq(9 / 7);
      expect(Point.isEqual(center, [7.5, 5.5]));
    };
    check(Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop'));
    check(Rect.fromCornerPoint(9, 7, [12, 2], 'rightTop'));
    check(Rect.fromCornerPoint(9, 7, [3, 9], 'leftBottom'));
    check(Rect.fromCornerPoint(9, 7, [12, 9], 'rightBottom'));
    // @ts-ignore
    Throw(() => Rect.fromCornerPoint(9, 7, [7.5, 2], '123'), `unknown point position "123", acceptable values: "leftTop", "rightTop", "leftBottom", "rightBottom"`);
  });

  test('intersectsRect', () => {
    { // сам с собой
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      expect(Rect.intersectsRect(a, a)).True();
      expect(Rect.intersectsRect(a, a, true)).True();
    }
    { // по границе лево/право
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12, 2], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
    { // по границе лево/право, не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12.0001, 2], 'leftTop');
      expect(Rect.intersectsRect(a, b)).False();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
    { // по границе лево/право, сдвинуто по вертикали
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12, 3], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [11, 3], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).True();
    }
    { // по границе верх/низ
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -3], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
    { // по границе верх/низ, не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -3.0001], 'leftTop');
      expect(Rect.intersectsRect(a, b)).False();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -2], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).True();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [-4, 8], 'leftTop');
      expect(Rect.intersectsRect(a, b)).True();
      expect(Rect.intersectsRect(a, b, true)).True();
    }
    { // не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [-6, 9], 'leftTop');
      expect(Rect.intersectsRect(a, b)).False();
      expect(Rect.intersectsRect(a, b, true)).False();
    }
  });

});

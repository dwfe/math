import '@do-while-for-each/test'
import {applyPaddingToRect, getBoundingRect} from '../../algorithm';
import {IPoint, IRect, Point, Rect} from '../../geometry';
import {toFixed} from '../../util';

describe('boundingRect', () => {

  test('check.boundingRect', () => {
    const pointToFixed = (p: IPoint, decimals: number) => {
      p[0] = toFixed(p[0], decimals);
      p[1] = toFixed(p[1], decimals);
    };
    const points: IPoint[] = [
      // треугольник
      [-36.462, 0.342], [-33.023, -13.797], [-15.595, -4.579],
      //прямоугольник
      [-7.433, 18.801], [-25.404, -5.220], [6.624, -29.182], [24.596, -5.161],
      //пятиугольник
      [3.380, 11.484], [-12.386, -5.998], [-0.631, -26.395], [22.400, -21.518], [24.879, 1.892]
    ];

    let {
      left, top, right, bottom,
      leftTop, rightTop, rightBottom, leftBottom,
      width, height, aspectRatio,
      center,
    } = getBoundingRect(points, 0);
    pointToFixed(leftTop, 3);
    pointToFixed(rightTop, 3);
    pointToFixed(rightBottom, 3);
    pointToFixed(leftBottom, 3);
    pointToFixed(center, 3);


    expect(toFixed(left, 3)).eq(-36.462);
    expect(toFixed(top, 3)).eq(-29.182);
    expect(toFixed(right, 3)).eq(24.879);
    expect(toFixed(bottom, 3)).eq(18.801);
    expect(Point.isEqual(leftTop, [-36.462, -29.182])).True();
    expect(Point.isEqual(rightTop, [24.879, -29.182])).True();
    expect(Point.isEqual(rightBottom, [24.879, 18.801])).True();
    expect(Point.isEqual(leftBottom, [-36.462, 18.801])).True();
    expect(Point.isEqual(center, [-5.791, -5.19])).True();

    expect(toFixed(width, 3)).eq(61.341);
    expect(toFixed(height, 3)).eq(47.983);
    expect(width / height).eq(aspectRatio);
  });

  test('check.applyPaddingToRect', () => {

    const samePaddings = [2, {left: 2, right: 2, top: 2, bottom: 2}, {x: 2, y: 2}]

    let rect: IRect

    for (let padding of samePaddings) {
      rect = applyPaddingToRect(Rect.fromOrigin(10, 10), samePaddings[0]);

      expect(Point.isEqual(rect.leftTop, [-2, -2])).True();
      expect(Point.isEqual(rect.rightTop, [12, -2])).True();
      expect(Point.isEqual(rect.rightBottom, [12, 12])).True();
      expect(Point.isEqual(rect.leftBottom, [-2, 12])).True();
      expect(rect.width).eq(14);
      expect(rect.height).eq(14);
    }

    rect = applyPaddingToRect(Rect.fromOrigin(10, 10), {left: -1, top: -1, right: -1, bottom: -1})
    expect(Point.isEqual(rect.center, [5, 5])).True()

    rect = applyPaddingToRect(Rect.fromOrigin(10, 10), {left: -1, top: -1, right: 1, bottom: 1})
    expect(Point.isEqual(rect.center, [6, 6])).True()
    expect(rect.width).toEqual(10)
    expect(rect.height).toEqual(10)


    rect = applyPaddingToRect(Rect.fromOrigin(10, 10), {x: -1, y: -1})
    expect(Point.isEqual(rect.center, [5, 5])).True()

    rect = applyPaddingToRect(Rect.fromOrigin(10, 10), {x: -1, y: 1})
    expect(Point.isEqual(rect.center, [5, 5])).True()
    expect(rect.width).toEqual(8)
    expect(rect.height).toEqual(12)

  });

});

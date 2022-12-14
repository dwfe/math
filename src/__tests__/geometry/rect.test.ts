import {noThrow} from '@do-while-for-each/test'
import {Point, Rect} from '../../geometry'

describe('rect', () => {

  test('fromCenter', () => {
    const rect = Rect.fromCenter(1, 1, [0, 0]);
    expect(rect.left).eq(-0.5);
    expect(rect.top).eq(-0.5);
    expect(rect.right).eq(0.5);
    expect(rect.bottom).eq(0.5);
  });

  test('4 points', () => {
    const rect = Rect.fromCenter(2, 2, [0, 0]);
    expect(Point.isEqual(Rect.leftTop(rect), [-1, -1])).True();
    expect(Point.isEqual(Rect.leftBottom(rect), [-1, 1])).True();
    expect(Point.isEqual(Rect.rightTop(rect), [1, -1])).True();
    expect(Point.isEqual(Rect.rightBottom(rect), [1, 1])).True();
  });

  test('center, width, height, aspectRatio, center', () => {
    const rect = Rect.fromCenter(2, 5, [0.5, 0.5]);
    expect(Point.isEqual(Rect.center(rect), [0.5, 0.5])).True();
    expect(Rect.width(rect)).eq(rect.width);
    expect(Rect.height(rect)).eq(rect.height);
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
    expect(Rect.isEqual(Rect.fromOrigin(100, 100), Rect.fromOrigin(100, 100))).True();
    expect(Rect.isEqual(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 200))).True();
    expect(Rect.isEqual(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 200, [70, 90]))).True();

    expect(Rect.isEqual(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqual(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 200, [70, 90]))).False();

    expect(Rect.isEqual(undefined as any, Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqual(Rect.fromOrigin(100, 200), undefined as any)).False();
    expect(Rect.isEqual(undefined as any, null as any)).False();
  });

  test('toPoints', () => {
    const rect = Rect.fromOrigin(1, 1);
    const arr = Rect.toPoints(rect);
    expect(arr.length).eq(4);
    const [leftTop, rightTop, rightBottom, leftBottom] = arr;
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
  });

});

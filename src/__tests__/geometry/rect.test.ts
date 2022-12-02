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

});

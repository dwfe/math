import '@do-while-for-each/test';
import {IPoint, IRect, Point, Rect} from '../../geometry';
import {toFixed} from '../../util';

describe('geometry.point', () => {

  test('normalize', () => {
    {
      const point = Point.normalize([3, 1]);
      const len = Point.distance([0, 0], [3, 1]);
      const target = [3 / len, 1 / len];
      expect(toFixed(Point.distance([0, 0], target), 10)).eq(1);
      expect(Point.isEqual(point, target)).True();
    }
    {
      const point = Point.normalize([3, 4]);
      const target = [3 / 5, 4 / 5];
      expect(toFixed(Point.distance([0, 0], target), 10)).eq(1);
      expect(Point.isEqual(point, target)).True();
    }
    {
      const point = Point.normalize([0, 0]);
      const target = [0, 0];
      expect(toFixed(Point.distance([0, 0], target), 10)).eq(0);
      expect(Point.isEqual(point, target)).True();
    }
  });

  test('toString', () => {
    expect(Point.toString([0, 0])).eq('0,0');
    expect(Point.toString([-12.0, -0])).eq('-12,0');
    expect(Point.toString([23.783, 3])).eq('23.783,3');
  });

  test('abs', () => {
    expect(Point.abs([0, 0])).toEqual([0, 0]);
    expect(Point.abs([-0, 0])).toEqual([0, 0]);
    expect(Point.abs([10, 10])).toEqual([10, 10]);
    expect(Point.abs([-10, -10])).toEqual([10, 10]);
  })

  test('moveIntoRectIfOutside', () => {
    let centers: IPoint[] = [[0, 0], [10, 10], [-10, -10]];
    let rect: IRect;
    for (let center of centers) {
      rect = Rect.fromCenter(10, 10, center);

      // left and|or top
      expect(Point.moveIntoRectIfOutside([-100, -100], rect)).toEqual(rect.leftTop);
      expect(Point.moveIntoRectIfOutside([-100, rect.center[1]], rect)).toEqual([rect.left, rect.center[1]]);
      expect(Point.moveIntoRectIfOutside([rect.center[0], -100], rect)).toEqual([rect.center[1], rect.top]);

      // right and|or bottom
      expect(Point.moveIntoRectIfOutside([100, 100], rect)).toEqual(rect.rightBottom);
      expect(Point.moveIntoRectIfOutside([100, rect.center[1]], rect)).toEqual([rect.right, rect.center[1]]);
      expect(Point.moveIntoRectIfOutside([rect.center[0], 100], rect)).toEqual([rect.center[1], rect.bottom]);

      // should not be changed
      for (let p of rect.points) {
        expect(Point.moveIntoRectIfOutside(p, rect)).toEqual(p);
      }

      // should not be the same array
      for (let p of rect.points) {
        expect(Point.moveIntoRectIfOutside(p, rect)).not.toBe(p);
      }
    }
  })

  test('moveOutOfRectIfInside', () => {
    let centers: IPoint[] = [[0, 0], [10, 10], [-10, -10]];
    let rect: IRect;
    for (let center of centers) {
      rect = Rect.fromCenter(10, 10, center);

      // to the minimal coords
      expect(Point.moveOutOfRectIfInside(center, rect)).toEqual(rect.leftTop);

      // to the maximum coords
      expect(Point.moveOutOfRectIfInside(Point.add(center, [.01,.01]), rect)).toEqual(rect.rightBottom);

      // should be the same
      for (let p of rect.points) {
        expect(Point.moveOutOfRectIfInside(p, rect)).toEqual(p);
      }

      // should not be the same array
      for (let p of rect.points) {
        expect(Point.moveOutOfRectIfInside(p, rect)).not.toBe(p);
      }
    }
  })


});

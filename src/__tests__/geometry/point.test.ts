import '@do-while-for-each/test';
import {Point} from '../../geometry';
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

});

import '@do-while-for-each/test';
import {multiPolygonContainsPoint} from '../../algorithm';

describe('multipolygonContainsPoint', () => {

  test('Обычный квадрат', () => {

    const polygon = [
      [
        [1, 1],
        [1, 2],
        [2, 2],
        [2, 1],
        [1, 1]
      ]
    ];

    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [1.5, 1.5]);
      expect(isInside).True();
      expect(isOnEdge).eq(undefined);
    }
    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [4.9, 1.2]);
      expect(isInside).False();
      expect(isOnEdge).eq(undefined);
    }
    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [1, 2]);
      expect(isInside).True();
      expect(isOnEdge).True();
    }
    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [1, 2], true);
      expect(isInside).False();
      expect(isOnEdge).True();
    }
  });

  test('Повернутый прямоугольник', () => {

    const polygon = [
      [
        [2, 4],
        [5, 8],
        [8, 6],
        [5, 2],
        [2, 4]
      ]
    ];

    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [5, 4]);
      expect(isInside).True();
      expect(isOnEdge).eq(undefined);
    }
    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [4, 2.66]);
      expect(isInside).False();
      expect(isOnEdge).eq(undefined);
    }
    {
      const {isInside, isOnEdge} = multiPolygonContainsPoint(polygon, [6.2, 3.6]);
      expect(isInside).False();
      expect(isOnEdge).eq(undefined);
    }
  });

});

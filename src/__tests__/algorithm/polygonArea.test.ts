import '@do-while-for-each/test'
import {polygonArea, polygonPointsClockwise} from '../../algorithm'

describe('polygonArea', () => {

  test('area', () => {
    expect(polygonArea([[1, 6], [3, 1], [7, 2], [4, 4], [8, 5]])).eq(16.5);
    expect(polygonArea([[1, 6], [3, 1], [7, 2], [4, 4], [8, 5], [1, 6]])).eq(16.5);

    expect(polygonArea([[-6, 0], [-2, 5], [0, 1], [4, 4], [5, -2], [-1, -4]])).eq(-55);
    expect(polygonArea([[-6, 0], [-2, 5], [0, 1], [4, 4], [5, -2], [-1, -4], [-6, 0]])).eq(-55);

    expect(polygonArea([[0, 0], [1, 0], [1, 1], [0, 1]])).eq(1);
    expect(polygonArea([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).eq(1);
  });

  test('clockwise', () => {
    expect(polygonPointsClockwise([[1, 6], [3, 1], [7, 2], [4, 4], [8, 5]])).False();
    expect(polygonPointsClockwise([[-6, 0], [-2, 5], [0, 1], [4, 4], [5, -2], [-1, -4]])).True();
    expect(polygonPointsClockwise([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])).False();
  });

});

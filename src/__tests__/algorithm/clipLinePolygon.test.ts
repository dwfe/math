import '@do-while-for-each/test'
import {IPolygon, Point} from '../../geometry';
import {clipPolygon} from '../../algorithm';

describe('clipLinePolygon', () => {

  const checkPolygon: IPolygon = [];

  test('polygon inside bbox', () => {
    const res = clipPolygon(
      [[0, 0], [5, 0], [5, 5], [0, 5]],
      [-10, -10, 10, 10]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [0, 0])).True();
    expect(Point.isEqual(res[1], [5, 0])).True();
    expect(Point.isEqual(res[2], [5, 5])).True();
    expect(Point.isEqual(res[3], [0, 5])).True();
  });

  test('bbox inside polygon', () => {
    const res = clipPolygon(
      [[-10.1, 10.1], [10.1, 10.1], [10.1, -10.1], [-10.1, -10.1]],
      [-10, -10, 10, 10]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [-10, -10])).True();
    expect(Point.isEqual(res[1], [-10, 10])).True();
    expect(Point.isEqual(res[2], [10, 10])).True();
    expect(Point.isEqual(res[3], [10, -10])).True();
  });

  test('outside #2', () => {
    const res = clipPolygon(
      [[0, 0], [4, 0], [4, 4], [0, 4]],
      [5, 5, 10, 10]
    );
    expect(res.length).eq(0);
  });

  test('clip #1. polygon more than bbox', () => {
    const res = clipPolygon(
      [[0, 0], [0, 10], [6, 10], [6, 0]],
      [0, 0, 5, 8]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [5, 8])).True();
    expect(Point.isEqual(res[1], [5, 0])).True();
    expect(Point.isEqual(res[2], [0, 0])).True();
    expect(Point.isEqual(res[3], [0, 8])).True();
  });

  test('clip #2. polygon less than bbox', () => {
    const res = clipPolygon(
      [[0, 0], [4, 0], [4, 4], [0, 4]],
      [0, 0, 5, 5]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [0, 0])).True();
    expect(Point.isEqual(res[1], [4, 0])).True();
    expect(Point.isEqual(res[2], [4, 4])).True();
    expect(Point.isEqual(res[3], [0, 4])).True();
  });

  test('clip #3. polygon intersects bbox', () => {
    const res = clipPolygon(
      [[-2, 3], [-2, 6], [3, 6], [3, 3]],
      [0, 0, 5, 5]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [0, 3])).True();
    expect(Point.isEqual(res[1], [0, 5])).True();
    expect(Point.isEqual(res[2], [3, 5])).True();
    expect(Point.isEqual(res[3], [3, 3])).True();
  });

  test('intersects in point', () => {
    const res = clipPolygon(
      [[5, 5], [5, 8], [10, 8], [10, 5]],
      [0, 0, 5, 5]
    );
    expect(res.length).eq(4);
    expect(Point.isEqual(res[0], [5, 5])).True();
    expect(Point.isEqual(res[1], [5, 5])).True();
    expect(Point.isEqual(res[2], [5, 5])).True();
    expect(Point.isEqual(res[3], [5, 5])).True();
  });

});

import '@do-while-for-each/test'
import {Matrix2x2} from '../../linear-algebra';

const {apply, isEqual, invert, multiply} = Matrix2x2;

describe('matrix-2x2', () => {

  test('inversion', () => {
    expect(isEqual(invert([1, 0, 0, 1]), [1, 0, 0, 1])).True();
    expect(isEqual(invert([3, 1, 5, 2]), [2, -1, -5, 3])).True();
    expect(isEqual(invert([0, -1, 3, 2]), [2 / 3, 1 / 3, -1, 0])).True();
  });

  test('multiply', () => {
    expect(isEqual(multiply([2, 0, 1, 3], [4, 1, 2, 5]), [9, 3, 9, 15])).True();
    expect(isEqual(multiply([1, -4, 3, 2], [7, -1, -3, 5]), [4, -30, 12, 22])).True();
  });

  test('apply', () => {
    {
      const res = apply([1, 0, 0, 1], [3, 2]);
      expect(res[0]).eq(3);
      expect(res[1]).eq(2);
    }
    {
      const res = apply([0.5, 9, -15, -0.25], [-7, 0.5]);
      expect(res[0]).eq(-11);
      expect(res[1]).eq(-63.125);
    }
  });

});

import {Throw} from '@do-while-for-each/test';
import {getPointsExtremeValues} from '../../util';

describe('getPointsExtremeValues', () => {

  test('check', () => {
    {
      const [extremeX, extremeY] = getPointsExtremeValues([[1, 0], [9, -8], [-2, 3]]);
      expect(extremeX.min).eq(-2);
      expect(extremeX.max).eq(9);
      expect(extremeY.min).eq(-8);
      expect(extremeY.max).eq(3);
    }
    {
      const [extremeX, extremeY] = getPointsExtremeValues([[1, 0]]);
      expect(extremeX.min).eq(1);
      expect(extremeX.max).eq(1);
      expect(extremeY.min).eq(0);
      expect(extremeY.max).eq(0);
    }
  });

  test('exception', () => {
    Throw(() => getPointsExtremeValues([]), `can't calculate extreme values for zero length array`);
    Throw(() => getPointsExtremeValues(null as any), `Cannot read properties of null (reading 'length')`);
  });

});

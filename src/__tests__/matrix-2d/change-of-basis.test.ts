import '@do-while-for-each/test';
import {IBasis, WebMatrix} from '../../web-transform'
import {Point, TPoint} from '../../geometry'

describe('change of basis', () => {

  test('first', () => {
    const fromBasis: IBasis = {
      o: [0, 0],
      ox: [1, 1],
      oy: [0, -1],
    };
    const toBasis: IBasis = {
      o: [0, 0],
      ox: [1, 0],
      oy: [1, -1],
    };
    const mA = WebMatrix.of(
      WebMatrix.changeOfBasisMatrix(fromBasis, toBasis)
    );

    /**
     * fromPoint = [2, 1]
     */
    {
      const fromPoint: TPoint = [2, 1];
      const toPoint = mA.invert().apply(fromPoint);
      expect(Point.isEqual(toPoint, [3, -1])).True();
    }
    {
      const toPoint: TPoint = [3, -1];
      const fromPoint = mA.apply(toPoint);
      expect(Point.isEqual(fromPoint, [2, 1])).True();
    }

    /**
     * fromPoint = [1, -2]
     */
    {
      const fromPoint: TPoint = [1, -2];
      const toPoint = mA.invert().apply(fromPoint);
      expect(Point.isEqual(toPoint, [4, -3])).True();
    }
    {
      const toPoint: TPoint = [4, -3];
      const fromPoint = mA.apply(toPoint);
      expect(Point.isEqual(fromPoint, [1, -2])).True();
    }


  });

});

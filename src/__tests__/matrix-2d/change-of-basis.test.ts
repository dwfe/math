import '@do-while-for-each/test';
import {IBasis, WebMatrix} from '../../web-transform'
import {Point, TPoint} from '../../geometry'

describe('change of basis', () => {

  test('standard basis', () => {

    check( // из книги Мосина, стр.43 Пример 27
      {
        o: [0, 0],
        ox: [1, 0],
        oy: [0, 1],
      },
      {
        o: [0, 0],
        ox: [1, 1],
        oy: [-1, 0],
      },
      [
        [[-1, 1], [1, 2]]
      ]);

  });

  test('non-standard basis', () => {

    check(
      {
        o: [0, 0],
        ox: [1, 1],
        oy: [0, -1],
      },
      {
        o: [0, 0],
        ox: [1, 0],
        oy: [1, -1],
      },
      [
        [[2, 1], [3, -1]],
        [[1, -2], [4, -3]],
      ]);
  });

  test('shift', () => {

    check(
      {
        o: [0, 0],
        ox: [1, 0],
        oy: [0, 1],
      },
      {
        o: [2, -1], // в координатах U
        ox: [1, 0], // в координатах U
        oy: [4, 1], // в координатах U
      },
      [
        [
          [-1, 1],      // точка в U, в координатах U
          [2.5, -0.25], // та же точка в W, в координатах W
          [2, -1],     // shift в U, в координатах U
          [1.5, -0.25] // shift в W, в координатах W
        ]
      ]);

  });

});

//                                       [vuTarget, vwTarget, shiftU, shiftW]
function check(u: IBasis, w: IBasis, arr: [TPoint, TPoint, TPoint?, TPoint?][]) {
  const m = WebMatrix.changeOfBasisMatrix(u, w);
  const mInv = WebMatrix.invert(m);
  for (const [vuTarget, vwTarget, shiftU, shiftW] of arr) {
    const vw = WebMatrix.apply(m, vuTarget);
    const vu = WebMatrix.apply(mInv, vwTarget);
    // console.log(`vuTarget -> vw`, vuTarget, vw);
    // console.log(`vwTarget -> vu`, vwTarget, vu);
    expect(Point.isEqual(vw, vwTarget)).True();
    expect(Point.isEqual(vu, vuTarget)).True();
    if (shiftU !== undefined) {
      // console.log(`shiftU`, shiftU, [mInv[4], mInv[5]])
      expect(shiftU[0]).eq(mInv[4]);
      expect(shiftU[1]).eq(mInv[5]);
    }
    if (shiftW !== undefined) {
      // console.log(`shiftW`, shiftW, [m[4], m[5]])
      expect(shiftW[0]).eq(m[4]);
      expect(shiftW[1]).eq(m[5]);
    }
  }
}

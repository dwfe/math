import '@do-while-for-each/test';
import {Basis} from '../../web-transform/basis'
import {WebMatrix} from '../../web-transform'
import {Point, TPoint} from '../../geometry'

describe('change of basis', () => {

  test('standard basis', () => {

    check( // из книги Мосина, стр.43 Пример 27
      Basis.standard(),
      Basis.of(
        [0, 0],
        [1, 1],
        [-1, 0]
      ),
      [
        [[-1, 1], [1, 2]]
      ]);

    check( // базис u1-u2 из https://www.youtube.com/watch?v=HZa1RwFHgwU
      Basis.standard(),
      Basis.of(
        [0, 0],
        [1, 2],
        [3, 3]
      ),
      [
        [[3, 2], [-1, 1.333333333333333]]
      ]);

    check( // базис w1-w2 из https://www.youtube.com/watch?v=HZa1RwFHgwU
      Basis.standard(),
      Basis.of(
        [0, 0],
        [-1, -1],
        [3, 0]
      ),
      [
        [[3, 2], [-2, 0.333333333333333]]
      ]);

  });

  test('non-standard basis', () => {

    // check(
    //   Basis.of(
    //     [0, 0],
    //     [1, 1],
    //     [0, -1],
    //   ),
    //   Basis.of(
    //     [0, 0],
    //     [1, 0],
    //     [1, -1],
    //   ),
    //   [
    //     [[2, 1], [3, -1]],
    //     [[1, -2], [4, -3]],
    //   ]);


    check(
      Basis.of(
        [-0.18599434057003528, 0.1355655065721687],
        [1.1859943405700353, 0.1355655065721687],
        [-0.18599434057003528, 0.8644344934278313],
      ),
      Basis.of(
        [540.7124205178468, 127.08110020067348],
        [454.058963782401, 267.91670026239075],
        [465.89350798505944, 81.04645130996792],
      ),
      [
        [[624.3375672974064, 250.00000000000006], [0.3190252152621864, -0.9898207239167007]],
      ]);

  });

  test('shift', () => {

    check(
      Basis.standard(),
      Basis.of(
        [2, -1], // разложен по базису U
        [1, 0],  // разложен по базису U
        [4, 1],  // разложен по базису U
      ),
      [
        [
          [-1, 1],      // точка в U, в координатах U
          [2.5, -0.25], // та же точка в W, в координатах W
          [2, -1],     // shift в U, разложен по базису U
          [1.5, -0.25] // shift в W, разложен по базису W
        ]
      ]);

  });

});

//                                       [vuTarget, vwTarget, shiftU, shiftW]
function check(u: Basis, w: Basis, arr: [TPoint, TPoint, TPoint?, TPoint?][]) {
  const m = WebMatrix.changeOfBasisMatrix(u, w);
  const mInv = WebMatrix.invert(m);
  for (const [vuTarget, vwTarget, shiftU, shiftW] of arr) {
    const vw = WebMatrix.apply(m, vuTarget);
    const vu = WebMatrix.apply(mInv, vwTarget);
    // console.log(`vuTarget -> vw`, vuTarget, vw);
    // console.log(`vuTarget -> vw''`, vuTarget, WebMatrix.apply(mInv, vuTarget));
    // console.log(`vwTarget -> vu`, vwTarget, vu);
    expect(Point.isEqual(vw, vwTarget)).True();
    expect(Point.isEqual(vu, vuTarget)).True();
    if (shiftW !== undefined) {
      // console.log(`shiftW`, shiftW, [m[4], m[5]])
      expect(shiftW[0]).eq(m[4]);
      expect(shiftW[1]).eq(m[5]);
    }
    if (shiftU !== undefined) {
      // console.log(`shiftU`, shiftU, [mInv[4], mInv[5]])
      expect(shiftU[0]).eq(mInv[4]);
      expect(shiftU[1]).eq(mInv[5]);
    }
  }
}

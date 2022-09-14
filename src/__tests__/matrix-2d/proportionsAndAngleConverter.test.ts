import '@do-while-for-each/test'
import {Basis, WebMatrix} from '../../web-transform'
import {Point, TPoint} from '../../geometry'

describe('proportions and angle converter', () => {

  test('article', () => {
    check(
      Basis.of(
        [-3, -40],
        [3, 10],
        [-4, -10],
      ),
      Basis.of(
        [-0.25, 0.25],
        [-1, 0.25],
        [-0.25, 1],
      ),
      [
        [[-0.5, 0], [-0.625, 0.625]], // середина диагонали
        [[2, 40], [-1, 1]],           // вся диагональ
        [[-3, -40], [-0.25, 0.25]], // центр
        [[3, 10], [-1, 0.25]],      // ox
        [[-4, -10], [-0.25, 1]]     // oy
      ]);
  });

  test('mm', () => {
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
        [[0.3190252152621864, -0.9898207239167007], [624.3375672974064, 250.00000000000006]],
      ]);
  });

});

//                                     [fromPointTarget, toPointTarget, shiftInsideFrom, shiftInsideTo]
function check(fromBasis: Basis, toBasis: Basis, data: [TPoint, TPoint, TPoint?, TPoint?][]) {
  const toTO = WebMatrix.proportionsAndAngleConverter(fromBasis, toBasis);
  const toFROM = WebMatrix.invert(toTO);
  for (const [fromPointCheck, toPointCheck, shiftInsideFrom, shiftInsideTo] of data) {
    const toPoint = WebMatrix.apply(toTO, fromPointCheck);
    const fromPoint = WebMatrix.apply(toFROM, toPointCheck);
    // console.log(`fromPointCheck -> toPoint`, fromPointCheck, toPoint);
    // console.log(`fromPointCheck -> toPoint''`, fromPointCheck, WebMatrix.apply(toFROM, fromPointCheck));
    // console.log(`toPointCheck -> fromPoint`, toPointCheck, fromPoint);
    if (shiftInsideFrom !== undefined) {
      const [e, f] = toFROM.slice(-2);
      // console.log(`shiftInsideFrom`, shiftInsideFrom, [e, f])
      expect(shiftInsideFrom[0]).eq(e);
      expect(shiftInsideFrom[1]).eq(f);
    }
    if (shiftInsideTo !== undefined) {
      const [e, f] = toTO.slice(-2);
      // console.log(`shiftInsideTo`, shiftInsideTo, [e, f])
      expect(shiftInsideTo[0]).eq(e);
      expect(shiftInsideTo[1]).eq(f);
    }
    expect(Point.isEqual(toPoint, toPointCheck)).True();
    expect(Point.isEqual(fromPoint, fromPointCheck)).True();
  }
}

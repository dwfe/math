import {Throw} from '@do-while-for-each/test'
import {Basis, LinearOperator, Matrix} from '../../linear-algebra'
import {IPoint, Point} from '../../geometry'

describe('change of basis matrix', () => {

  test('standard basis', () => {

    check( // из книги Мосина, стр.43 Пример 27
      Basis.standard(),
      Basis.byExtent(
        [0, 0],
        [1, 1],
        [-1, 0]
      ),
      [
        [[-1, 1], [1, 2]]
      ]);

    check( // базис u1-u2 из https://www.youtube.com/watch?v=HZa1RwFHgwU
      Basis.standard(),
      Basis.byExtent(
        [0, 0],
        [1, 2],
        [3, 3]
      ),
      [
        [[3, 2], [-1, 1.333333333333333]]
      ]);

    check( // базис w1-w2 из https://www.youtube.com/watch?v=HZa1RwFHgwU
      Basis.standard(),
      Basis.byExtent(
        [0, 0],
        [-1, -1],
        [3, 0]
      ),
      [
        [[3, 2], [-2, 0.333333333333333]]
      ]);

  });

  test('non-standard basis', () => {

    Throw(() =>
        check(
          Basis.byExtent([1, 2], [2, 2], [1, 3]),
          Basis.byExtent([1, -3], [0, -2], [3, -1]),
          [
            [[-2, -1], [3, -1]],
          ]),
      'if there is a shift, then point from.o [1,2] should be in the center of coordinates [0,0]'
    );

    check(
      Basis.byExtent(
        [0, 0],
        [1, 1],
        [0, -1],
      ),
      Basis.byExtent(
        [0, 0],
        [1, 0],
        [1, -1],
      ),
      [
        [[2, 1], [3, -1]],
        [[1, -2], [4, -3]],
      ]);

  });

  test('shift', () => {

    check(
      Basis.standard(),
      Basis.byExtent(
        [2, -1], // точка в TO, выраженная через базис FROM
        [1, 0],  // точка в TO, выраженная через базис FROM
        [4, 1],  // точка в TO, выраженная через базис FROM
      ),
      [
        [
          [-1, 1],      // точка в FROM, выраженная через базис FROM
          [2.5, -0.25], // та же точка в TO, выраженная через базис TO
          [2, -1],      // shift в FROM, разложен по базису FROM
          [1.5, -0.25], // shift в TO, разложен по базису TO
        ]
      ]);

    check( // Конвертер пропорций и углов, где красный вектор идет из [-3,-40] в [-0.5, 0]
      Basis.standard(),
      Basis.byExtent(
        [-3, -4],
        [3, 1],
        [-4, -1],
      ),
      [
        [[-0.5, 0], [0.5, 0.5], [-3, -4]]
      ]
    );

  });

});

//                                     [fromPointTarget, toPointTarget, shiftInsideFrom, shiftInsideTo]
function check(fromBasis: Basis, toBasis: Basis, data: [IPoint, IPoint, IPoint?, IPoint?][]) {
  const fns: Array<{ variant: string, changeOfBasisMatrix: any }> = [
    {variant: '1#', changeOfBasisMatrix: LinearOperator.changeOfBasisMatrix},
    {variant: '2#', changeOfBasisMatrix: LinearOperator.changeOfBasisMatrix2}
  ];
  for (const next of fns) {
    const toTO = next.changeOfBasisMatrix(fromBasis, toBasis);
    const toFROM = Matrix.invert(toTO);
    for (const [fromPointCheck, toPointCheck, shiftInsideFrom, shiftInsideTo] of data) {
      const toPoint = Matrix.apply(toTO, fromPointCheck);
      const fromPoint = Matrix.apply(toFROM, toPointCheck);
      // console.log(`${next.variant} fromPointCheck -> toPoint`, fromPointCheck, toPoint);
      // console.log(`${next.variant} fromPointCheck -> toPoint''`, fromPointCheck, WebMatrix.apply(toFROM, fromPointCheck));
      // console.log(`${next.variant} toPointCheck -> fromPoint`, toPointCheck, fromPoint);
      if (shiftInsideFrom !== undefined) {
        const [e, f] = toFROM.slice(-2);
        // console.log(`${next.variant} shiftInsideFrom`, shiftInsideFrom, [e, f])
        expect(shiftInsideFrom[0]).eq(e);
        expect(shiftInsideFrom[1]).eq(f);
      }
      if (shiftInsideTo !== undefined) {
        const [e, f] = toTO.slice(-2);
        // console.log(`${next.variant} shiftInsideTo`, shiftInsideTo, [e, f])
        expect(shiftInsideTo[0]).eq(e);
        expect(shiftInsideTo[1]).eq(f);
      }
      expect(Point.isEqual(toPoint, toPointCheck)).True();
      expect(Point.isEqual(fromPoint, fromPointCheck)).True();
    }
  }
}

import '@do-while-for-each/test'
import {Basis, IMatrix, Matrix, Operator} from '../../linear-algebra'
import {IPoint, IRect, Point, Rect} from '../../geometry'

describe('proportions and angle converter', () => {

  test('масштабирование точек прямоугольника, когда мы берем и тянем за одну из угловых точек', () => {

    function checkPolygon(points: IPoint[], conv: IMatrix, leftTop: IPoint, rightTop: IPoint, rightBottom: IPoint, leftBottom: IPoint) {
      const polygon = points.map(point => Matrix.apply(conv, point));
      expect(Point.isEqual(polygon[0], leftTop)).True();
      expect(Point.isEqual(polygon[1], rightTop)).True();
      expect(Point.isEqual(polygon[2], rightBottom)).True();
      expect(Point.isEqual(polygon[3], leftBottom)).True();
      // console.log(``, polygon)
    }

    const rect: IRect = Rect.fromCornerPoint(10, 10, [0, 0], 'leftTop');
    const sx = 8 / 10;
    const sy = 9 / 10;

    checkPolygon(
      rect.points,
      Operator.scaleAtPoint(rect.leftTop, sx, sy),
      [0, 0], [8, 0], [8, 9], [0, 9]
    );

    checkPolygon(
      rect.points,
      Operator.scaleAtPoint(rect.rightTop, sx, sy),
      [2, 0], [10, 0], [10, 9], [2, 9]
    );

    checkPolygon(
      rect.points,
      Operator.scaleAtPoint(rect.rightBottom, sx, sy),
      [2, 1], [10, 1], [10, 10], [2, 10]
    );

    checkPolygon(
      rect.points,
      Operator.scaleAtPoint(rect.leftBottom, sx, sy),
      [0, 1], [8, 1], [8, 10], [0, 10]
    );

    checkPolygon(
      rect.points,
      Operator.scaleAtPoint(rect.leftBottom, 6 / 10, 5 / 10),
      [0, 5], [6, 5], [6, 10], [0, 10]
    );

    // уже отскалированный относительно leftBottom
    // отскалируем по-новой также относительно leftBottom
    checkPolygon(
      [[0, 1], [8, 1], [8, 10], [0, 10]],
      Operator.scaleAtPoint(rect.leftBottom, 6 / 8, 5 / 9),
      [0, 5], [6, 5], [6, 10], [0, 10]
    );

    // скалирование только под одной оси - двигаем не угловую точку, а сторону
    checkPolygon(
      [[0, 5], [6, 5], [6, 10], [0, 10]],
      Operator.scaleAtPoint([0, 10], 4 / 6, 1),
      [0, 5], [4, 5], [4, 10], [0, 10]
    );

  });


  test('article', () => {
    check(
      Basis.fromExtent(
        [-3, -40],
        [3, 10],
        [-4, -10],
      ),
      Basis.fromExtent(
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
      Basis.fromExtent(
        [-0.18599434057003528, 0.1355655065721687],
        [1.1859943405700353, 0.1355655065721687],
        [-0.18599434057003528, 0.8644344934278313],
      ),
      Basis.fromExtent(
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
function check(fromBasis: Basis, toBasis: Basis, data: [IPoint, IPoint, IPoint?, IPoint?][]) {
  const toTO = Operator.proportionsWithRotationConverter(fromBasis, toBasis);
  const toFROM = Matrix.invert(toTO);
  for (const [fromPointCheck, toPointCheck, shiftInsideFrom, shiftInsideTo] of data) {
    const toPoint = Matrix.apply(toTO, fromPointCheck);
    const fromPoint = Matrix.apply(toFROM, toPointCheck);
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
    expect(Point.isEqualAccuracy(toPoint, toPointCheck)).True();
    expect(Point.isEqualAccuracy(fromPoint, fromPointCheck)).True();
  }
}

import {noThrow, Throw} from '@do-while-for-each/test'
import {IPoint, IRect, IRectPosition, Point, Rect} from '../../geometry'
import {IMatrix, Matrix, Operator} from '../../linear-algebra';
import {approximately} from '../../util';

describe('geometry. rect', () => {

  test('fromCenter', () => {
    const rect = Rect.fromCenter(1, 1, [0, 0]);
    expect(rect.left).eq(-0.5);
    expect(rect.top).eq(-0.5);
    expect(rect.right).eq(0.5);
    expect(rect.bottom).eq(0.5);
  });

  test('4 points', () => {
    const rect = Rect.fromCenter(2, 2, [0, 0]);
    expect(Point.isEqual(rect.leftTop, [-1, -1])).True();
    expect(Point.isEqual(rect.leftBottom, [-1, 1])).True();
    expect(Point.isEqual(rect.rightTop, [1, -1])).True();
    expect(Point.isEqual(rect.rightBottom, [1, 1])).True();
  });

  test('width, height, aspectRatio, center', () => {
    const rect = Rect.fromCenter(2, 5, [0.5, 0.5]);
    expect(Point.isEqual(rect.center, [0.5, 0.5])).True();
    expect(2 / 5).eq(rect.aspectRatio);
    expect(Point.isEqual([0.5, 0.5], rect.center)).True();
  });

  test('height === 0', () => {
    noThrow(() => {
      const rect = Rect.fromOrigin(0, 0);
      expect(rect.aspectRatio).eq(0);
    });
    noThrow(() => {
      const rect = Rect.fromOrigin(1, 0);
      expect(rect.aspectRatio).eq(0);
    });

    noThrow(() => {
      const rect = Rect.fromCenter(0, 0);
      expect(rect.aspectRatio).eq(0);
    });
    noThrow(() => {
      const rect = Rect.fromCenter(1, 0);
      expect(rect.aspectRatio).eq(0);
    });
  });

  test('fromDOMRect', () => {
    const rect = Rect.fromDOMRect({
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,

      width: 200,
      height: 100,
    });
    expect(rect.left).eq(0);
    expect(rect.top).eq(0);
    expect(rect.right).eq(200);
    expect(rect.bottom).eq(100);
    expect(rect.width).eq(200);
    expect(rect.height).eq(100);
    expect(rect.aspectRatio).eq(2);
    expect(Point.isEqual(rect.center, [100, 50])).True();
  });

  test('isEqual', () => {
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 100), Rect.fromOrigin(100, 100))).True();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 200))).True();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 200, [70, 90]))).True();

    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), Rect.fromCenter(100, 100, [70, 90]))).False();

    expect(Rect.isEqualByWidthHeight(undefined as any, Rect.fromOrigin(100, 201))).False();
    expect(Rect.isEqualByWidthHeight(Rect.fromOrigin(100, 200), undefined as any)).False();
    expect(Rect.isEqualByWidthHeight(undefined as any, null as any)).False();
  });

  test('toPoints', () => {
    const rect = Rect.fromOrigin(1, 1);
    const arr = rect.points;
    expect(arr.length).eq(4);
    const [leftTop, rightTop, rightBottom, leftBottom] = arr; // порядок точек важен
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
  });

  test('toPointsObj', () => {
    const rect = Rect.fromOrigin(1, 1);
    expect(Object.keys(rect).length).eq(14);
    const {leftTop, rightTop, rightBottom, leftBottom} = rect;
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
  });

  test('toPolygon', () => {
    const rect = Rect.fromOrigin(1, 1);
    const arr = rect.polygon;
    expect(arr.length).eq(5);
    const [leftTop, rightTop, rightBottom, leftBottom, leftTopClosing] = arr; // порядок точек важен
    expect(Point.isEqual(leftTop, [0, 0])).True();
    expect(Point.isEqual(rightTop, [1, 0])).True();
    expect(Point.isEqual(rightBottom, [1, 1])).True();
    expect(Point.isEqual(leftBottom, [0, 1])).True();
    expect(Point.isEqual(leftTopClosing, leftTop)).True();
  });

  test('fromMiddleOfSide', () => {
    const check = ({
                     left, top, right, bottom,
                     leftTop, rightTop, rightBottom, leftBottom,
                     width, height, aspectRatio, center
                   }: IRect) => {
      expect(left).eq(3);
      expect(top).eq(2);
      expect(right).eq(12);
      expect(bottom).eq(9);
      expect(Point.isEqual(leftTop, [left, top])).True();
      expect(Point.isEqual(rightTop, [right, top])).True();
      expect(Point.isEqual(rightBottom, [right, bottom])).True();
      expect(Point.isEqual(leftBottom, [left, bottom])).True();
      expect(width).eq(9);
      expect(height).eq(7);
      expect(aspectRatio).eq(9 / 7);
      expect(Point.isEqual(center, [7.5, 5.5])).True();
    };
    check(Rect.fromMiddleOfSide(9, 7, [7.5, 2], 'top'));
    check(Rect.fromMiddleOfSide(9, 7, [3, 5.5], 'left'));
    check(Rect.fromMiddleOfSide(9, 7, [12, 5.5], 'right'));
    check(Rect.fromMiddleOfSide(9, 7, [7.5, 9], 'bottom'));
    // @ts-ignore
    Throw(() => Rect.fromMiddleOfSide(9, 7, [7.5, 2], '123'), `unknown side position "123", acceptable values: "top", "left", "right", "bottom"`);
  });

  test('fromCornerPoint', () => {
    const check = ({
                     left, top, right, bottom,
                     leftTop, rightTop, rightBottom, leftBottom,
                     width, height, aspectRatio, center
                   }: IRect) => {
      expect(left).eq(3);
      expect(top).eq(2);
      expect(right).eq(12);
      expect(bottom).eq(9);
      expect(Point.isEqual(leftTop, [left, top])).True();
      expect(Point.isEqual(rightTop, [right, top])).True();
      expect(Point.isEqual(rightBottom, [right, bottom])).True();
      expect(Point.isEqual(leftBottom, [left, bottom])).True();
      expect(width).eq(9);
      expect(height).eq(7);
      expect(aspectRatio).eq(9 / 7);
      expect(Point.isEqual(center, [7.5, 5.5])).True();
    };
    check(Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop'));
    check(Rect.fromCornerPoint(9, 7, [12, 2], 'rightTop'));
    check(Rect.fromCornerPoint(9, 7, [3, 9], 'leftBottom'));
    check(Rect.fromCornerPoint(9, 7, [12, 9], 'rightBottom'));
    // @ts-ignore
    Throw(() => Rect.fromCornerPoint(9, 7, [7.5, 2], '123'), `unknown point position "123", acceptable values: "leftTop", "rightTop", "leftBottom", "rightBottom"`);
  });

  test('intersectsRect', () => {
    { // сам с собой
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, a)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, a, true)).True();
    }
    { // по границе лево/право
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12, 2], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
    { // по границе лево/право, не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12.0001, 2], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).False();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
    { // по границе лево/право, сдвинуто по вертикали
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [12, 3], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(9, 7, [11, 3], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).True();
    }
    { // по границе верх/низ
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -3], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
    { // по границе верх/низ, не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -3.0001], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).False();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [3.5, -2], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).True();
    }
    { // пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [-4, 8], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).True();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).True();
    }
    { // не пересекаются
      const a = Rect.fromCornerPoint(9, 7, [3, 2], 'leftTop');
      const b = Rect.fromCornerPoint(8, 5, [-6, 9], 'leftTop');
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b)).False();
      expect(Rect.intersectsRectWhenSidesParallelToAxes(a, b, true)).False();
    }
  });

  test('isPositionCorner', () => {
    // true
    for (let p of ['rightBottom', 'leftBottom', 'rightTop', 'leftTop']) {
      expect(Rect.isPositionCorner(p as any)).toBe(true);
    }

    // false
    for (let p of ['center', 'left', 'right', 'top', 'bottom']) {
      expect(Rect.isPositionCorner(p as any)).toBe(false);
    }

    // incorrect - false
    for (let p of ['', 'asdf', 'test', 'enter', 'ightBottom']) {
      expect(Rect.isPositionCorner(p as any)).toBe(false);
    }
  });

  test('isPositionX', () => {
    // true
    for (let p of ['left', 'right']) {
      expect(Rect.isPositionX(p as any)).toBe(true);
    }

    // false
    for (let p of ['center', 'rightBottom', 'leftBottom', 'rightTop', 'leftTop', 'top', 'bottom']) {
      expect(Rect.isPositionX(p as any)).toBe(false);
    }

    // incorrect - false
    for (let p of ['', 'asdf', 'test', 'enter', 'ightBottom']) {
      expect(Rect.isPositionX(p as any)).toBe(false);
    }
  });

  test('isPositionY', () => {
    // true
    for (let p of ['bottom', 'top']) {
      expect(Rect.isPositionY(p as any)).toBe(true);
    }

    // false
    for (let p of ['center', 'left', 'right', 'rightBottom', 'leftBottom', 'rightTop', 'leftTop']) {
      expect(Rect.isPositionY(p as any)).toBe(false);
    }

    // incorrect - false
    for (let p of ['', 'asdf', 'test', 'enter', 'ightBottom']) {
      expect(Rect.isPositionY(p as any)).toBe(false);
    }
  });

  test('create .fromPosition', () => {
    let poses = ['left', 'leftTop', 'top', 'rightTop', 'right', 'rightBottom', 'bottom', 'leftBottom', 'center'] as IRectPosition[];
    const p = [0, 0];
    const width = 10;
    const height = 10;
    let rect: IRect;
    for (let pos of poses) {
      switch (pos) {
        case 'center':
          rect = Rect.fromCenter(width, height, p);
          break;
        case 'left':
        case 'right':
        case 'bottom':
        case 'top':
          rect = Rect.fromMiddleOfSide(width, height, p, pos);
          break;
        case 'leftBottom':
        case 'rightBottom':
        case 'leftTop':
        case 'rightTop':
          rect = Rect.fromCornerPoint(width, height, p, pos);
          break;
      }

      expect(Rect.fromPosition(width, height, p, pos)).toEqual(rect);
    }
  });

  test('getOppositePosition', () => {
    let poses = ['left', 'leftTop', 'top', 'rightTop', 'right', 'rightBottom', 'bottom', 'leftBottom', 'center'] as IRectPosition[];
    let opposites = ['right', 'rightBottom', 'bottom', 'leftBottom', 'left', 'leftTop', 'top', 'rightTop', 'center'] as IRectPosition[];
    for (let i = 0; i < poses.length; i++) {
      expect(Rect.getOppositePosition(poses[i])).toEqual(opposites[i]);
    }

    // incorrect
    poses = ['', 'eftTop', 'eft', 'asdf'] as any;
    for (let pos of poses) {
      expect(Rect.getOppositePosition(pos)).toEqual(pos);
    }
  });

});

{
  let sizesArr = [5, 10, 15, 20];
  let centers: IPoint[] = [[-10, -10], [-5, -5], [0, 0], [5, 5], [10, 10]];
  let rect: IRect;
  let diffs_1 = [1, 10, 100, 1000];
  let diffs_2 = [0.01, 0.01];

  const directions = [{
    desc: 'bottom',
    comparePoint: (rect: IRect, _: number, __: number) => [rect.center[0], rect.bottom],
    testPoint: (rect: IRect, diff: number, _: number) => Point.add(rect.center, [0, diff])
  }, {
    desc: 'top',
    comparePoint: (rect: IRect, _: number, __: number) => [rect.center[0], rect.top],
    testPoint: (rect: IRect, diff: number, _: number) => Point.add(rect.center, [0, -diff])
  }, {
    desc: 'left',
    comparePoint: (rect: IRect, _: number, __: number) => [rect.left, rect.center[1]],
    testPoint: (rect: IRect, diff: number, _: number) => Point.add(rect.center, [-diff, 0])
  }, {
    desc: 'right',
    comparePoint: (rect: IRect, _: number, __: number) => [rect.right, rect.center[1]],
    testPoint: (rect: IRect, diff: number, _: number) => Point.add(rect.center, [diff, 0])
  }, {
    desc: 'bottom more right',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.center[0] + diff_2, rect.bottom],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [diff_2, diff_1]),
  }, {
    desc: 'bottom more left',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.center[0] - diff_2, rect.bottom],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [-diff_2, diff_1]),
  }, {
    desc: 'top more right',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.center[0] + diff_2, rect.top],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [diff_2, -diff_1])
  }, {
    desc: 'top more left',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.center[0] - diff_2, rect.top],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [-diff_2, -diff_1])
  }, {
    desc: 'left more higher',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.left, rect.center[1] - diff_2],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [-diff_1, -diff_2])
  }, {
    desc: 'left less higher',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.left, rect.center[1] + diff_2],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [-diff_1, diff_2])
  }, {
    desc: 'right more higher',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.right, rect.center[1] - diff_2],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [diff_1, -diff_2])
  }, {
    desc: 'right less higher',
    comparePoint: (rect: IRect, _: number, diff_2: number) => [rect.right, rect.center[1] + diff_2],
    testPoint: (rect: IRect, diff_1: number, diff_2: number) => Point.add(rect.center, [diff_1, diff_2])
  }];
  describe('geometry.rect.getNearestPointOnEdge', () => {
    directions.forEach((dir) => {
      test(dir.desc, () => {
        for (let size of sizesArr) {
          for (let center of centers) {
            rect = Rect.fromCenter(size, size, center);
            diffs_1.forEach((diff_1) => {
              diffs_2.forEach((diff_2) => {
                expect(Rect.getNearestPointOnEdge(dir.testPoint(rect, diff_1, diff_2), rect.leftTop, rect.rightBottom))
                  .toEqual(dir.comparePoint(rect, diff_1, diff_2))
              })

            })
          }
        }
      })
    })
  });

  describe('geometry.rect.getNearestPointOnRotatedEdge', () => {
    const getMatrix = (center: IPoint, angle: number) => Operator.rotateAtPoint(center, angle, 'deg');
    let matrix: IMatrix;
    let rotatedRect: IRect;
    let rotatedTestPoint: IPoint;
    let rotatedComparePoint: IPoint;
    let resultPoint: IPoint;

    directions.forEach((dir) => {
      test(dir.desc, () => {
        for (let size of sizesArr) {
          for (let center of centers) {
            rect = Rect.fromCenter(size, size, center);
            diffs_1.forEach((diff_1) => {
              diffs_2.forEach((diff_2) => {
                for (let angle = 0; angle < 360; angle += 10) {
                  // Начинаем с неповёрнтуого прямоугольника и неповёрнутых
                  // точек тестирования и сравнения

                  // вычисляем матрицу поворота относительно центра с заданным углом
                  matrix = getMatrix(rect.center, angle);

                  // Этой матрицей трансформируем углы
                  const {rectPoints, points} = Rect.applyTransformExtended(rect, matrix);

                  // Дозаполняю объект до IRect
                  rotatedRect = {
                    ...rect,
                    ...rectPoints,
                    points: points as [IPoint, IPoint, IPoint, IPoint],
                  }

                  // Поворачиваем точку тестирования и сравнения
                  rotatedComparePoint = Matrix.apply(matrix, dir.comparePoint(rect, diff_1, diff_2));
                  rotatedTestPoint = Matrix.apply(matrix, dir.testPoint(rect, diff_1, diff_2));

                  resultPoint = Rect.getNearestPointOnRotatedEdge(rotatedTestPoint, rotatedRect);
                  // Так как точка повёрнута, то будет много знаков после запятой, поэтому через approximately
                  expect(approximately(resultPoint[0], rotatedComparePoint[0])).toBeTruthy();
                  expect(approximately(resultPoint[1], rotatedComparePoint[1])).toBeTruthy();
                }
              })

            })
          }
        }
      })
    })
  })

}

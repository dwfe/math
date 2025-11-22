import {Bezier} from '../../../geometry/bezier';
import {IPoint, IRect, Rect} from '../../../geometry';
import {IMatrix, Matrix, Operator} from '../../../linear-algebra';
import {approximately} from '../../../util/approximately';
import {ICurveIntersections} from './contracts';

describe('geometry.bezier.minMaxAtAxis', () => {
  let res: [number, number]
  let p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint
  let transform: IMatrix

  function checkResult(shouldBeMin: number, shouldBeMax: number, precision?: number) {
    expect(res.length).toEqual(2)
    try {
      expect(res[0]).toEqual(shouldBeMin)
    } catch (err) {
      expect(approximately(res[0], shouldBeMin, precision)).toBe(true)
    }

    try {
      expect(res[1]).toEqual(shouldBeMax)
    } catch (err) {
      expect(approximately(res[1], shouldBeMax, precision)).toBe(true)
    }
  }

  test('Прямая линия, параллельная Y', () => {
    p0 = [0, 0];
    p1 = [0, 1];
    p2 = [0, 2];
    p3 = [0, 3];
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 1)
    checkResult(0, 3)
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 0)
    checkResult(0, 0)
    res = Bezier.minMaxAtAxis(p3, p2, p1, p0, 1)
    checkResult(0, 3)
    res = Bezier.minMaxAtAxis(p3, p2, p1, p0, 0)
    checkResult(0, 0)
  })
  test('Прямая линия, параллельная X', () => {
    p0 = [0, 0];
    p1 = [1, 0];
    p2 = [2, 0];
    p3 = [3, 0];
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 0)
    checkResult(0, 3)
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 1)
    checkResult(0, 0)
    res = Bezier.minMaxAtAxis(p3, p2, p1, p0, 0)
    checkResult(0, 3)
    res = Bezier.minMaxAtAxis(p3, p2, p1, p0, 1)
    checkResult(0, 0)
  })
  test('Косая прямая', () => {
    p0 = [0, 0];
    p1 = [1, 1];
    p2 = [2, 2];
    p3 = [3, 3]
    for (let axis of [0, 1]) {
      res = Bezier.minMaxAtAxis(p0, p1, p2, p3, axis as 0 | 1)
      checkResult(0, 3)
    }

    for (let axis of [0, 1]) {
      res = Bezier.minMaxAtAxis(p3, p2, p1, p0, axis as 0 | 1)
      checkResult(0, 3)
    }
  })
  test('Точка', () => {
    p0 = p1 = p2 = p3 = [5, 5];
    for (let axis of [0, 1]) {
      res = Bezier.minMaxAtAxis(p0, p1, p2, p3, axis as 0 | 1)
      checkResult(5, 5)
    }
  })
  test('Кривая 1', () => {
    // https://jsfiddle.net/FatBass/sfx9jtqp/8/
    // https://jsfiddle.net/FatBass/sfx9jtqp/15/
    // https://jsfiddle.net/FatBass/sfx9jtqp/16/
    // https://jsfiddle.net/FatBass/sfx9jtqp/14/

    p0 = [0, 0], p1 = [150, 300], p2 = [150, 300], p3 = [300, 0]
    for (let i = 0; i < 4; i++) {
      transform = Operator.rotateAtPoint([150, 150], i * 90, 'deg')
      res = Bezier.minMaxAtAxis(
        Matrix.apply(transform, p0),
        Matrix.apply(transform, p1),
        Matrix.apply(transform, p2),
        Matrix.apply(transform, p3),
        i % 2 ? 1 : 0
      )
      checkResult(0, 300)
    }
  })
  test('Кривая 2', () => {
    // https://jsfiddle.net/FatBass/h4256pu9/3/
    // https://jsfiddle.net/FatBass/usozad1t/10/
    p0 = [0, 0], p1 = [300, 150], p2 = [0, 150], p3 = [300, 300];
    for (let i = 0; i < 2; i++) {
      for (let axis of [0, 1]) {
        transform = Operator.rotateAtPoint([150, 150], i * 90, 'deg')
        res = Bezier.minMaxAtAxis(
          Matrix.apply(transform, p0),
          Matrix.apply(transform, p1),
          Matrix.apply(transform, p2),
          Matrix.apply(transform, p3),
          axis as 0 | 1
        )
        checkResult(0, 300)
      }
    }
  })
  test('Кривая 3', () => {
    // https://jsfiddle.net/FatBass/dra8o3v4/1/
    p0 = [0, 0], p1 = [250, 60], p2 = [0, 172], p3 = [130, 35];
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 0)
    checkResult(0, 130)

    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 1)
    // 100.24882818528314 Посчитано вручную, могут быть неточности
    checkResult(0, 100.24, 0.01)
  })
  test('Кривая 4', () => {
    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 0)
    checkResult(4.58, 6.7, 0.1)

    res = Bezier.minMaxAtAxis(p0, p1, p2, p3, 1)
    checkResult(2, 3.149, 0.001)
  })
});

describe('geometry.bezier.fitToRect', () => {
  let p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint
  let res: IRect

  function checkResult(shouldBeRect: IRect, precision?: number) {
    return approximately(res.width, shouldBeRect.width, precision) &&
      approximately(res.height, shouldBeRect.height, precision) &&
      approximately(res.center[0], shouldBeRect.center[0], precision) &&
      approximately(res.center[1], shouldBeRect.center[1], precision)
  }

  test('Прямая линия, параллельная Y', () => {
    p0 = [0, 0];
    p1 = [0, 1];
    p2 = [0, 2];
    p3 = [0, 3];
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(0, 3, [0, 1.5]))
  })

  test('Прямая линия, параллельная X', () => {
    p0 = [0, 0];
    p1 = [1, 0];
    p2 = [2, 0];
    p3 = [3, 0];
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(3, 0, [1.5, 0]))
  })

  test('Косая прямая', () => {
    p0 = [0, 0];
    p1 = [1, 1];
    p2 = [2, 2];
    p3 = [3, 3]
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(3, 3, [1.5, 1.5]))
  })

  test('Точка', () => {
    p0 = p1 = p2 = p3 = [5, 5];
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(0, 0, p0))
  })

  test('Кривая 1', () => {
    // https://jsfiddle.net/FatBass/sfx9jtqp/8/
    p0 = [0, 0], p1 = [150, 300], p2 = [150, 300], p3 = [300, 0]
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(300, 225, [150, 112.5]))
  })

  test('Кривая 2', () => {
    // https://jsfiddle.net/FatBass/h4256pu9/3/
    p0 = [0, 0], p1 = [300, 150], p2 = [0, 150], p3 = [300, 300];
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCenter(300, 300, [150, 150]))
  })

  test('Кривая 3', () => {
    // https://jsfiddle.net/FatBass/dra8o3v4/1/
    p0 = [0, 0], p1 = [250, 60], p2 = [0, 172], p3 = [130, 35];
    res = Bezier.fitToRect(p0, p1, p2, p3)
    checkResult(Rect.fromCornerPoint(130, 100.25, [0, 0], 'leftTop'), 0.01)
  })

  test('Кривая 4', () => {
    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    res = Bezier.fitToRect(p0, p1, p2, p3)
    let left = 4.5825
    let top = 2
    checkResult(
      Rect.fromCornerPoint(
        6.5955 - left,
        3.1495 - top,
        [left, top],
        'leftTop'),
      0.001
    )
  })
})

describe('geometry.bezier.getXbyY', () => {
  let p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint
  let rect: IRect
  let intersectionResult: ICurveIntersections

  test('Линия не пересекает rect', () => {
    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    rect = Bezier.fitToRect(p0, p1, p2, p3)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [rect.left - 1, rect.top - 1], 0, false)
    expect(intersectionResult.dontIntersect).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [rect.left - 1, rect.bottom + 1], 0, false)
    expect(intersectionResult.dontIntersect).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [rect.right + 1, rect.bottom + 1], 0, false)
    expect(intersectionResult.dontIntersect).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [rect.right + 1, rect.top - 1], 0, false)
    expect(intersectionResult.dontIntersect).toBe(true)
  })
  test('Прямая линия, параллельная Y, одно пересечение', () => {
    p0 = [0, 0];
    p1 = [0, 1];
    p2 = [0, 2];
    p3 = [0, 3];
    rect = Bezier.fitToRect(p0, p1, p2, p3)
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p0, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p0)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p1, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p1)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p2, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p2)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p3, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p3)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [1.5, 1.5], 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual([0, 1.5])
  })
  test('Прямая линия, параллельная X, одно пересечение', () => {
    p0 = [0, 0];
    p1 = [1, 0];
    p2 = [2, 0];
    p3 = [3, 0];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p0, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p0)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p1, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p1)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p2, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p2)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p3, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual(p3)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [1.5, 1.5], 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(intersectionResult.intersections![0].point).toEqual([1.5, 0])
  })
  test('Косая, одно пересечение', () => {
    p0 = [0, 0];
    p1 = [1, 1];
    p2 = [2, 2];
    p3 = [3, 3];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p0, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(approximately(intersectionResult.intersections![0].point[0], p0[0])).toBe(true)
    expect(approximately(intersectionResult.intersections![0].point[1], p0[1])).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p1, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(approximately(intersectionResult.intersections![0].point[0], p1[0])).toBe(true)
    expect(approximately(intersectionResult.intersections![0].point[1], p1[1])).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p2, 0, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(approximately(intersectionResult.intersections![0].point[0], p2[0])).toBe(true)
    expect(approximately(intersectionResult.intersections![0].point[1], p2[1])).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p3, 1, false)
    expect(intersectionResult.intersections?.length).toEqual(1)
    expect(approximately(intersectionResult.intersections![0].point[0], p3[0])).toBe(true)
    expect(approximately(intersectionResult.intersections![0].point[1], p3[1])).toBe(true)


  })
  test('Безье совпадает с прямой', () => {
    p0 = [0, 0];
    p1 = [1, 0];
    p2 = [2, 0];
    p3 = [3, 0];

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p0, 0, false)
    expect(intersectionResult.isSameLine).toBe(true)

    p0 = [0, 0];
    p1 = [0, 1];
    p2 = [0, 2];
    p3 = [0, 3];

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, p0, 1, false)
    expect(intersectionResult.isSameLine).toBe(true)
  })
  test('Кривая, одно пересечение', () => {
    // https://jsfiddle.net/FatBass/sfx9jtqp/8/
    p0 = [0, 0], p1 = [150, 300], p2 = [150, 300], p3 = [300, 0];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [50, 300], 1, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[1], 98.8125, 0.0005)).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [250, 300], 1, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[1], 98.8125, 0.0005)).toBe(true)

    // https://jsfiddle.net/FatBass/h4256pu9/3/
    p0 = [0, 0], p1 = [300, 150], p2 = [0, 150], p3 = [300, 300];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [50, 50], 0, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[0], 86.9995, 0.0005)).toBe(true)

    p0 = [0, 0], p1 = [300, 150], p2 = [0, 150], p3 = [300, 300];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [50, 230], 0, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[0], 187.2215, 0.0005)).toBe(true)

    // https://jsfiddle.net/FatBass/dra8o3v4/1/
    p0 = [0, 0], p1 = [250, 60], p2 = [0, 172], p3 = [130, 35];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [120, 0], 1, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[1], 45.8775, 0.0005)).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [40, 12], 0, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[0], 41.8545, 0.0005)).toBe(true)

    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [0, 2.2], 0, false)
    expect(intersectionResult.intersections?.length).toBe(1)
    expect(approximately(intersectionResult.intersections![0].point[0], 6.2255, 0.0005)).toBe(true)
  })
  test('Кривая, два пересечения', () => {
    // https://jsfiddle.net/FatBass/sfx9jtqp/8/
    p0 = [0, 0], p1 = [150, 300], p2 = [150, 300], p3 = [300, 0]
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [0, 0], 0, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[0], 0, 0.0005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[0], 300, 0.0005)).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [0, 50], 0, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[0], 25.0615, 0.0005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[0], 300 - 25.0615, 0.0005)).toBe(true)

    // https://jsfiddle.net/FatBass/s4m8j2nL/1/
    p0 = [0, 0], p1 = [250, 60], p2 = [0, 172], p3 = [78, 50];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [0, 60], 0, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[0], 72.0382, 0.002)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[0], 112.235, 0.005)).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [100, 0], 1, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[1], 42.935, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[1], 96.209, 0.005)).toBe(true)

    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [0, 3], 0, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[0], 4.6065, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[0], 5.8125, 0.005)).toBe(true)

    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [6, 0], 1, false)
    expect(intersectionResult.intersections?.length).toBe(2)
    expect(approximately(intersectionResult.intersections![0].point[1], 2.145, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[1], 2.945, 0.005)).toBe(true)

  })
  test('Кривая, три пересечения', () => {
    // https://jsfiddle.net/FatBass/s4m8j2nL/1/
    p0 = [0, 0], p1 = [250, 60], p2 = [0, 172], p3 = [78, 50];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [70, 70], 1, false)
    expect(intersectionResult.intersections?.length).toBe(3)
    expect(approximately(intersectionResult.intersections![0].point[1], 23.4335, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[1], 63.8515, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![2].point[1], 103.1615, 0.005)).toBe(true)


    // https://jsfiddle.net/FatBass/j0racnxw/3/
    p0 = [5, 2], p1 = [10, 2.5], p2 = [2, 4], p3 = [5.5, 2.5]
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [5, 0], 1, false)
    expect(intersectionResult.intersections?.length).toBe(3)
    expect(approximately(intersectionResult.intersections![0].point[1], 2, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[1], 2.7325, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![2].point[1], 3.1445, 0.005)).toBe(true)

    // https://jsfiddle.net/FatBass/kL36s4ca/1/
    p0 = [0, 0], p1 = [20, 255], p2 = [257, -110], p3 = [264, 100];
    intersectionResult = Bezier.getXbyY(p0, p1, p2, p3, [108.1, 50], 0, false)
    expect(intersectionResult.intersections?.length).toBe(3)
    expect(approximately(intersectionResult.intersections![0].point[0], 8.7665, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![1].point[0], 168.8465, 0.005)).toBe(true)
    expect(approximately(intersectionResult.intersections![2].point[0], 253.9455, 0.005)).toBe(true)

    // Максимальное количество пересечений кубической кривой Безье с прямой линией - 3 вроде как.

  })

})

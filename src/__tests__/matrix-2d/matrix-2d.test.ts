import {describe, expect} from '@jest/globals'
import {TWebMatrix, WebMatrix} from '../../web-transform'
import {AngleType, Point} from '../../geometry'

describe(`matrix-2d`, () => {

  test(`1*2 !== 2*1`, () => { // matrix multiplication is not commutative
    const m1 = WebMatrix.of([1, 2, 3, 4, 5, 6])
    const m2 = WebMatrix.of([6, 5, 4, 3, 2, 1])
    const multiply1 = m1.multiply(m2)
    const multiply2 = m2.multiply(m1)
    expect(multiply1.isEqual(multiply2)).toBeFalsy()
  })

  test(`inversion #1`, () => {
    const m = WebMatrix.of([-1.04368, -0.200666, -0.180935, 1.6125, -9, 5]);
    const invM = m.invert();
    const multiply1 = invM?.multiply(m) as WebMatrix
    const multiply2 = m.multiply(invM as WebMatrix)
    expect(multiply1.isEqual(multiply2)).toBeTruthy();
    expect(multiply1.isEqual(m.multiply(WebMatrix.of()))).toBeFalsy();
  })

  test(`inversion #2`, () => {
    expect(WebMatrix.isEqual(
      WebMatrix.invert([2, 2, -1, 2, 0, 0]),
      [1 / 3, -(1 / 3), 1 / 6, 1 / 3, 0, 0]
    )).toBeTruthy();
  })

  test(`translate`, () => {
    const m = WebMatrix.of().translate(1, 10).translateX(-10).translateY(-5)
    expect(m.isEqual(WebMatrix.of([1, 0, 0, 1, -9, 5]))).toBeTruthy()
    expect(m.isEqual(WebMatrix.of())).toBeFalsy()
  })

  test(`scale`, () => {
    const m = WebMatrix.of().scale(1.5).scaleX(-0.7).scaleY(1.1)
    expect(m.isEqual(WebMatrix.of([-1.05, 0, 0, 1.65, 0, 0]))).toBeTruthy()
    expect(m.isEqual(WebMatrix.of())).toBeFalsy()
  })

  test(`rotate`, () => {
    const m = WebMatrix.of().rotate(-10)
    expect(m.isEqual(WebMatrix.of([0.984808, -0.173648, 0.173648, 0.984808, 0, 0]))).toBeTruthy()
    expect(m.isEqual(WebMatrix.of())).toBeFalsy()
  })

  test(`skew`, () => {
    const m = WebMatrix.of().skew(5, 5).skewX(-5).skewY(-2)
    expect(m.isEqual(WebMatrix.of([1, 0.0528352, 0, 0.992346, 0, 0]))).toBeTruthy()
    expect(m.isEqual(WebMatrix.of())).toBeFalsy()
  })

  test(`full matrix-2d`, () => {
    // translate(1px, 10px) translateX(-10px) translateY(-5px) scale(1.5) scaleX(-0.7) scaleY(1.1) rotate(-10deg) skew(5deg, 5deg) skewX(-5deg) skewY(-2deg)
    const m = WebMatrix.of()
      .translate(1, 10).translateX(-10).translateY(-5)
      .scale(1.5).scaleX(-0.7).scaleY(1.1)
      .rotate(-10)
      .skew(5, 5).skewX(-5).skewY(-2)
    expect(m.isEqual(WebMatrix.of([-1.04368, -0.200666, -0.180935, 1.6125, -9, 5]))).toBeTruthy()
    expect(m.isEqual(WebMatrix.of())).toBeFalsy()
  })

  test(`apply to point #1`, () => {
    const p = Point.of(WebMatrix.of([1, 2, 3, 4, 4, 5]).apply([20, 30]))
    expect(p.isEqual([114, 165])).toBeTruthy()
    expect(p.isEqual([0, 0])).toBeFalsy()
  })

  test(`apply to point #2`, () => {
    const p = Point.of(WebMatrix.of([0.9, -0.05, -0.375, 1.375, 220, 20]).apply([200, 80]))
    expect(p.isEqual([370, 120])).toBeTruthy()
    expect(p.isEqual([0, 0])).toBeFalsy()
  })

  test(`scaleAtPoint`, () => {
    const scaledAtPoint = WebMatrix.scaleAtPoint([40, 40], 1.25)
    const correctResult: TWebMatrix = [1.25, 0, 0, 1.25, -10, -10];
    expect(WebMatrix.isEqual(scaledAtPoint, correctResult)).toBeTruthy()
    expect(WebMatrix.isEqual(scaledAtPoint, [1.25, 0, 0, 1.25, -10, 0])).toBeFalsy()
    expect(WebMatrix.isEqual(
      WebMatrix.multiplySequence([
        [1, 0, 0, 1, 40, 40],
        WebMatrix.scaleIdentity(1.25, 1.25),
        [1, 0, 0, 1, -40, -40],
      ]),
      correctResult
    )).toBeTruthy()
    expect(WebMatrix.isEqual(
      WebMatrix.of().translate(40).scale(1.25).translate(-40).m,
      correctResult
    )).toBeTruthy()
  })

  test(`rotateAtPoint`, () => {
    const rotateAtPoint = WebMatrix.rotateAtPoint([50, 45], 45, AngleType.DEGREES)
    const correctResult: TWebMatrix = [0.707107, 0.707107, -0.707107, 0.707107, 46.4645, -22.1751];
    expect(WebMatrix.isEqual(rotateAtPoint, correctResult)).toBeTruthy()
    expect(WebMatrix.isEqual(rotateAtPoint, [0.717107, 0.707107, -0.707107, 0.707107, 46.4645, -22.1751])).toBeFalsy()
    expect(WebMatrix.isEqual(
      WebMatrix.multiplySequence([
        [1, 0, 0, 1, 50, 45],
        WebMatrix.rotateIdentity(45, AngleType.DEGREES),
        [1, 0, 0, 1, -50, -45],
      ]),
      correctResult
    )).toBeTruthy()
    expect(WebMatrix.isEqual(
      WebMatrix.of().translate(50, 45).rotate(45, AngleType.DEGREES).translate(-50, -45).m,
      correctResult
    )).toBeTruthy()
  })

  test(`toNewCoordinateSystem`, () => {

    const valueToPixel = WebMatrix.toNewCoordinateSystem(
      {fromSegment: 2, toSegment: 28}, // x
      {fromSegment: 3, toSegment: 42}, // y
      {fromPoint: [15, 1], toPoint: [210, 14]}
    );
    const pixelToValue = WebMatrix.invert(valueToPixel)

    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [0, 0]), [0, 0]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [2, 3]), [28, 42]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [6, 14]), [84, 196]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [10, 5]), [140, 70]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [15, 1]), [210, 14]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [21, 7]), [294, 98]))
    expect(Point.isEqual(WebMatrix.apply(valueToPixel, [27, 9]), [378, 126]))

    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [0, 0]), [0, 0]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [28, 42]), [2, 3]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [84, 196]), [6, 14]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [140, 70]), [10, 5]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [210, 14]), [15, 1]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [294, 98]), [21, 7]))
    expect(Point.isEqual(WebMatrix.apply(pixelToValue, [378, 126]), [27, 9]))

    //
    // http://mathprofi.ru/perehod_k_novomu_bazisu.html
    //
    // const perehod1: TWebMatrix = [2, 2, -1, 1, 0, 0];
    // const inverted1 = WebMatrix.invert(perehod1);
    //
    // const newToOld = (p: TPoint, p0): TPoint => {
    //   return Point.add(WebMatrix.apply(perehod1, p), p0)
    // }
    // const oldToNew = (p: TPoint, p0): TPoint => {
    //   const p01 = Point.k(-1)(WebMatrix.apply(inverted1, p0))
    //   return Point.add(WebMatrix.apply(inverted1, p), p01)
    // }
    // console.log(`new [1,1] to old`,newToOld([1,1], [2,2]))
    // console.log(`new [0,-1] to old`,newToOld([0,-1], [2,2]))
    // console.log(`new [0,0] to old`,newToOld([0,0], [2,2]))
    // console.log(`old to new [0,0]`, oldToNew([0, 0], [2, 2]))
    // console.log(`old to new [2,2]`, oldToNew([2, 2], [2, 2]))
    // console.log(`old to new [3, 5]`, oldToNew([3, 5], [2, 2]))
    // console.log(`old to new [3, 1]`, oldToNew([3, 1], [2, 2]))
  })

})

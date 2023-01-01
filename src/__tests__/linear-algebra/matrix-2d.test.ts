import '@do-while-for-each/test';
import {IMatrix, LinearOperator, Matrix} from '../../linear-algebra'
import {Point} from '../../geometry';

describe(`web-matrix-2d`, () => {

  test(`1*2 !== 2*1`, () => { // matrix multiplication is not commutative
    const m1 = Matrix.of([1, 2, 3, 4, 5, 6])
    const m2 = Matrix.of([6, 5, 4, 3, 2, 1])
    const multiply1 = m1.multiply(m2)
    const multiply2 = m2.multiply(m1)
    expect(multiply1.equals(multiply2)).toBeFalsy()
  })

  test(`inversion #1`, () => {
    const m = Matrix.of([-1.04368, -0.200666, -0.180935, 1.6125, -9, 5]);
    const invM = m.invert();
    const multiply1 = invM.multiply(m)
    const multiply2 = m.multiply(invM)
    expect(multiply1.equals(multiply2)).toBeTruthy();
    expect(multiply1.equals(m.multiply(Matrix.of()))).toBeFalsy();
  })

  test(`inversion #2`, () => {
    expect(Matrix.isEqual(
      Matrix.invert([2, 2, -1, 2, 0, 0]),
      [1 / 3, -(1 / 3), 1 / 6, 1 / 3, 0, 0]
    )).toBeTruthy();
  })

  test(`translate`, () => {
    const m = Matrix.of().translate(1, 10).translateX(-10).translateY(-5)
    expect(m.equals(Matrix.of([1, 0, 0, 1, -9, 5]))).toBeTruthy()
    expect(m.equals(Matrix.of())).toBeFalsy()
  })

  test(`scale`, () => {
    const m = Matrix.of().scale(1.5).scaleX(-0.7).scaleY(1.1)
    expect(m.equals(Matrix.of([-1.05, 0, 0, 1.65, 0, 0]))).toBeTruthy()
    expect(m.equals(Matrix.of())).toBeFalsy()
  })

  test(`rotate`, () => {
    const m = Matrix.of().rotate(-10)
    expect(m.equals(Matrix.of([0.984808, -0.173648, 0.173648, 0.984808, 0, 0]))).toBeTruthy()
    expect(m.equals(Matrix.of())).toBeFalsy()
  })

  test(`skew`, () => {
    const m = Matrix.of().skew(5, 5).skewX(-5).skewY(-2)
    expect(m.equals(Matrix.of([1, 0.0528352, 0, 0.992346, 0, 0]))).toBeTruthy()
    expect(m.equals(Matrix.of())).toBeFalsy()
  })

  test(`full matrix-2d`, () => {
    // translate(1px, 10px) translateX(-10px) translateY(-5px) scale(1.5) scaleX(-0.7) scaleY(1.1) rotate(-10deg) skew(5deg, 5deg) skewX(-5deg) skewY(-2deg)
    const m = Matrix.of()
      .translate(1, 10).translateX(-10).translateY(-5)
      .scale(1.5).scaleX(-0.7).scaleY(1.1)
      .rotate(-10)
      .skew(5, 5).skewX(-5).skewY(-2)
    expect(m.equals(Matrix.of([-1.04368, -0.200666, -0.180935, 1.6125, -9, 5]))).toBeTruthy()
    expect(m.equals(Matrix.of())).toBeFalsy()
  })

  test(`apply to point #1`, () => {
    const p = Point.of(Matrix.of([1, 2, 3, 4, 4, 5]).apply([20, 30]))
    expect(p.equals([114, 165])).toBeTruthy()
    expect(p.equals([0, 0])).toBeFalsy()
  })

  test(`apply to point #2`, () => {
    const p = Point.of(Matrix.of([0.9, -0.05, -0.375, 1.375, 220, 20]).apply([200, 80]))
    expect(p.equals([370, 120])).toBeTruthy()
    expect(p.equals([0, 0])).toBeFalsy()
  })

  test(`scaleAtPoint`, () => {
    const scaledAtPoint = LinearOperator.scaleAtPoint([40, 40], 1.25)
    const correctResult: IMatrix = [1.25, 0, 0, 1.25, -10, -10];
    expect(Matrix.isEqual(scaledAtPoint, correctResult)).toBeTruthy()
    expect(Matrix.isEqual(scaledAtPoint, [1.25, 0, 0, 1.25, -10, 0])).toBeFalsy()
    expect(Matrix.isEqual(
      Matrix.multiplySequence([
        [1, 0, 0, 1, 40, 40],
        Matrix.scaleIdentity(1.25, 1.25),
        [1, 0, 0, 1, -40, -40],
      ]),
      correctResult
    )).toBeTruthy()
    expect(Matrix.isEqual(
      Matrix.of().translate(40).scale(1.25).translate(-40).m,
      correctResult
    )).toBeTruthy()
  })

  test(`rotateAtPoint`, () => {
    const rotateAtPoint = LinearOperator.rotateAtPoint([50, 45], 45, 'deg')
    const correctResult: IMatrix = [0.707107, 0.707107, -0.707107, 0.707107, 46.4645, -22.1751];
    expect(Matrix.isEqual(rotateAtPoint, correctResult)).toBeTruthy()
    expect(Matrix.isEqual(rotateAtPoint, [0.717107, 0.707107, -0.707107, 0.707107, 46.4645, -22.1751])).toBeFalsy()
    expect(Matrix.isEqual(
      Matrix.multiplySequence([
        [1, 0, 0, 1, 50, 45],
        Matrix.rotateIdentity(45, 'deg'),
        [1, 0, 0, 1, -50, -45],
      ]),
      correctResult
    )).toBeTruthy()
    expect(Matrix.isEqual(
      Matrix.of().translate(50, 45).rotate(45, 'deg').translate(-50, -45).m,
      correctResult
    )).toBeTruthy()
  })

  test(`proportionsConverter #1`, () => {

    const pixelToValue = LinearOperator.proportionsConverter(
      {fromSegment: 2, toSegment: 28}, // x
      {fromSegment: 3, toSegment: 42}, // y
      [[15, 1], [210, 14]]
    );
    const valueToPixel = Matrix.invert(pixelToValue)

    expect(Point.isEqual(Matrix.apply(pixelToValue, [0, 0]), [0, 0]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [2, 3]), [28, 42]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [6, 14]), [84, 196]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [10, 5]), [140, 70]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [15, 1]), [210, 14]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [21, 7]), [294, 98]))
    expect(Point.isEqual(Matrix.apply(pixelToValue, [27, 9]), [378, 126]))

    expect(Point.isEqual(Matrix.apply(valueToPixel, [0, 0]), [0, 0]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [28, 42]), [2, 3]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [84, 196]), [6, 14]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [140, 70]), [10, 5]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [210, 14]), [15, 1]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [294, 98]), [21, 7]))
    expect(Point.isEqual(Matrix.apply(valueToPixel, [378, 126]), [27, 9]))

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

  test(`proportionsConverter #2`, () => {

    const block = {
      topLeftY: 15,
      height: 175,
      topIndent: 10,
      bottomIndent: 15,
    };

    const fromTo = LinearOperator.proportionsConverter(
      {fromSegment: 30, toSegment: 30 * 14}, // x
      {fromSegment: 15, toSegment: block.height - (block.topIndent + block.bottomIndent)}, // y
      [[0, 0], [0, block.bottomIndent]]
    );
    //  const valueToPixel = WebMatrix.invert(fromTo)

    expect(Point.isEqual(Matrix.apply(fromTo, [0, 0]), [0, block.bottomIndent]))
    expect(Point.isEqual(Matrix.apply(fromTo, [30, 15]), [0, block.bottomIndent]))
  })

  test('isEqual', () => {
    expect(Matrix.isEqual(undefined as any, [1, 0, 0, 1, 0, 0])).False();
    expect(Matrix.isEqual([1, 0, 0, 1, 0, 0], undefined as any)).False();
    expect(Matrix.isEqual(undefined as any, null as any)).False();
    expect(Matrix.isEqual([1, 0, 0, 1, 0, 0], [1, 0, 0, 1, 0, 0])).True();
  });

  test('isEqualIdentity', () => {
    expect(Matrix.isEqualToIdentity(undefined as any)).False();
    expect(Matrix.isEqualToIdentity([1, 0, 0, 1, 0, 0])).True();
    expect(Matrix.isEqualToIdentity([1.1, 0, 0, 1, 0, 0])).False();
    expect(Matrix.isEqualToIdentity([1, 0, 0, 1, 0, 1])).False();
  });

  test('objectWithMatricesEquals', () => {
    const a = {
      first: [1, 0, 0, 1, 0, 0]
    };
    const b = {
      first: [1, 0, 0, 1, 0, 0]
    };
    const c = {
      first: [1, 0, 0, 1, 0, 0],
      second: [2, 0, 0, 2, 0, 0]
    };
    const d = {
      first: [1, 0, 0, 1, 0, 0],
      second: [2, 0, 0, 2, 0, 0]
    };
    expect(Matrix.areObjectsWithMatricesEqual(a, b)).True();
    expect(Matrix.areObjectsWithMatricesEqual(c, d)).True();
    expect(Matrix.areObjectsWithMatricesEqual(a, c)).False();
    expect(Matrix.areObjectsWithMatricesEqual(c, a)).False();
    expect(Matrix.areObjectsWithMatricesEqual(undefined as any, a)).False();
    expect(Matrix.areObjectsWithMatricesEqual(c, undefined as any)).False();
    expect(Matrix.areObjectsWithMatricesEqual(null, undefined as any)).False();
  });

})

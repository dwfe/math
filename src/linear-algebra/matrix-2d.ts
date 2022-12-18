import {IMatrix, IMatrix2D} from './contract'
import {Angle, IAngleUnit} from '../angle'
import {Tuple2, Tuple6} from '../contract'
import {IPoint} from '../geometry'

const identityMatrix: Tuple6 = [1, 0, 0, 1, 0, 0];

class M { // exported as Matrix

  static of = (m: IMatrix = M.identity()): M => new M(m);

  constructor(public readonly m: IMatrix) {
  }

  determinant = (): number => M.determinant(this.m);

//region Matrix transformations

  invert = (): M => new M(M.invert(this.m))
  multiply = (anotherM: M): M => new M(M.multiply(this.m, anotherM.m));
  multiplyByScalar = (scalar: number): M => new M(M.multiplyByScalar(this.m, scalar));

  translate = (tx: number, ty: number = tx): M => new M(M.translate(this.m, tx, ty));
  translateX = (t: number): M => new M(M.translateX(this.m, t));
  translateY = (t: number): M => new M(M.translateY(this.m, t));

  scale = (sx: number, sy: number = sx): M => new M(M.scale(this.m, sx, sy));
  scaleX = (s: number): M => new M(M.scaleX(this.m, s));
  scaleY = (s: number): M => new M(M.scaleY(this.m, s));

  rotate = (angle: number, unit?: IAngleUnit): M => new M(M.rotate(this.m, angle, unit));
  // rotateX   ! The resulting matrix for rotateX and rotateY !
  // rotateY   ! can only be described using matrix3d         !

  skew = (ax: number, ay: number = ax, unit?: IAngleUnit): M => new M(M.skew(this.m, ax, ay, unit));
  skewX = (angle: number, unit?: IAngleUnit): M => new M(M.skewX(this.m, angle, unit));
  skewY = (angle: number, unit?: IAngleUnit): M => new M(M.skewY(this.m, angle, unit));

//endregion Matrix transformations


//region Data transformations

  apply = (point: IPoint): Tuple2 => M.apply(this.m, point);

//endregion


  toJSON = (): Tuple6 => [...this.m] as Tuple6;
  toObject = (): IMatrix2D => M.toObject(this.m);
  toString = (): string => M.toString(this.m);
  toStyleValue = (): string => M.toStyleValue(this.m);
  equals = (anotherM: M): boolean => M.isEqual(this.m, anotherM.m);


  /*
   * Identity matrix:
   *                    1 0 0
   * [1,0,0,1,0,0]  =>  0 1 0
   *                    0 0 1
   * https://en.wikipedia.org/wiki/Identity_matrix
   */
  static identity = (): Tuple6 => [...identityMatrix];

  /*
   * The Determinant of a matrix by the Laplace expansion:
   *       a c e
   *   det b d f = 0 - 0 + 1 * (a*d-b*c)
   *       0 0 1
   * https://en.wikipedia.org/wiki/Laplace_expansion
   */
  static determinant = (m: IMatrix): number => m[0] * m[3] - m[1] * m[2];

  /*
   * Inverse matrix: MT' * (1/det)
   *       a c e | where      A B G     1*(d*1-h*f)     (-1)*(c*1-h*e)  1*(c*f-d*e)        d   -c  c*f-d*e
   * MT' = b d f | g = 0  =>  C D H  =  (-1)*(b*1-g*f)  1*(a*1-g*e)     (-1)*(a*f-b*e)  =  -b  a   b*e-a*f
   *       g h 1 | h = 0      E F 1     (-1)*(b*h-g*d)  (-1)*(a*h-g*c)  1                  0   0   1
   * https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices
   */
  static invert(m: IMatrix): Tuple6 {
    const det = M.determinant(m);
    if (det === 0) // matrix is not invertible
      throw new Error(`can't invert matrix ${m} because determinant is 0`)
    return M.multiplyByScalar([
      m[3],
      -m[1],
      -m[2],
      m[0],
      m[2] * m[5] - m[3] * m[4],
      m[1] * m[4] - m[0] * m[5],
    ], 1 / det)
  }

  /*
   * Multiply two matrix:
   *   a1 c1 e1     a2 c2 e2     a1*a2+c1*b2  a1*c2+c1*d2  a1*e2+c1*f2+e1
   *   b1 d1 f1  *  b2 d2 f2  =  b1*a2+d1*b2  b1*c2+d1*d2  b1*e2+d1*f2+f1
   *   0  0  1      0  0  1      0            0            1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#Transformation_functions
   * https://en.wikipedia.org/wiki/Matrix_multiplication
   */
  static multiply = (m1: IMatrix, m2: IMatrix): Tuple6 => [
    m1[0] * m2[0] + m1[2] * m2[1],         // a
    m1[1] * m2[0] + m1[3] * m2[1],         // b
    m1[0] * m2[2] + m1[2] * m2[3],         // c
    m1[1] * m2[2] + m1[3] * m2[3],         // d
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], // e
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]  // f
  ];

  static multiplyByScalar = (m: IMatrix, scalar: number): Tuple6 => [
    m[0] * scalar,
    m[1] * scalar,
    m[2] * scalar,
    m[3] * scalar,
    m[4] * scalar,
    m[5] * scalar,
  ];

  /*
   * Apply the matrix to the point:
   *   a c e     x     a*x+c*y+e
   *   b d f  *  y  =  b*x+d*y+f
   *   0 0 1     1     1
   */
  static apply = (m: IMatrix, p: IPoint): Tuple2 => [
    m[0] * p[0] + m[2] * p[1] + m[4],
    m[1] * p[0] + m[3] * p[1] + m[5]
  ];

  /*
   * Translate is:
   *              1 0 tx
   *   Matrix  *  0 1 ty  =  Matrix'' includes Translate
   *              0 0 1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translateX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translateY
   */
  static translate = (m: IMatrix, tx: number, ty: number): Tuple6 => M.multiply(m, [1, 0, 0, 1, tx, ty]);
  static translateX = (m: IMatrix, t: number): Tuple6 => M.translate(m, t, 0);
  static translateY = (m: IMatrix, t: number): Tuple6 => M.translate(m, 0, t);
  static translateIdentity = (tx: number, ty: number): Tuple6 => M.translate(identityMatrix, tx, ty);

  /*
   * Scale is:
   *              sx  0   0
   *   Matrix  *  0   sy  0  =  Matrix'' includes Scale
   *              0   0   1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scaleX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scaleY
   */
  static scale = (m: IMatrix, sx: number, sy = sx): Tuple6 => M.multiply(m, [sx, 0, 0, sy, 0, 0]);
  static scaleX = (m: IMatrix, s: number): Tuple6 => M.scale(m, s, 1);
  static scaleY = (m: IMatrix, s: number): Tuple6 => M.scale(m, 1, s);
  static scaleIdentity = (sx: number, sy = sx): Tuple6 => M.scale(identityMatrix, sx, sy);

  /*
   * Rotate is:
   *              cos  -sin  0
   *   Matrix  *  sin  cos   0  =  Matrix'' includes Rotate
   *              0    0     1
   * RotateX is:
   *              1  0    0
   *   Matrix  *  0  cos  -sin  =  Matrix'' includes RotateX. Result can only be described using matrix3d!
   *              0  sin  cos
   * RotateY is:
   *              cos   0  sin
   *   Matrix  *  0     1  0    =  Matrix'' includes RotateY. Result can only be described using matrix3d!
   *              -sin  0  cos
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotateX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotateY
   */
  static rotate = (m: IMatrix, angle: number, unit?: IAngleUnit): Tuple6 => {
    const radians = Angle.rad(angle, unit)
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    return M.multiply(m, [cos, sin, -sin, cos, 0, 0])
  }
  static rotateIdentity = (angle: number, unit?: IAngleUnit): Tuple6 => M.rotate(identityMatrix, angle, unit);

  /*
   * Skew is:
   *              1        tan(ax)  0
   *   Matrix  *  tan(ay)  1        0  =  Matrix'' includes Skew
   *              0        0        1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skewX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skewY
   */
  static skew = (m: IMatrix, ax: number, ay: number, unit?: IAngleUnit): Tuple6 =>
    M.multiply(
      m,
      [1, Math.tan(Angle.rad(ay, unit)), Math.tan(Angle.rad(ax, unit)), 1, 0, 0]
    );
  static skewX = (m: IMatrix, angle: number, unit?: IAngleUnit): Tuple6 => M.skew(m, angle, 0, unit);
  static skewY = (m: IMatrix, angle: number, unit?: IAngleUnit): Tuple6 => M.skew(m, 0, angle, unit);
  static skewIdentity = (ax: number, ay: number, unit?: IAngleUnit): Tuple6 => M.skew(identityMatrix, ax, ay, unit);

  static toString = (m: IMatrix): string => m.join(', ');
  static toStyleValue = (m: IMatrix): string => `matrix(${M.toString(m)})`;
  static toObject = (m: IMatrix): IMatrix2D => ({
    a: m[0],
    b: m[1],
    c: m[2],
    d: m[3],
    e: m[4],
    f: m[5],
  });

  static isEqual(a: IMatrix, b: IMatrix, accuracy = 0.0001): boolean {
    if (!a || !b) {
      return false;
    }
    return (
      Math.abs(a[0] - b[0]) < accuracy &&
      Math.abs(a[1] - b[1]) < accuracy &&
      Math.abs(a[2] - b[2]) < accuracy &&
      Math.abs(a[3] - b[3]) < accuracy &&
      Math.abs(a[4] - b[4]) < accuracy &&
      Math.abs(a[5] - b[5]) < accuracy
    )
  }

  static areObjectsWithMatricesEqual(a: any, b: any, accuracy?: number): boolean {
    if (!a || !b) {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length)
      return false;
    for (const aKey of aKeys) {
      if (!bKeys.includes(aKey))
        return false;
      if (!M.isEqual(a[aKey], b[aKey], accuracy))
        return false;
    }
    return true;
  }


//region Multiplication of a sequence of matrices

  /**
   * (1.1)
   *    let m = M.multiply(m1, m2) // m1 * m2
   *        m = M.multiply(m, m3)  // (m1 * m2) * m3
   *
   * (1.2)
   *    let m = identity
   *        m = M.multiply(m, m1) // m1
   *        m = M.multiply(m, m2) // m1 * m2
   *        m = M.multiply(m, m3) // (m1 * m2) * m3
   *
   * (2.1)
   *    let m = M.multiply(m2, m3) // m2 * m3
   *        m = M.multiply(m1, m)  // m1 * (m2 * m3)
   *
   * (2.2)
   *    let m = identity
   *        m = M.multiply(m3, m) // m3
   *        m = M.multiply(m2, m) // m2 * m3
   *        m = M.multiply(m1, m) // m1 * (m2 * m3)
   */
  static multiplySequence(seq: IMatrix[]): Tuple6 {
    let m = identityMatrix;
    for (let i = 0; i < seq.length; i++)
      m = M.multiply(m, seq[i]); // by (1.2)
    return m;
  }

  static multiplySequence3 = (m1: IMatrix, m2: IMatrix, m3: IMatrix): Tuple6 =>
    M.multiply(M.multiply(m1, m2), m3); // by (1.1)

  static multiplySequence4 = (m1: IMatrix, m2: IMatrix, m3: IMatrix, m4: IMatrix): Tuple6 =>
    M.multiply(M.multiplySequence3(m1, m2, m3), m4);

  static multiplySequence5 = (m1: IMatrix, m2: IMatrix, m3: IMatrix, m4: IMatrix, m5: IMatrix): Tuple6 =>
    M.multiply(M.multiplySequence4(m1, m2, m3, m4), m5);

  static multiplySequence6 = (m1: IMatrix, m2: IMatrix, m3: IMatrix, m4: IMatrix, m5: IMatrix, m6: IMatrix): Tuple6 =>
    M.multiply(M.multiplySequence5(m1, m2, m3, m4, m5), m6);

//endregion Multiplication of a sequence of matrices

}

export {
  M as Matrix
}

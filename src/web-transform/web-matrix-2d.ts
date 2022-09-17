import {ISegmentChanging, IWebMatrix, M2x2, TWebMatrix} from './contract'
import {Angle, AngleType, Point, TPoint} from '../geometry'
import {Matrix2x2} from './matrix-2x2'
import {Basis} from './basis'

const identity: TWebMatrix = [1, 0, 0, 1, 0, 0];

class M { // exported as WebMatrix

  static of = (m: TWebMatrix = M.identity()): M => new M(m);

  constructor(public readonly m: TWebMatrix) {
  }

  determinant = (): number => M.determinant(this.m);

//region Matrix transformations

  invert = (): M => M.of(M.invert(this.m))
  multiply = (anotherM: M): M => M.of(M.multiply(this.m, anotherM.m));
  multiplyByScalar = (scalar: number): M => M.of(M.multiplyByScalar(this.m, scalar));

  translate = (tx: number, ty: number = tx): M => M.of(M.translate(this.m, tx, ty));
  translateX = (t: number): M => M.of(M.translateX(this.m, t));
  translateY = (t: number): M => M.of(M.translateY(this.m, t));
  translateInvert = (tx: number, ty: number = tx): M => M.of(M.invert(M.translate(this.m, tx, ty)));

  scale = (sx: number, sy: number = sx): M => M.of(M.scale(this.m, sx, sy));
  scaleX = (s: number): M => M.of(M.scaleX(this.m, s));
  scaleY = (s: number): M => M.of(M.scaleY(this.m, s));

  rotate = (angle: number, angleType?: AngleType): M => M.of(M.rotate(this.m, angle, angleType));
  // rotateX   ! The resulting matrix for rotateX and rotateY !
  // rotateY   ! can only be described using matrix3d         !

  skew = (ax: number, ay: number = ax, angleType?: AngleType): M => M.of(M.skew(this.m, ax, ay, angleType));
  skewX = (angle: number, angleType?: AngleType): M => M.of(M.skewX(this.m, angle, angleType));
  skewY = (angle: number, angleType?: AngleType): M => M.of(M.skewY(this.m, angle, angleType));

//endregion Matrix transformations


//region Data transformations

  apply = (point: TPoint): TPoint => M.apply(this.m, point);

//endregion


  toJSON = (): TWebMatrix => [...this.m];
  toObject = (): IWebMatrix => M.toObject(this.m);
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
  static identity = (): TWebMatrix => [...identity];

  /*
   * The Determinant of a matrix by the Laplace expansion:
   *       a c e
   *   det b d f = 0 - 0 + 1 * (a*d-b*c)
   *       0 0 1
   * https://en.wikipedia.org/wiki/Laplace_expansion
   */
  static determinant = (m: TWebMatrix): number => m[0] * m[3] - m[1] * m[2];

  /*
   * Inverse matrix: MT' * (1/det)
   *       a c e | where      A B G     1*(d*1-h*f)     (-1)*(c*1-h*e)  1*(c*f-d*e)        d   -c  c*f-d*e
   * MT' = b d f | g = 0  =>  C D H  =  (-1)*(b*1-g*f)  1*(a*1-g*e)     (-1)*(a*f-b*e)  =  -b  a   b*e-a*f
   *       g h 1 | h = 0      E F 1     (-1)*(b*h-g*d)  (-1)*(a*h-g*c)  1                  0   0   1
   * https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices
   */
  static invert(m: TWebMatrix): TWebMatrix {
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
  static multiply = (m1: TWebMatrix, m2: TWebMatrix): TWebMatrix => [
    m1[0] * m2[0] + m1[2] * m2[1],         // a
    m1[1] * m2[0] + m1[3] * m2[1],         // b
    m1[0] * m2[2] + m1[2] * m2[3],         // c
    m1[1] * m2[2] + m1[3] * m2[3],         // d
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], // e
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]  // f
  ];

  static multiplyByScalar = (m: TWebMatrix, scalar: number): TWebMatrix => [
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
  static apply = (m: TWebMatrix, p: TPoint): TPoint => [
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
  static translate = (m: TWebMatrix, tx: number, ty: number): TWebMatrix => M.multiply(m, [1, 0, 0, 1, tx, ty]);
  static translateX = (m: TWebMatrix, t: number): TWebMatrix => M.translate(m, t, 0);
  static translateY = (m: TWebMatrix, t: number): TWebMatrix => M.translate(m, 0, t);
  static translateIdentity = (tx: number, ty: number): TWebMatrix => M.translate(identity, tx, ty);

  /*
   * Scale is:
   *              sx  0   0
   *   Matrix  *  0   sy  0  =  Matrix'' includes Scale
   *              0   0   1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scaleX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scaleY
   */
  static scale = (m: TWebMatrix, sx: number, sy = sx): TWebMatrix => M.multiply(m, [sx, 0, 0, sy, 0, 0]);
  static scaleX = (m: TWebMatrix, s: number): TWebMatrix => M.scale(m, s, 1);
  static scaleY = (m: TWebMatrix, s: number): TWebMatrix => M.scale(m, 1, s);
  static scaleIdentity = (sx: number, sy = sx): TWebMatrix => M.scale(identity, sx, sy);

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
  static rotate = (m: TWebMatrix, angle: number, angleType?: AngleType): TWebMatrix => {
    const radians = Angle.rad(angle, angleType)
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    return M.multiply(m, [cos, sin, -sin, cos, 0, 0])
  }
  static rotateIdentity = (angle: number, angleType?: AngleType): TWebMatrix => M.rotate(identity, angle, angleType);

  /*
   * Skew is:
   *              1        tan(ax)  0
   *   Matrix  *  tan(ay)  1        0  =  Matrix'' includes Skew
   *              0        0        1
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skew
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skewX
   * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/skewY
   */
  static skew = (m: TWebMatrix, ax: number, ay: number, angleType?: AngleType): TWebMatrix =>
    M.multiply(m, [1, Math.tan(Angle.rad(ay, angleType)), Math.tan(Angle.rad(ax, angleType)), 1, 0, 0])
  ;
  static skewX = (m: TWebMatrix, angle: number, angleType?: AngleType): TWebMatrix => M.skew(m, angle, 0, angleType);
  static skewY = (m: TWebMatrix, angle: number, angleType?: AngleType): TWebMatrix => M.skew(m, 0, angle, angleType);
  static skewIdentity = (ax: number, ay: number, angleType?: AngleType): TWebMatrix => M.skew(identity, ax, ay, angleType);


  static isEqual = (m1: TWebMatrix, m2: TWebMatrix): boolean =>
    Math.abs(m1[0] - m2[0]) < ACCURACY &&
    Math.abs(m1[1] - m2[1]) < ACCURACY &&
    Math.abs(m1[2] - m2[2]) < ACCURACY &&
    Math.abs(m1[3] - m2[3]) < ACCURACY &&
    Math.abs(m1[4] - m2[4]) < ACCURACY &&
    Math.abs(m1[5] - m2[5]) < ACCURACY
  ;
  static toString = (m: TWebMatrix): string => m.join(', ');
  static toStyleValue = (m: TWebMatrix): string => `matrix(${M.toString(m)})`;
  static toObject = (m: TWebMatrix): IWebMatrix => ({
    a: m[0],
    b: m[1],
    c: m[2],
    d: m[3],
    e: m[4],
    f: m[5],
  });


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
  static multiplySequence(seq: TWebMatrix[]): TWebMatrix {
    let m = identity
    for (let i = 0; i < seq.length; i++)
      m = M.multiply(m, seq[i]) // by (1.2)
    return m;
  }

  static multiplySequence3(m1: TWebMatrix, m2: TWebMatrix, m3: TWebMatrix): TWebMatrix {
    return M.multiply(M.multiply(m1, m2), m3); // by (1.1)
  }

//endregion Multiplication of a sequence of matrices


//region Complex transforms

  /**
   * The algorithm is based on
   *   https://medium.com/@benjamin.botto/zooming-at-the-mouse-coordinates-with-affine-transformations-86e7312fd50b#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjNkZjBhODMxZTA5M2ZhZTFlMjRkNzdkNDc4MzQ0MDVmOTVkMTdiNTQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2MjczMDM4NjQsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExNjczOTgzOTIzODQ1NTk2OTI4NyIsImVtYWlsIjoiZ29uem8uYmFyZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiMjE2Mjk2MDM1ODM0LWsxazZxZTA2MHMydHAyYTJqYW00bGpkY21zMDBzdHRnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwibmFtZSI6IkdvbnpvIEJhcmQiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2hKTEFhenFmT0xpMk9SZXVtWE92WGtsbmJmX21tZHk3MVJYZElTPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkdvbnpvIiwiZmFtaWx5X25hbWUiOiJCYXJkIiwiaWF0IjoxNjI3MzA0MTY0LCJleHAiOjE2MjczMDc3NjQsImp0aSI6ImMyNzA3ZjJhOWQ4YTQ4NzljZDExMGNlOTlhZTQ4NWFmNTdhMjQ4YjgifQ.Wv3Lb8ArxlUqvGrWhDE6JkMm48Cwx8CYANAkoGljovPY1Acveycet2EZm2S1VATqjZEkX6Y-rZzXcdGYe2qAth91TtVishnJSWrtH3P9G5bXR3xP3lQ5rdwWLW8UJ51KnFl2cj5aQy8DOrmXkEAMvBZEwoDEN6StA6ZlyZwv96X1al4OY_q50jFKHUV3oGK4PS4cHWM59lP-fvXJH25D7iio0O3w9gvP3MHHyG7ckhswq1gsaiEbS2XJHrbjLJwLJ4aR8RjGF8Is6uy3gEl5WFI6OHSiW5bA0fWimsKXvbhSbAUGYndWjt7hdy8gKh9aGHnSrSQxnPc6g2s-PCbUtg
   */
  static scaleAtPoint = (p: TPoint, sx: number, sy = sx): TWebMatrix =>
    M.multiplySequence3(
      [1, 0, 0, 1, p[0], p[1]],   // (1) Translate the world such that p is at the origin
      M.scaleIdentity(sx, sy),    // (2) Scale the world
      [1, 0, 0, 1, -p[0], -p[1]], // (3) Translate the world back such that p is at its initial location
    );

  static rotateAtPoint = (p: TPoint, angle: number, angleType?: AngleType): TWebMatrix =>
    M.multiplySequence3(
      [1, 0, 0, 1, p[0], p[1]],           // (1) Translate the world such that p is at the origin
      M.rotateIdentity(angle, angleType), // (2) Rotate the world
      [1, 0, 0, 1, -p[0], -p[1]],         // (3) Translate the world back such that p is at its initial location
    );


  /**
   * If the origin of the new coordinate system is not shifted or rotated,
   * then the transition to the new coordinate system is the usual scaling.
   */
  static proportionsConverterWithoutShiftAndAngle = (onAxisX: ISegmentChanging, onAxisY: ISegmentChanging): TWebMatrix =>
    M.scaleIdentity(
      onAxisX.toSegment / onAxisX.fromSegment,
      onAxisY.toSegment / onAxisY.fromSegment
    );

  static proportionsConverter = (onAxisX: ISegmentChanging, onAxisY: ISegmentChanging, [fromPoint, toPoint]: [TPoint, TPoint]): TWebMatrix =>
    M.multiplySequence3(
      [1, 0, 0, 1, toPoint[0], toPoint[1]],                         // (1) Translate the "World-To" such that toPoint is at the origin
      M.proportionsConverterWithoutShiftAndAngle(onAxisX, onAxisY), // (2) Scale <=> convert "World-From" -> "World-To"
      [1, 0, 0, 1, -fromPoint[0], -fromPoint[1]],                   // (3) Translate the "World-From" back such that fromPoint is at its initial location (EQUIVALENT point from "World-To" toPoint)
    );

  static proportionsAndAngleConverter = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const linearM: M2x2 = [...multiply(to.ltMatrix, invert(from.ltMatrix))]; // FROM-basis -> TO-basis
    const shift = Point.sub(to.o, apply(linearM, from.o));
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

  /**
   * Change of Basis (Professor Dave Explains):
   *   https://youtu.be/HZa1RwFHgwU?t=496
   *
   * @param from - FROM-basis
   * @param to - TO-basis. Decomposed by the FROM-basis!!!
   */
  static changeOfBasisMatrix = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const linearM: M2x2 = [...multiply(invert(to.ltMatrix), from.ltMatrix)]; // FROM-basis -> TO-basis
    const shift = Point.sub(from.o, apply(linearM, to.o));
    if (!Point.isEqual(shift, [0, 0]) && !Point.isEqual(from.o, [0, 0])) {
      throw new Error(`if there is a shift, then point from.o [${from.o}] should be in the center of coordinates [0,0]`);
    }
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

  /**
   * Замена базиса (Мосин):
   *   https://www.youtube.com/watch?v=gF1uo6X6W3M
   *
   * @param from - FROM-basis
   * @param to - TO-basis. Decomposed by the FROM-basis!!!
   */
  static changeOfBasisMatrix2 = (from: Basis, to: Basis): TWebMatrix => {
    const {apply, multiply, invert} = Matrix2x2;
    const byLine: M2x2 = [...multiply(to.centeredMatrixCoef, invert(from.centeredMatrixCoef))];
    let linearM: M2x2 = [byLine[0], byLine[2], byLine[1], byLine[3]]; // converts byLine -> by column
    linearM = invert(linearM); // FROM-basis -> TO-basis
    const shift = Point.sub(from.o, apply(linearM, to.o));
    if (!Point.isEqual(shift, [0, 0]) && !Point.isEqual(from.o, [0, 0])) {
      throw new Error(`if there is a shift, then point from.o [${from.o}] should be in the center of coordinates [0,0]`);
    }
    return [...linearM, ...shift]; // m * fromPoint => toPoint
  };

//endregion Complex transforms

}

const ACCURACY = 0.0001;


export {
  M as WebMatrix
}

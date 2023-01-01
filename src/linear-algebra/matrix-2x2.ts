import {Tuple2, Tuple4} from '../contract'
import {IMatrix} from './contract'
import {IPoint} from '../geometry'

export class Matrix2x2 {

  static invert(m: IMatrix): Tuple4 {
    const det = m[0] * m[3] - m[1] * m[2];
    if (det === 0) // matrix is not invertible
      throw new Error(`can't invert matrix ${m} because determinant is 0`)
    return [
      m[3] / det,
      m[1] / det * (-1),
      m[2] / det * (-1),
      m[0] / det,
    ];
  }

  /*
 * Multiply two matrix:
 *   a1 c1   a2 c2   a1*a2+c1*b2  a1*c2+c1*d2
 *         x       =
 *   b1 d1   b2 d2   b1*a2+d1*b2  b1*c2+d1*d2
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#Transformation_functions
 * https://en.wikipedia.org/wiki/Matrix_multiplication
 */
  static multiply = (m1: IMatrix, m2: IMatrix): Tuple4 => [
    m1[0] * m2[0] + m1[2] * m2[1], // a
    m1[1] * m2[0] + m1[3] * m2[1], // b
    m1[0] * m2[2] + m1[2] * m2[3], // c
    m1[1] * m2[2] + m1[3] * m2[3], // d
  ];

  /*
 * Apply the matrix to the point:
 *
 *   a c     x     a*x+c*y
 *        *     =
 *   b d     y     b*x+d*y
 *
 */
  static apply = (m: IMatrix, p: IPoint): Tuple2 => [
    m[0] * p[0] + m[2] * p[1],
    m[1] * p[0] + m[3] * p[1]
  ];

  static isEqual = (m1: IMatrix, m2: IMatrix, accuracy = 0.0001): boolean =>
    Math.abs(m1[0] - m2[0]) < accuracy &&
    Math.abs(m1[1] - m2[1]) < accuracy &&
    Math.abs(m1[2] - m2[2]) < accuracy &&
    Math.abs(m1[3] - m2[3]) < accuracy
  ;

}

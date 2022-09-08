import {M2x2} from './contract';
import {TPoint} from '../geometry';

export class Matrix2x2 {

  static invert(m: M2x2): M2x2 {
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
  static multiply = (m1: M2x2, m2: M2x2): M2x2 => [
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
  static apply = (m: M2x2, p: TPoint): TPoint => [
    m[0] * p[0] + m[2] * p[1],
    m[1] * p[0] + m[3] * p[1]
  ];

  static isEqual = (m1: M2x2, m2: M2x2): boolean =>
    Math.abs(m1[0] - m2[0]) < ACCURACY &&
    Math.abs(m1[1] - m2[1]) < ACCURACY &&
    Math.abs(m1[2] - m2[2]) < ACCURACY &&
    Math.abs(m1[3] - m2[3]) < ACCURACY
  ;

}

const ACCURACY = 0.0001;
